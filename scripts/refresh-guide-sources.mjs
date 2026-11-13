import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { mkdir, writeFile, rename, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/projects.ts';
import { splitSections, loadSources } from './guide-sources.mjs';
import { approvedRepository, validateCuratedProject } from './source-policy.mjs';

const exec = promisify(execFile);
async function api(path) {
  try {
    const { stdout } = await exec('gh', ['api', '--hostname', 'github.com', path], { timeout: 30_000, maxBuffer: 512_000 });
    return JSON.parse(stdout);
  } catch {
    throw new Error(`GitHub source request failed (missing source, access denied, or network error): ${path}`);
  }
}

// Called only after snapshot integrity validation. Injectable API keeps policy tests offline.
export async function refreshProjectSource(project, previousSources, request = api) {
  const retained = previousSources.find(source => source.projectId === project.id &&
    ['public-page', 'curated-case-study'].includes(source.sourceType));
  if (project.sourceType === 'curated-case-study') {
    validateCuratedProject(project, retained?.url);
    if (retained?.sourceType !== 'curated-case-study' || retained.provenance !== 'author-written-sanitized-narrative' ||
        ['repo', 'commit', 'path'].some(key => Object.hasOwn(retained, key))) throw new Error('Invalid curated provenance');
    return retained; // No repository lookup, URL fetch or new review date.
  }
  if (retained) {
    const approved = ['https://v0-just-play-app.vercel.app/about', 'https://firstmind.app', 'https://getflowlog.lovable.app'];
    if (retained.sourceType !== 'public-page' || !approved.includes(retained.url) || retained.url !== project.site ||
        !project.sources?.some(s => s.url === retained.url)) throw new Error('Unapproved public page');
    return retained;
  }
  const repo = approvedRepository(project);
  const metadata = await request(`repos/${repo}`);
  if (metadata.private !== false || metadata.visibility !== 'public' || metadata.full_name !== repo) {
    throw new Error(`Source is not verified public: ${repo}`);
  }
  const commit = await request(`repos/${repo}/commits/${encodeURIComponent(metadata.default_branch)}`);
  if (!/^[a-f0-9]{40}$/.test(commit.sha)) throw new Error(`Missing source commit: ${repo}`);
  const readme = await request(`repos/${repo}/readme?ref=${commit.sha}`);
  if (readme.encoding !== 'base64' || !readme.content || readme.size > 131_072) {
    throw new Error(`Missing or oversized README: ${repo}`);
  }
  const content = Buffer.from(readme.content.replace(/\s/g, ''), 'base64');
  const sha = createHash('sha1').update(`blob ${content.length}\0`).update(content).digest('hex');
  if (sha !== readme.sha || content.length !== readme.size) throw new Error(`README integrity failure: ${repo}`);
  const text = content.toString('utf8');
  return { projectId: project.id, title: project.title, repo, visibility: 'public',
    commit: commit.sha, path: readme.path, sha, retrievedAt: new Date().toISOString(),
    text, sections: splitSections(text, project.id) };
}

export async function refreshSources() {
  await loadSources(); // Verify integrity and exact approvals before retaining any source.
  const previous = JSON.parse(await readFile(new URL('../data/guide-sources.json', import.meta.url), 'utf8'));
  const sources = [];
  for (const project of projects) {
    const source = await refreshProjectSource(project, previous.sources);
    sources.push(source);
    console.log(source.sourceType ? `Retained approved ${source.sourceType}: ${project.id}; original review date unchanged.` : `Pinned public README: ${source.repo} @ ${source.commit.slice(0, 12)}`);
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
