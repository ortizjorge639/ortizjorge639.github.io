import nodeTest from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projects, repoUrl } from '../src/projects.ts';
import { projectStories } from '../src/stories.ts';
import * as sources from './guide-sources.mjs';
import * as refresh from './refresh-guide-sources.mjs';
import { renderPage, validateCatalog } from './build-reading.mjs';
import { validateStories } from './validate-stories.mjs';

const snapshot = () => readFile(new URL('../data/guide-sources.json', import.meta.url), 'utf8').then(JSON.parse);
for (const id of ['inventory-data-assistant', 'document-evidence-pipeline', 'custom-model-auth-diagnostics']) {
const test = (name, fn) => nodeTest(`${id}: ${name}`, fn);
const url = `https://ortizjorge639.github.io/case-studies/${id}.md`;

test('curated inventory narrative is public evidence without repository eligibility', async () => {
  const p = projects.find(p => p.id === id);
  assert.ok(p, 'sanitized inventory project exists');
  assert.equal(p.repo, '');
  assert.equal(repoUrl(p), '');
  assert.equal(p.site, url);
  assert.deepEqual(p.sources.map(s => s.url), [url]);
  const data = await snapshot();
  const source = data.sources.find(s => s.projectId === id);
  assert.equal(source.sourceType, 'curated-case-study');
  for (const field of ['repo', 'commit', 'path']) assert.equal(source[field], undefined);
  const loaded = await sources.loadSources(data);
  const chunks = loaded.chunks.filter(c => c.projectId === id);
  assert.ok(chunks.some(c => c.url === url));
  assert.ok(chunks.every(c => !c.url.includes('github.com/')));
  const html = renderPage(projects, p);
  assert.match(html, /sanitized narrative/i);
  assert.match(html, /not.*public code inspection/i);
  assert.doesNotMatch(html, />Public repository</);
  const story = projectStories[id];
  assert.equal(story.scenes.reduce((n, s) => n + s.duration, 0), 50);
  assert.equal(story.scenes[2].visual.type, 'flow');
  assert.match(JSON.stringify(story), /fictional/i);
  assert.match(source.text, /not.*measured|not fresh|not.*freshly/i);
});

test('curated refresh retains the original narrative without any request', async () => {
  const data = await snapshot();
  const p = projects.find(p => p.id === id);
  const original = data.sources.find(s => s.projectId === id);
  let calls = 0;
  const request = async () => { calls++; throw Error('Must never fetch curated code or URLs'); };
  assert.deepEqual(await refresh.refreshProjectSource(p, data.sources, request), original);
  for (const mutate of [
    p => { p.repo = 'https://github.com/ortizjorge639/fabricated-private-example'; },
    p => { p.id = 'unapproved-narrative'; },
    p => { p.site = `${url}?redirect=elsewhere`; },
    p => { p.sourceType = undefined; },
  ]) {
    const changed = structuredClone(p); mutate(changed);
    await assert.rejects(refresh.refreshProjectSource(changed, data.sources, request));
  }
  await assert.rejects(refresh.refreshProjectSource(p, [], request));
  assert.equal(calls, 0);
});

test('curated provenance, exact URL, content hash and sections are mandatory', async () => {
  for (const mutate of [
    s => { s.sourceType = 'unknown-source'; },
    s => { delete s.sourceType; },
    s => { s.sourceType = 'public-page'; },
    s => { s.url = 'https://example.com/narrative.md'; },
    s => { s.url = `${url}#extra`; },
    s => { s.provenance = 'public-code-inspection'; },
    s => { s.visibility = 'private'; },
    s => { s.repo = 'ortizjorge639/fabricated-private-example'; },
    s => { s.commit = 'a'.repeat(40); },
    s => { s.path = 'README.md'; },
    s => { s.text += '\nchanged'; },
    s => { s.sha = '0'.repeat(40); },
    s => { s.sections[0].text = 'changed'; },
    s => { s.projectId = 'unapproved-narrative'; },
  ]) {
    const data = await snapshot(); mutate(data.sources.find(s => s.projectId === id));
    await assert.rejects(sources.loadSources(data), { code: 'source_error' });
  }
});

test('public repository metadata must verify public visibility before commit or README fetch', async () => {
  const p = projects.find(p => p.id === 'repoquest');
  for (const metadata of [
    { private: true, visibility: 'private', full_name: 'ortizjorge639/repoquest' },
    { private: false, visibility: 'internal', full_name: 'ortizjorge639/repoquest' },
    { private: false, visibility: 'public', full_name: 'ortizjorge639/different-example' },
    { visibility: 'public', full_name: 'ortizjorge639/repoquest' },
  ]) {
    const calls = [];
    await assert.rejects(refresh.refreshProjectSource(p, [], async path => { calls.push(path); return metadata; }), /not verified public/);
    assert.deepEqual(calls, ['repos/ortizjorge639/repoquest']);
  }
});

test('curated catalog and story cannot acquire private repository links or arbitrary narrative URLs', () => {
  for (const mutate of [
    p => { p.repo = 'https://github.com/ortizjorge639/fabricated-private-example'; },
    p => { p.sourceType = 'unknown-source'; },
    p => { delete p.sourceType; },
    p => { p.sources[0].url = 'https://example.com/narrative.md'; },
    p => { p.sources.push({ ...p.sources[0] }); },
  ]) {
    const catalog = structuredClone(projects); mutate(catalog.find(p => p.id === id));
    assert.throws(() => validateCatalog(catalog));
  }
  for (const bad of [
    'https://github.com/ortizjorge639/fabricated-private-example/blob/' + 'a'.repeat(40) + '/README.md',
    'https://github.com/ortizjorge639/inventory-data-assistant/blob/' + 'a'.repeat(40) + '/README.md',
    `${url}?redirect=elsewhere`, 'https://example.com/narrative.md',
  ]) {
    const stories = structuredClone(projectStories); stories[id].sources[0].url = bad;
    assert.ok(validateStories(stories, projects).length);
  }
});
}
