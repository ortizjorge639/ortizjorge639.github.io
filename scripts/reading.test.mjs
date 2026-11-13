import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as reading from './build-reading.mjs';
const catalog = JSON.parse(await readFile(new URL('../src/project-catalog.json', import.meta.url), 'utf8'));

test('generator rejects traversal, unsafe links, duplicate slugs and missing evidence before writing', () => {
  assert.equal(typeof reading.validateCatalog, 'function', 'build generator must validate the shared public catalog');
  assert.doesNotThrow(()=>reading.validateCatalog(catalog));
  for(const mutate of [
    p=>p.id='../outside',
    p=>p.site='javascript:alert(1)',
    p=>p.repo='https://user:password@github.com/account/repo',
    p=>p.sources[0].url='data:text/html,test',
    p=>p.sources=[],
  ]) {
    const clone=structuredClone(catalog); mutate(clone[0]);
    assert.throws(()=>reading.validateCatalog(clone));
  }
  assert.throws(()=>reading.validateCatalog([catalog[0],catalog[0]]));
});

test('individual contribution remains explicitly unverified when source evidence establishes only the artifact',()=>{
  for(const p of catalog) {
    assert.match(p.contribution,/individual role (?:is )?unverified/i,p.id);
    assert.match(reading.renderPage(catalog,p),/individual role (?:is )?unverified/i,p.id);
  }
  assert.match(catalog.find(p=>p.id==='repoquest').contribution,/upstream.*qwibitai\/repoquest/i);
});

test('rendered project copy and source labels cannot become executable markup', () => {
  const clone=structuredClone(catalog);
  const p=clone[0];
  p.title='<img src=x onerror=alert(1)>';
  p.description='</p><script>window.injected=true</script>';
  p.sources[0].label='<svg onload=alert(1)>';
  const html=reading.renderPage(clone,p);
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes('<script>window.injected'));
  assert.ok(!html.includes('<svg onload='));
});
