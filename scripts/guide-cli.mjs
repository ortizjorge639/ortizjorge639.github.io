import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, rm, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, delimiter } from 'node:path';
import { GuideError } from './guide-sources.mjs';

export const CLI_FLAGS = [
  '--silent', '--output-format=json', '--stream=off',
  // An empty CLI allowlist is normalized to undefined. A nonmatching name is fail-closed.
  '--available-tools', '__portfolio_no_tools__', '--excluded-tools', '*',
  '--deny-tool', 'shell', 'write', 'url',
  '--disable-builtin-mcps', '--no-custom-instructions', '--no-ask-user',
  '--no-remote', '--no-remote-export', '--no-auto-update', '--log-level=none',
  '--disallow-temp-dir', '--no-color',
];
export const OUTPUT_LIMIT = 128_000;

export async function findCli() {
  for (const directory of (process.env.PATH || '').split(delimiter).filter(Boolean)) {
    const candidate = join(directory, 'copilot');
    try { await access(candidate, constants.X_OK); return candidate; } catch (error) {
      if (!['ENOENT', 'EACCES', 'ENOTDIR'].includes(error.code)) throw error;
    }
  }
  return null;
}

export function isolatedEnvironment(root, inherited = process.env) {
  const env = { PATH: inherited.PATH || '/usr/local/bin:/usr/bin:/bin', HOME: root,
    COPILOT_HOME: join(root, 'config'), XDG_CONFIG_HOME: join(root, 'xdg'),
    XDG_CACHE_HOME: join(root, 'cache'), TMPDIR: join(root, 'tmp'),
    LANG: 'en_US.UTF-8', NO_COLOR: '1', DO_NOT_TRACK: '1', OTEL_SDK_DISABLED: 'true' };
  for (const key of ['COPILOT_GITHUB_TOKEN', 'GH_TOKEN', 'GITHUB_TOKEN']) {
    if (inherited[key]) env[key] = inherited[key];
  }
  return env;
}

function invalidOutput() {
  return new GuideError('invalid_response', 'The guide returned an invalid response. Please try again.', 502);
}

export function parseCliOutput(stdout) {
  if (Buffer.byteLength(stdout) > OUTPUT_LIMIT) throw invalidOutput();
  let content = null, finished = false;
  try {
    for (const line of stdout.split('\n').filter(line => line.trim())) {
      const event = JSON.parse(line);
      if (typeof event.type !== 'string') throw invalidOutput();
      if (event.type.startsWith('tool.') || event.data?.toolRequests?.length ||
          event.type === 'session.error' || event.type === 'error') throw invalidOutput();
      if (event.type === 'session.mcp_servers_loaded' &&
          (!Array.isArray(event.data?.servers) || event.data.servers.some(server => server.status !== 'disabled'))) throw invalidOutput();
      if (event.type === 'assistant.message' && typeof event.data?.content === 'string') content = event.data.content;
      if (event.type === 'result') {
        if (event.exitCode !== 0 || event.is_error === true) throw invalidOutput();
        if (typeof event.result === 'string') content = event.result;
        finished = true;
      }
    }
    if (!finished || !content) throw invalidOutput();
    const fenced = /^```(?:json)?\s*\n([\s\S]*?)\n```\s*$/.exec(content.trim());
    return JSON.parse(fenced ? fenced[1] : content);
  } catch { throw invalidOutput(); }
}

export async function executeCli(prompt, { signal, cliPath, timeoutMs = 90_000, spawnProcess = spawn, onWorkspace } = {}) {
  if (signal?.aborted) throw new GuideError('timeout', 'The guide request was cancelled.', 408);
  const binary = cliPath || await findCli();
  if (!binary) throw new GuideError('unavailable', 'Copilot CLI is not installed on this machine.', 503);
  const root = await mkdtemp(join(tmpdir(), 'portfolio-guide-'));
  try {
    await Promise.all(['config', 'xdg', 'cache', 'tmp', 'work'].map(name => mkdir(join(root, name))));
    onWorkspace?.(root);
    return await new Promise((resolve, reject) => {
      let stdout = '', stderrBytes = 0, failure = null, killTimer, timer;
      const child = spawnProcess(binary, [...CLI_FLAGS, '--prompt', prompt], {
        cwd: join(root, 'work'), env: isolatedEnvironment(root), shell: false,
        detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'],
      });
      const kill = signalName => {
        if (!child.pid) return;
        try {
          if (process.platform === 'win32') child.kill(signalName);
          else process.kill(-child.pid, signalName);
        } catch (error) { if (error.code !== 'ESRCH') console.error('guide: process_cleanup_error'); }
      };
      const stop = error => {
        if (failure) return;
        failure = error;
        kill('SIGTERM');
        killTimer = setTimeout(() => kill('SIGKILL'), 250);
      };
      const abort = () => stop(new GuideError('timeout', 'The guide request was cancelled.', 408));
      signal?.addEventListener('abort', abort, { once: true });
      timer = setTimeout(() => stop(new GuideError('timeout', 'Copilot did not answer within the request deadline.', 504)), timeoutMs);
      if (signal?.aborted) abort();
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', data => {
        if (failure) return;
        stdout += data.toString();
        if (Buffer.byteLength(stdout) > OUTPUT_LIMIT) stop(invalidOutput());
      });
      child.stderr.on('data', data => {
        stderrBytes += data.length;
        if (stderrBytes > OUTPUT_LIMIT) stop(invalidOutput());
      });
      child.on('error', () => {
        failure = new GuideError('unavailable', 'Copilot CLI could not be started.', 503);
      });
      child.on('close', code => {
        clearTimeout(timer);
        clearTimeout(killTimer);
        signal?.removeEventListener('abort', abort);
        // Clean up descendants even when the CLI parent exits first.
        kill('SIGKILL');
        if (failure) return reject(failure);
        if (code !== 0) return reject(new GuideError('unavailable', 'Isolated Copilot CLI could not answer. Check local Copilot authentication and access; provide COPILOT_GITHUB_TOKEN or GH_TOKEN if isolated native authentication is unavailable.', 503));
        try { resolve(parseCliOutput(stdout)); } catch (error) { reject(error); }
      });
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
