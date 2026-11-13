import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, rename, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/projects.ts';
import { splitSections, loadSources } from './guide-sources.mjs';

const exec = promisify(execFile);
async function api(path) {
  try {
    const { stdout } = await exec('gh', ['api', '--hostname', 'github.com', path], { timeout: 30_000, maxBuffer: 512_000 });
    return JSON.parse(stdout);
  } catch {
    throw new Error(`GitHub source request failed (missing source, access denied, or network error): ${path}`);
  }
}

export async function refreshSources() {
  await loadSources(); // Verify existing approved-page integrity before retaining it.
  const previous = JSON.parse(await readFile(new URL('../data/guide-sources.json', import.meta.url), 'utf8'));
  const sources = [];
  for (const project of projects) {
    const retained = previous.sources.find(source => source.projectId === project.id && source.sourceType === 'public-page');
    if (retained) {
      sources.push(retained); // Keep the original excerpt date; a refresh is not a new browser review.
      console.log(`Retained approved public-page excerpt: ${project.id}; manual public-only review required for changes.`);
      continue;
    }
    const repo = project.repo?.replace('https://github.com/', '') ?? `ortizjorge639/${project.id}`;
    if (!/^ortizjorge639\/[a-z0-9-]+$/.test(repo)) throw new Error('No approved public repository');
    const metadata = await api(`repos/${repo}`);
    if (metadata.private !== false || metadata.visibility !== 'public' || metadata.full_name !== repo) {
      throw new Error(`Source is not verified public: ${repo}`);
    }
    const commit = await api(`repos/${repo}/commits/${encodeURIComponent(metadata.default_branch)}`);
    if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error(`Missing source commit: ${repo}`);
    const readme = await api(`repos/${repo}/readme?ref=${commit.sha}`);
    if (readme.encoding !== 'base64' || !readme.content || readme.size > 131_072) {
      throw new Error(`Missing or oversized README: ${repo}`);
    }
    const content = Buffer.from(readme.content.replace(/\s/g, ''), 'base64');
    const sha = createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
    if (sha !== readme.sha || content.length !== readme.size) throw new Error(`README integrity failure: ${repo}`);
    const text = content.toString('utf8');
    sources.push({
      projectId: project.id, title: project.title, repo, visibility: 'public',
      commit: commit.sha, path: readme.path, sha, retrievedAt: new Date().toISOString(),
      text, sections: splitSections(text, project.id),
    });
    console.log(`Pinned public README: ${repo} @ ${commit.sha.slice(0, 12)}`);
  }
  const target = new URL('../data/guide-sources.json', import.meta.url);
  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  const staging = new URL('../data/guide-sources.json.pending', import.meta.url);
  await writeFile(staging, `${JSON.stringify({ version: 1, retrievedAt: new Date().toISOString(), sources }, null, 2)}\n`);
  await rename(staging, target);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  refreshSources().catch(error => {
    console.error(`Source refresh failed: ${error.message}. Existing snapshot unchanged.`);
    process.exitCode = 1;
  });
}
