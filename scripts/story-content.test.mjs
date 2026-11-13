import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { projects } from '../src/projects.ts';
import { projectStories } from '../src/stories.ts';
import { validateStories } from './validate-stories.mjs';

const fresh = () => structuredClone(projectStories);
const scene = (stories, index = 0) => stories.repoquest.scenes[index];
const copy = projectId => JSON.stringify(projectStories[projectId]);
const rejects = (mutate, expected) => {
  const stories = fresh();
  mutate(stories);
  assert.match(validateStories(stories, projects).join('\n'), expected);
};

test('all canonical catalog stories have six ordered beats and 45–60 second runtimes', () => {
  assert.equal(projects.length, 12);
  assert.deepEqual(validateStories(projectStories, projects), []);
  assert.deepEqual(Object.keys(projectStories).sort(), projects.map(project => project.id).sort());
  const scenes = Object.values(projectStories).flatMap(story => story.scenes);
  assert.equal(scenes.length, projects.length * 6);
  for (const story of Object.values(projectStories)) {
    assert.deepEqual(story.scenes.map(scene => scene.beat), ['need', 'approach', 'flow', 'build', 'details', 'use']);
    assert.equal(story.scenes.reduce((sum, scene) => sum + scene.duration, 0), 50);
    assert.ok(story.scenes.every(scene => scene.body.length <= 180));
  }
});

test('meeting story covers current live context and summaries with pinned public evidence', () => {
  const story = projectStories['bot-meetings-dotnet'];
  const text = copy('bot-meetings-dotnet');
  assert.match(text, /finalized captions/i);
  assert.match(text, /ended captions/i);
  assert.match(text, /rolling and meeting-to-date summaries/i);
  assert.match(text, /disabled by default/i);
  assert.match(text, /omitted a corrected value/i);
  assert.ok(story.sources.some(source => source.url.endsWith('/docs/scheduled-summaries.md')));
});

test('sources match the pinned public README snapshots', () => {
  const snapshot = JSON.parse(readFileSync(new URL('../data/guide-sources.json', import.meta.url), 'utf8'));
  for (const [projectId, story] of Object.entries(projectStories)) {
    const source = snapshot.sources.find(source => source.projectId === projectId);
    assert.equal(source.visibility, 'public');
    assert.equal(story.sources[0].url, ['public-page', 'curated-case-study'].includes(source.sourceType) ? source.url : `https://github.com/${source.repo}/blob/${source.commit}/${source.path}`);
    assert.ok(story.scenes.every(scene => scene.sources.includes(story.sources[0].id)));
  }
});

test('stories retain project-specific limitations rather than implying shipped outcomes', () => {
  assert.match(copy('weekend-batch'), /manual/i);
  assert.match(copy('weekend-batch'), /asynchronous/);
  assert.match(copy('weekend-batch'), /updates\.json/);
  assert.match(copy('web-context-graph'), /localhost/);
  assert.match(copy('web-context-graph'), /not a hosted multi-user/);
  assert.match(copy('web-context-graph'), /without content from sibling/);
  assert.match(copy('bot-meetings-dotnet'), /tenant admin consent/);
  assert.match(copy('bot-meetings-dotnet'), /transcript access policy/);
  assert.match(copy('bot-meetings-dotnet'), /service configuration/);
  assert.match(copy('mcreator-workspace-harness'), /regeneration/i);
  assert.match(copy('mcreator-workspace-harness'), /not an official MCreator automation API/);
  assert.match(copy('reset-canvas'), /no remote backend/);
  assert.match(copy('reset-canvas'), /browser origin/);
  assert.match(copy('just-play'), /V2 is still in progress/);
  assert.match(copy('just-play'), /Supabase and IGDB credentials/);
  assert.match(copy('repoquest'), /tutorial artifact/);
  assert.match(copy('repoquest'), /not a running copy/);
  for (const story of Object.values(projectStories)) {
    for (const scene of story.scenes) {
      assert.doesNotMatch(`${scene.headline} ${scene.body}`, /problem statement|proposed solution|what you['’]?ll learn|original sketch/i);
    }
  }
});

test('meeting preview final body and outcome both restrict use to non-sensitive tests',()=>{
  const final=projectStories['bot-meetings-dotnet'].scenes.at(-1);
  for(const copy of [final.body,final.visual.result]) {
    assert.match(copy,/preview.*not production-ready/i);
    assert.match(copy,/non-sensitive test meetings only/i);
    assert.doesNotMatch(copy,/before using real meeting transcripts/i);
  }
});

test('rejects missing, unmatched, and mis-keyed stories', () => {
  rejects(stories => { delete stories.repoquest; }, /repoquest: missing story/);
  rejects(stories => { stories.unapproved = structuredClone(stories.repoquest); }, /unmatched story/);
  rejects(stories => { stories.repoquest.projectId = 'just-play'; }, /projectId: must match/);
});

test('rejects missing or reordered beats and incorrect visual types for a beat', () => {
  rejects(stories => { stories.repoquest.scenes.pop(); }, /scenes: must contain 6–6/);
  rejects(stories => { scene(stories).beat = 'use'; }, /beat: expected "need"/);
  rejects(stories => { scene(stories).visual = { type: 'outcome', result: 'Valid text' }; }, /need requires contrast/);
});

test('rejects duplicate scene, source, reference, and node IDs', () => {
  rejects(stories => { scene(stories, 1).id = scene(stories).id; }, /duplicate ID/);
  rejects(stories => { stories.repoquest.sources.push({ ...stories.repoquest.sources[0] }); }, /duplicate ID/);
  rejects(stories => { scene(stories).sources.push(scene(stories).sources[0]); }, /duplicate ID/);
  rejects(stories => { scene(stories, 2).visual.nodes[1].id = scene(stories, 2).visual.nodes[0].id; }, /duplicate ID/);
  rejects(stories => { scene(stories).id = 'Invalid ID'; }, /lowercase hyphen/);
});

test('rejects unsafe, unpinned, unapproved, and disguised source URLs', () => {
  const good = projectStories.repoquest.sources[0].url;
  for (const url of [
    'javascript:alert(1)',
    'https://example.com/README.md',
    good.replace('https:', 'http:'),
    good.replace('github.com/', 'github.com.evil.example/'),
    good.replace('repoquest/blob/', 'unapproved/blob/'),
    good.replace(/blob\/[a-f0-9]{40}\//, 'blob/main/'),
    good.replace('README.md', '../README.md'),
    good.replace('README.md', '%2e%2e/README.md'),
    'https://ortizjorge639.github.io.evil.example/',
    'https://ortizjorge639.github.io/?redirect=https://example.com',
  ]) {
    rejects(stories => { stories.repoquest.sources[0].url = url; }, /pinned 40-SHA GitHub blob/);
  }
  const stories = fresh();
  stories.repoquest.sources[0].url = 'https://ortizjorge639.github.io/';
  assert.deepEqual(validateStories(stories, projects), []);
});

test('rejects missing or unknown source references', () => {
  rejects(stories => { scene(stories).sources = []; }, /sources: must contain/);
  rejects(stories => { scene(stories).sources = ['unknown-source']; }, /declared source ID/);
  rejects(stories => { stories.repoquest.sources[0].id = ''; }, /nonempty text/);
});

test('rejects dangling, self, duplicate, and absent flow edges', () => {
  rejects(stories => { scene(stories, 2).visual.edges[0].to = 'absent-node'; }, /existing node/);
  rejects(stories => {
    const edge = scene(stories, 2).visual.edges[0];
    edge.to = edge.from;
  }, /self edges/);
  rejects(stories => {
    const edges = scene(stories, 2).visual.edges;
    edges.push({ ...edges[0] });
  }, /duplicate edge/);
  rejects(stories => { scene(stories, 2).visual.edges = []; }, /edges: must contain/);
});

test('rejects invalid scene and total durations without substituting defaults', () => {
  for (const duration of [NaN, Infinity, -1, 0, 2.9, 20.1, '8', undefined]) {
    rejects(stories => { scene(stories).duration = duration; }, /duration: must be a finite number/);
  }
  for (const duration of [3, 20]) {
    rejects(stories => { stories.repoquest.scenes.forEach(scene => { scene.duration = duration; }); }, /total duration/);
  }
});

test('flow diagrams support three to five nodes in reading order', () => {
  const stories = fresh();
  scene(stories, 2).visual = {
    type: 'flow',
    nodes: [
      { id: 'files', label: 'Files', detail: 'Local repository' },
      { id: 'cli', label: 'CLI', detail: 'Parse and generate' },
      { id: 'html', label: 'HTML', detail: 'Tutorial artifact' },
    ],
    edges: [{ from: 'files', to: 'cli' }, { from: 'cli', to: 'html' }],
  };
  assert.deepEqual(validateStories(stories, projects), []);
  rejects(stories => {
    scene(stories, 2).visual.nodes.push({ id: 'extra', label: 'Extra', detail: 'Exceeds five nodes' });
  }, /nodes: must contain 3–5/);
});

test('rejects oversized or empty copy and excessive visual items', () => {
  rejects(stories => { scene(stories).headline = 'x'.repeat(81); }, /headline:.*80 characters/);
  rejects(stories => { scene(stories).body = 'x'.repeat(401); }, /body:.*400 characters/);
  rejects(stories => { scene(stories).body = '  '; }, /body: must be nonempty/);
  rejects(stories => { scene(stories).visual.before = 'x'.repeat(141); }, /before:.*140 characters/);
  rejects(stories => { scene(stories, 2).visual.nodes[0].detail = 'x'.repeat(81); }, /detail:.*80 characters/);
  rejects(stories => { scene(stories, 3).visual.items[0].role = ''; }, /role: must be nonempty/);
  rejects(stories => { scene(stories, 4).visual.items.push({ title: 'Fourth', detail: 'Too many steps' }); }, /items: must contain 1–3/);
});

test('rejects missing image alt and nonlocal or traversing image paths', () => {
  rejects(stories => { delete scene(stories, 1).visual.alt; }, /alt: must be nonempty/);
  for (const src of ['https://example.com/image.png', '/images/../secret.png', '/other/image.png', '/images/a.png?query=1']) {
    rejects(stories => { scene(stories, 1).visual.src = src; }, /local image path under \/images/);
  }
});

test('rejects unsupported visuals, malformed structures, and executable extension fields', () => {
  rejects(stories => { scene(stories).visual = { type: 'terminal', html: '<script>run()</script>' }; }, /visual.type: must be/);
  rejects(stories => { scene(stories).customJs = 'run()'; }, /customJs: unknown field/);
  rejects(stories => { scene(stories).visual.before = null; }, /before: must be nonempty/);
  rejects(stories => { scene(stories, 3).visual.items = null; }, /items: must be an array/);
  rejects(stories => { stories.repoquest.scenes = null; }, /scenes: must be an array/);
  assert.match(validateStories(null, projects).join(), /project-keyed object/);
  assert.match(validateStories({}, null).join(), /projects: must be an array/);
});

test('long-but-valid content fits the same schema without truncation', () => {
  const stories = fresh();
  const longText = length => 'Readable bounded content. '.repeat(20).slice(0, length);
  for (const story of Object.values(stories)) {
    story.sources[0].title = longText(120);
    for (const scene of story.scenes) {
      scene.headline = longText(80);
      scene.body = longText(400);
      const visual = scene.visual;
      if (visual.type === 'contrast') {
        visual.before = longText(140);
        visual.after = longText(140);
      } else if (visual.type === 'outcome') visual.result = longText(240);
      else if (visual.type === 'image') visual.alt = longText(180);
      else if (visual.type === 'flow') visual.nodes.forEach(node => {
        node.label = longText(40);
        node.detail = longText(80);
      });
      else if (visual.type === 'roles') visual.items.forEach(item => {
        item.name = longText(48);
        item.role = longText(120);
      });
      else visual.items.forEach(item => {
        item.title = longText(64);
        item.detail = longText(160);
      });
    }
  }
  const before = structuredClone(stories);
  assert.deepEqual(validateStories(stories, projects), []);
  assert.deepEqual(stories, before);
});

test('projects without screenshots use outcome or steps with no image requirement', () => {
  const stories = fresh();
  for (const story of Object.values(stories)) {
    if (story.scenes[1].visual.type === 'image') {
      story.scenes[1].visual = { type: 'outcome', result: 'A source-backed description without a screenshot.' };
    }
  }
  assert.deepEqual(validateStories(stories, projects), []);
  assert.ok(Object.values(stories).flatMap(story => story.scenes).every(scene => scene.visual.type !== 'image'));
});
