import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

test('hosted import boundary excludes every local CLI executable module',async()=>{
 const hosted=await readFile(new URL('./hosted-server.mjs',import.meta.url),'utf8');
 assert.ok(!hosted.includes("from './guide-server.mjs'"),'public listener must not import loopback CLI server');
 const input=await import('./guide-input.mjs');
 assert.equal(input.LIMITS.body,16384);
 assert.equal(input.validateInput({question:'What is Just Play?',projectId:'just-play',history:[]}).projectId,'just-play');
 assert.throws(()=>input.validateInput({question:'x',projectId:null,history:[],command:'whoami'}));
});

test('minimal host package has an explicit public-only allowlist and no CLI or private inputs',async()=>{
 const {HOST_FILES,writeHostDirectory}=await import('./package-hosted.mjs');
 assert.ok(HOST_FILES.includes('scripts/guide-input.mjs'));
 assert.ok(!HOST_FILES.some(name=>/cli|guide-server|node_modules|\.git|\.env|operator|test/.test(name)));
 const dir=await mkdtemp(path.join(tmpdir(),'frog-package-'));
 try {
  const target=path.join(dir,'host');
  const manifest=await writeHostDirectory(target,{configText:'frog:\n  enabled: false\n'});
  assert.equal(manifest.files.length,HOST_FILES.length+2);
  const {loadSources}=await import(path.join(target,'scripts/guide-sources.mjs'));
  const corpus = await loadSources();
  assert.ok(corpus.sourceCount>0,'package independently loads the real public corpus');
  const narrative = corpus.chunks.filter(c => c.projectId === 'inventory-data-assistant');
  assert.ok(narrative.some(c => c.url === 'https://ortizjorge639.github.io/case-studies/inventory-data-assistant.md'));
  assert.ok(narrative.every(c => !c.url.includes('github.com/')));
  assert.equal(JSON.parse(await readFile(path.join(target,'package.json'),'utf8')).type,'module');
  await assert.rejects(writeHostDirectory(target,{configText:'frog:\n  enabled: false\n'}),/exist/i);
 } finally {await rm(dir,{recursive:true,force:true});}
});
