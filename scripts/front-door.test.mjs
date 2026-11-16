import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildFrontDoor } from './build-front-door.mjs';

const source = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('landing contains static identity and real entrances, independent of app and guide bundles', async () => {
  const html = await source('landing-shell.html');
  const entry = await source('src/landing-entry.ts');
  assert.match(html, /Jorge Ortiz Flores/);
  assert.match(html, /2026–2027/);
  assert.match(html, /<h1>Hi, I’m Jorge!<\/h1>/);
  assert.match(html, /href="\/read\/"/);
  assert.match(html, /href="\/sketchbook\/#home"/);
  assert.match(html, /https:\/\/github.com\/ortizjorge639/);
  assert.match(html, /https:\/\/www.linkedin.com\/in\/jorgeortizflores\//);
  assert.doesNotMatch(html, /src="[^\"]*(?:main\.ts|reading-entry\.ts|guide\.ts)"/);
  assert.doesNotMatch(entry, /^import\s/m, 'only a user-triggered dynamic import is allowed');
  assert.match(entry, /await import\('\.\/landing-guide'\)/);
  assert.match(html, /location\.replace\('\/sketchbook\/' \+ location\.search \+ location\.hash\)/);
  assert.ok(html.indexOf('location.replace') < html.indexOf('rel="stylesheet"'), 'legacy redirects must not wait for styles or fonts');
  const enhancement = await source('src/landing-guide.ts');
  const reading = await source('scripts/build-reading.mjs');
  assert.match(reading, /link\('\/sketchbook\/#home','Sketchbook ↗'\)/);
  assert.match(reading, /link\('\/sketchbook\/#home','Back to play ↗'\)/);
  assert.match(reading, /link\('\/','Home'\)/);
  assert.match(enhancement, /setupStudioGuide/);
  assert.match(enhancement, /audio\.setEnabled\(false, false\)/);
  assert.doesNotMatch(enhancement, /fetch\(|\/api\/guide/);
});

test('postbuild preserves the exact sketchbook and publishes the separate landing', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-front-door-'));
  try {
    await mkdir(join(root, 'dist/assets'), { recursive: true });
    await mkdir(join(root, 'dist/read'), { recursive: true });
    const sketchbook = '<main id="app"></main><div id="entry-screen"></div><script src="/assets/main-fixture.js"></script>';
    const landing = '<main id="landing-content"><a href="/sketchbook/#home">Sketchbook</a></main>';
    await writeFile(join(root, 'dist/index.html'), sketchbook);
    await writeFile(join(root, 'dist/landing-shell.html'), landing);
    await writeFile(join(root, 'dist/read/index.html'), 'existing reading output');
    await writeFile(join(root, 'dist/assets/main-fixture.js'), 'existing sketchbook asset');
    await buildFrontDoor(root);
    assert.equal(await readFile(join(root, 'dist/sketchbook/index.html'), 'utf8'), sketchbook);
    assert.equal(await readFile(join(root, 'dist/index.html'), 'utf8'), landing);
    assert.equal(await readFile(join(root, 'dist/read/index.html'), 'utf8'), 'existing reading output');
    assert.equal(await readFile(join(root, 'dist/assets/main-fixture.js'), 'utf8'), 'existing sketchbook asset');
    await assert.rejects(access(join(root, 'dist/landing-shell.html')));
    // Never let an accidental second invocation copy the landing over the app.
    await assert.rejects(buildFrontDoor(root));
    assert.equal(await readFile(join(root, 'dist/sketchbook/index.html'), 'utf8'), sketchbook);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('missing or malformed front door never replaces the existing sketchbook', async () => {
  const root = await mkdtemp(join(tmpdir(), 'portfolio-front-door-missing-'));
  try {
    await mkdir(join(root, 'dist'));
    const sketchbook = '<div id="app"></div><div id="entry-screen"></div>';
    await writeFile(join(root, 'dist/index.html'), sketchbook);
    await assert.rejects(buildFrontDoor(root));
    await writeFile(join(root, 'dist/landing-shell.html'), 'incomplete output');
    await assert.rejects(buildFrontDoor(root), /Missing built front door/);
    assert.equal(await readFile(join(root, 'dist/index.html'), 'utf8'), sketchbook);
    await assert.rejects(access(join(root, 'dist/sketchbook/index.html')));
  } finally { await rm(root, { recursive: true, force: true }); }
});
