import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { illustration } from '../src/art.ts';
import { storyArt } from '../src/story-art.ts';

const catalog = JSON.parse(readFileSync(new URL('../src/project-catalog.json', import.meta.url), 'utf8'));
const bespoke = {
  'inventory-data-assistant': 'inventory',
  'document-evidence-pipeline': 'evidence',
  'custom-model-auth-diagnostics': 'auth-probe',
  'gesture-conversation-lab': 'gestures',
  'coding-session-dj': 'session-dj',
  'recurrence-gated-knowledge': 'recurrence',
  'retrieval-practice-harness': 'recall',
  'synthetic-migration-pilot': 'migration',
  'source-grounded-connections': 'connections',
};
// Compare geometry, not data-symbol names: renaming reused art must not pass.
const geometry = svg => svg.slice(svg.indexOf('>') + 1, svg.lastIndexOf('</svg>'));

test('new case studies retain dedicated subject-specific illustration keys', () => {
  for (const [id, key] of Object.entries(bespoke)) {
    assert.equal(catalog.find(project => project.id === id)?.illustration, key, id);
  }
});

test('every project has unique card geometry and distinct before/after workflow geometry', () => {
  const cards = new Set();
  const pairs = new Set();
  for (const project of catalog) {
    const card = geometry(illustration(project.illustration));
    const before = geometry(storyArt(project.illustration, 'before'));
    const after = geometry(storyArt(project.illustration, 'after'));
    for (const drawing of [card, before, after]) {
      assert.match(drawing, /<(?:path|rect|circle|ellipse)\b/, project.id);
      assert.ok(!drawing.includes('undefined'), project.id);
    }
    assert.notEqual(before, after, project.id);
    assert.ok(!cards.has(card), `reused card: ${project.id}`);
    assert.ok(!pairs.has(before + after), `reused workflow: ${project.id}`);
    cards.add(card);
    pairs.add(before + after);
  }
  assert.equal(cards.size, catalog.length);
  assert.equal(pairs.size, catalog.length);
});
