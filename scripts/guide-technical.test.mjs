import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { projects } from '../src/projects.ts';
import { projectStories } from '../src/stories.ts';
import { CURATED_CASE_STUDIES, approvedRepository } from './source-policy.mjs';
import { loadSources, retrieveSources } from './guide-sources.mjs';

const ids = ['document-evidence-pipeline', 'custom-model-auth-diagnostics'];
const narrative = id => readFile(new URL(`../public/case-studies/${id}.md`, import.meta.url), 'utf8');

test('technical narratives expose only exact portfolio evidence and six source-backed 50s beats', async () => {
  const corpus = await loadSources();
  for (const id of ids) {
    const p = projects.find(p => p.id === id);
    assert.equal(p.repo, '');
    assert.throws(() => approvedRepository(p));
    assert.equal(p.sourceType, 'curated-case-study');
    assert.equal(p.site, CURATED_CASE_STUDIES[id].url);
    const story = projectStories[id];
    assert.deepEqual(story.scenes.map(s => s.beat), ['need', 'approach', 'flow', 'build', 'details', 'use']);
    assert.equal(story.scenes.length, 6);
    assert.equal(story.scenes.reduce((n, s) => n + s.duration, 0), 50);
    assert.ok(story.scenes.every(s => s.body.length <= 180 && s.sources.includes(story.sources[0].id)));
    assert.ok(story.scenes.every(s => s.visual.type !== 'image'));
    const text = JSON.stringify(p) + JSON.stringify(story) + await narrative(id);
    assert.doesNotMatch(text, /gist\.|github\.com\/|\/home\/|[a-f0-9]{40}|data:image|!\[|<img/i);
    assert.match(text, /authorship.*unverified|role unverified/i);
    assert.match(text, /redistribution|redistribut/i);
    const selected = retrieveSources(corpus, { question: p.title, projectId: id, history: [] });
    assert.ok(selected.some(c => c.projectId === id && c.url === p.site));
  }
});

test('document narrative remains technology-only and distinguishes mock, cloud and evidence boundaries', async () => {
  const id = ids[0];
  const text = await narrative(id);
  const all = text + JSON.stringify(projects.find(p => p.id === id)) + JSON.stringify(projectStories[id]);
  assert.doesNotMatch(all, /\blease\b|\blandlord\b|\btenant\b|\brent\b|\bcustomer\b|\bbusiness\b|pdf-strikethrough-extractor/i);
  for (const pattern of [/native, scanned or hybrid/i, /annotations.*vector geometry/i, /single document-level/i, /complete response is cached and reused/i, /full document to the cloud/i, /not.*local-only/i, /not.*streams partial page/i, /not global text replacement/i, /original word spans/i, /confidence is not a calibrated probability/i, /real orchestrator with mocked cloud and detector/i, /not fresh execution/i, /human.*review/i, /search-ingestion/i, /fictional.*not tested/i]) {
    assert.match(all, pattern);
  }
});

test('BYOK narrative limits historical claims and makes credential safety and cleanup explicit', async () => {
  const text = await narrative(ids[1]);
  for (const pattern of [/BYOK/, /isolated diagnostic endpoint/i, /dummy credential/i, /never echo, log or forward credential values/i, /allowlisted scheme classification/i, /arbitrary first header token/i, /not a universal claim/i, /no claim.*documentation.*absent/i, /strip the incoming client credential before backend authentication/i, /not fresh measurements/i, /none were rerun/i, /restore.*client route/i, /remove.*diagnostic endpoint/i, /not.*safe to retain indefinitely/i]) {
    assert.match(text, pattern);
  }
  assert.doesNotMatch(text, /zero blast radius|zero risk|conclusively.*confirmed/i);
});
