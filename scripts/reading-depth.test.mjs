import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { renderPage } from './build-reading.mjs';
import { readingDepth, validateDepth, renderDepth } from './reading-depth.mjs';
const catalog = JSON.parse(await readFile(new URL('../src/project-catalog.json', import.meta.url), 'utf8'));

test('every project has its own architecture, rationale, walkthrough and scoped evidence', () => {
  assert.doesNotThrow(() => validateDepth(catalog, readingDepth));
  assert.deepEqual(Object.keys(readingDepth).sort(), catalog.map(p => p.id).sort());
  for (const p of catalog) {
    const d = readingDepth[p.id];
    assert.ok(d.architecture.nodes.length >= 3, p.id);
    assert.ok(d.architecture.edges.length >= 2, p.id);
    assert.ok(d.decisions.length >= 2, p.id);
    const html = renderPage(catalog, p);
    for (const id of ['architecture','decisions','walkthrough','evidence']) assert.ok(html.includes(`id="${id}"`), `${p.id}: ${id}`);
    assert.match(html, /<figure/);
    assert.match(html, /<figcaption/);
    assert.match(html, /Illustrative walkthrough/);
    assert.match(html, /Not established/);
    assert.ok(!html.includes('<details open>'), 'static directory is collapsed without JS');
  }
});

test('unknown architecture endpoints, absent depth, missing tradeoffs and executable text are rejected or escaped', () => {
  const broken = structuredClone(readingDepth);
  delete broken[catalog[0].id];
  assert.throws(() => validateDepth(catalog, broken));
  const wrong = structuredClone(readingDepth);
  wrong[catalog[0].id].architecture.edges[0].to = 'not-a-component';
  assert.throws(() => validateDepth(catalog, wrong));
  const thin = structuredClone(readingDepth);
  thin[catalog[0].id].decisions[0].tradeoff = '';
  assert.throws(() => validateDepth(catalog, thin));
  const injected = structuredClone(readingDepth[catalog[0].id]);
  injected.architecture.nodes[0].detail = '<img src=x onerror=alert(1)>';
  injected.decisions[0].why = '</p><script>window.injected=true</script>';
  const html = renderDepth(injected);
  assert.ok(html.includes('&lt;img'));
  assert.ok(!html.includes('<script>window.injected'));
  assert.ok(!html.includes('<img src=x'));
});
