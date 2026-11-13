import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const catalog = JSON.parse(await readFile(new URL('../src/project-catalog.json', import.meta.url), 'utf8'));

test('approved landing projects are represented with current public-source boundaries', () => {
  const get = id => { const p = catalog.find(p => p.id === id); assert.ok(p, `${id} must be in shared catalog`); return p; };
  const firstmind = get('firstmind');
  assert.equal(firstmind.site, 'https://firstmind.app');
  assert.equal(firstmind.repo, '', 'do not invent a public repository for an approved landing page');
  assert.match(firstmind.note, /not.*medical|not.*clinical/i);
  assert.match(firstmind.capabilities.join(' '), /ephemeral notes/i);
  const flowlog = get('flowlog');
  assert.equal(flowlog.site, 'https://getflowlog.lovable.app');
  assert.match(flowlog.note, /403/);
  assert.match(flowlog.note, /not.*verif/i);
  const jp = get('just-play');
  assert.equal(jp.site, 'https://v0-just-play-app.vercel.app/about');
  assert.match(jp.description, /mood, energy, and time/);
  assert.match(jp.note, /in progress/i);
});

test('recent curated technical and creative projects are honest about readiness', () => {
  const broker = catalog.find(p=>p.id === 'apim-credential-broker-poc');
  assert.ok(broker, 'public APIM proof of concept included');
  assert.match(broker.note, /per-user.*not.*proven/i);
  assert.match(catalog.find(p=>p.id === 'bot-meetings-dotnet').note, /not production/i);
  assert.equal(catalog.find(p=>p.id === 'oneshottober')?.site, 'https://oneshottober.vercel.app/');
});

test('meeting copilot documents live captions and the opt-in summary pilot without production claims', () => {
  const meeting = catalog.find(p => p.id === 'bot-meetings-dotnet');
  assert.match(meeting.description, /live captions/i);
  assert.match(meeting.capabilities.join(' '), /rolling.*meeting-to-date/i);
  assert.match(meeting.how, /ended-session|ended session/i);
  assert.match(meeting.note, /disabled by default/i);
  assert.match(meeting.note, /corrected.*omitted|omitted.*corrected/i);
  assert.ok(meeting.sources.some(s => s.url.endsWith('/docs/scheduled-summaries.md')));
});

test('every project has public dated sources and explicit problem, implementation and attribution', () => {
  assert.equal(new Set(catalog.map(p=>p.id)).size, catalog.length);
  for(const p of catalog) {
    assert.match(p.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for(const key of ['problem','how','contribution']) assert.ok(p[key]?.length > 30, `${p.id}.${key}`);
    assert.equal(p.capabilities.length,3);
    assert.ok(p.sources?.length, `${p.id} must cite its actual public source`);
    for(const s of p.sources) {
      assert.equal(s.reviewed, '2026-11-13');
      const u = new URL(s.url);
      assert.equal(u.protocol,'https:');
      assert.ok(['github.com','v0-just-play-app.vercel.app','firstmind.app','getflowlog.lovable.app'].includes(u.hostname),s.url);
    }
  }
});
