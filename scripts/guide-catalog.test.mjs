import test from 'node:test';
import assert from 'node:assert/strict';
import { projects } from '../src/projects.ts';
import { projectStories } from '../src/stories.ts';
import { loadSources, retrieveSources, buildPrompt } from './guide-sources.mjs';
import { validateStories } from './validate-stories.mjs';

test('original frog retrieves every canonical public project, including approved landing-only evidence', async () => {
  const sources=await loadSources();
  assert.equal(sources.summaries.filter(s=>s.id.endsWith(':portfolio')).length,projects.length);
  for(const p of projects) {
    assert.ok(sources.chunks.some(c=>c.projectId===p.id),p.id);
    const selected=retrieveSources(sources,{question:`What does ${p.title} do?`,projectId:p.id,history:[]});
    assert.ok(selected.some(c=>c.projectId===p.id));
  }
  const fm=sources.chunks.filter(c=>c.projectId==='firstmind');
  assert.ok(fm.some(c=>c.url.startsWith('https://firstmind.app')));
  const jp=sources.chunks.filter(c=>c.projectId==='just-play').map(c=>c.text).join(' ');
  assert.ok(!jp.includes('Completed games become characters'), 'old future-state treehouse claims must not remain in current guide story');
  assert.match(jp,/mood, energy, and time/);
});

test('frog evidence and prompt carry unverified individual role and curator limitations',async()=>{
  const sources=await loadSources();
  const selected=retrieveSources(sources,{question:'What did Jorge personally build in RepoQuest?',projectId:'repoquest',history:[]});
  for(const p of projects) assert.equal(JSON.parse(selected.find(s=>s.id===`${p.id}:portfolio`).text).contribution,p.contribution);
  const prompt=buildPrompt({question:'Who built it?',projectId:'repoquest',history:[]},selected);
  assert.match(prompt,/Individual role unverified/);
  assert.match(prompt,/qwibitai\/repoquest/);
  assert.match(prompt,/curated catalog limitations take precedence/i);
});

test('all canonical projects have six valid original-feature story beats', () => {
  assert.deepEqual(validateStories(projectStories,projects),[]);
  assert.equal(Object.keys(projectStories).length,projects.length);
});
