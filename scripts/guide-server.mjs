import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/projects.ts';
import { GuideError, loadSources, retrieveSources, buildPrompt, buildCorrectionPrompt, validateAnswer } from './guide-sources.mjs';
import { executeCli, findCli } from './guide-cli.mjs';
export { buildPrompt };

export const LIMITS = { body: 16_384, question: 1200, history: 6, message: 1000, timeout: 90_000 };

export function validateInput(value) {
  const fail = () => { throw new GuideError('invalid_input', 'Send a question (1–1200 characters), a valid projectId or null, and at most six user/assistant messages (1–1000 characters each).'); };
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !['question', 'projectId', 'history'].includes(key)) ||
      typeof value.question !== 'string' || !value.question.trim() || value.question.length > LIMITS.question ||
      !(value.projectId === null || projects.some(project => project.id === value.projectId)) ||
      !Array.isArray(value.history) || value.history.length > LIMITS.history) fail();
  const history = value.history.map(message => {
    if (!message || typeof message !== 'object' || Object.keys(message).some(key => !['role', 'content'].includes(key)) ||
        !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' ||
        !message.content.trim() || message.content.length > LIMITS.message) fail();
    return { role: message.role, content: message.content };
  });
  return { question: value.question.trim(), projectId: value.projectId, history };
}

export function validateOrigin(origin) {
  let url;
  try { url = new URL(origin); } catch { throw new Error('GUIDE_ORIGIN must be an exact HTTP 127.0.0.1 origin.'); }
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || url.origin !== origin) throw new Error('GUIDE_ORIGIN must be an exact HTTP 127.0.0.1 origin.');
  return url;
}

export function validateBoundary(req, port, origin) {
  const own = `127.0.0.1:${port}`;
  const hosts = new Set([own, new URL(origin).host]);
  if (!hosts.has(req.headers.host)) throw new GuideError('invalid_input', 'This guide only accepts its configured localhost host.', 403);
  if (req.headers.origin && ![origin, `http://${own}`].includes(req.headers.origin)) throw new GuideError('invalid_input', 'This guide only accepts its configured localhost origin.', 403);
  if (req.headers['sec-fetch-site'] && !['same-origin', 'same-site', 'none'].includes(req.headers['sec-fetch-site'])) throw new GuideError('invalid_input', 'Cross-site requests are not allowed.', 403);
  if (req.headers['sec-fetch-mode'] && !['cors', 'same-origin'].includes(req.headers['sec-fetch-mode'])) throw new GuideError('invalid_input', 'This request mode is not allowed.', 403);
  if (req.headers['sec-fetch-dest'] && req.headers['sec-fetch-dest'] !== 'empty') throw new GuideError('invalid_input', 'This request destination is not allowed.', 403);
}

async function readBody(req) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type'] || '') ||
      req.headers['content-encoding']) throw new GuideError('invalid_input', 'Content-Type must be application/json without content encoding.', 415);
  if (Number(req.headers['content-length'] || 0) > LIMITS.body) throw new GuideError('invalid_input', 'Request body exceeds 16 KB.', 413);
  const parts = [];
  let size = 0;
  await new Promise((resolve, reject) => {
    const data = part => {
      size += part.length;
      if (size > LIMITS.body) {
        req.off('data', data);
        req.resume();
        reject(new GuideError('invalid_input', 'Request body exceeds 16 KB.', 413));
      } else parts.push(part);
    };
    req.on('data', data);
    req.once('end', resolve);
    req.once('error', reject);
    req.once('aborted', () => reject(new GuideError('timeout', 'The guide request was cancelled.', 408)));
  });
  try { return validateInput(JSON.parse(Buffer.concat(parts).toString('utf8'))); }
  catch (error) {
    if (error instanceof GuideError) throw error;
    throw new GuideError('invalid_input', 'Request body must be valid JSON.');
  }
}

export function createGuideServer({
  port = 43189, origin = process.env.GUIDE_ORIGIN || 'http://127.0.0.1:43190',
  executor = executeCli, sourceLoader = loadSources, cliProbe = findCli,
  deadlineMs = LIMITS.timeout, rateLimit = 10, rateWindowMs = 60_000,
} = {}) {
  validateOrigin(origin);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid guide port.');
  let active = false, authVerified = false, recent = [];
  const controllers = new Set();
  const server = createServer(async (req, res) => {
    const send = (status, value) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'", Connection: 'close' });
      res.end(JSON.stringify(value));
    };
    let controller, timer, ownsSlot = false;
    try {
      validateBoundary(req, server.address()?.port || port, origin);
      if (req.url === '/api/guide/status' && req.method === 'GET') {
        const sources = await sourceLoader();
        const cliFound = Boolean(await cliProbe());
        return send(200, { available: cliFound, mode: 'copilot-cli', sourceCount: sources.sourceCount,
          snapshotDate: sources.snapshotDate, cliFound, authVerified,
          readiness: cliFound ? (authVerified ? 'verified' : 'authentication_unverified') : 'cli_missing' });
      }
      if (req.url !== '/api/guide/chat') throw new GuideError('invalid_input', 'Unknown guide endpoint.', 404);
      if (req.method !== 'POST') throw new GuideError('invalid_input', 'Use POST with application/json.', 405);
      if (active) throw new GuideError('busy', 'The local guide is answering another question. Please wait.', 429);
      recent = recent.filter(time => Date.now() - time < rateWindowMs);
      if (recent.length >= rateLimit) throw new GuideError('rate_limited', 'The local guide has reached its request limit. Please wait a minute.', 429);
      active = ownsSlot = true;
      const deadline = Date.now() + deadlineMs;
      controller = new AbortController();
      controllers.add(controller);
      const disconnected = () => { if (!res.writableEnded) controller.abort(); };
      res.on('close', disconnected);
      req.on('aborted', disconnected);
      timer = setTimeout(() => controller.abort(), deadlineMs);
      const abortPromise = new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => reject(new GuideError('timeout', 'The guide request was cancelled or exceeded its deadline.', 504)), { once: true });
      });
      // Observe early rejection while the request body is still arriving.
      abortPromise.catch(() => {});
      const input = await Promise.race([readBody(req), abortPromise]);
      const sources = await Promise.race([sourceLoader(), abortPromise]);
      const selected = retrieveSources(sources, input);
      recent.push(Date.now());
      let prompt = buildPrompt(input, selected);
      for (let attempt = 0; attempt < 2; attempt++) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0 || controller.signal.aborted) {
          throw new GuideError('timeout', 'The guide request was cancelled or exceeded its deadline.', 504);
        }
        const execution = executor(prompt, { signal: controller.signal, timeoutMs: remainingMs });
        let result;
        try { result = await Promise.race([execution, abortPromise]); }
        finally {
          if (controller.signal.aborted) await execution.catch(() => {});
        }
        try {
          const response = validateAnswer(result, selected, input.projectId);
          authVerified = true;
          return send(200, response);
        } catch (error) {
          if (attempt !== 0 || !(error instanceof GuideError) || error.code !== 'invalid_response' || !error.reason) throw error;
          // Retry only validated answer-shape failures, never CLI/tool/isolation errors.
          console.error(`guide: answer_correction reason=${error.reason}`);
          prompt = buildCorrectionPrompt(input, selected, error.reason);
        }
      }
    } catch (error) {
      const known = error instanceof GuideError ? error : new GuideError('unavailable', 'The local guide could not complete this request.', 503);
      console.error(`guide: ${known.code}${known.reason ? ` reason=${known.reason}` : ''}`);
      send(known.status, { error: known.message, code: known.code, ...(known.reason ? { reason: known.reason } : {}) });
    } finally {
      clearTimeout(timer);
      if (controller) controllers.delete(controller);
      if (ownsSlot) active = false;
    }
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  server.timeout = deadlineMs + 1000;
  server.maxHeadersCount = 32;
  server.on('close', () => { for (const controller of controllers) controller.abort(); });
  server.abortRequests = () => { for (const controller of controllers) controller.abort(); };
  return server;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.GUIDE_PORT ? Number(process.env.GUIDE_PORT) : 43189;
  const server = createGuideServer({ port });
  server.on('error', () => { console.error('guide: startup_unavailable'); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Local guide: http://127.0.0.1:${port} (authentication verified only after a successful answer)`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
    server.abortRequests();
    server.close();
    server.closeAllConnections();
  });
}
