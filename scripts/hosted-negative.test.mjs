import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHostedServer} from './hosted-server.mjs';
import {parseConfig,initialLedger} from './hosted-guide.mjs';
const config=()=>parseConfig(`frog:
  enabled: true
  backend: model-api
  access: public
  model_provider: azure-openai
  endpoint: https://example.openai.azure.com/
  deployment: gpt-5-mini
  origin: https://ortizjorge639.github.io
  ledger_endpoint: https://example.documents.azure.com/dbs/frog/colls/quota/docs/global
  expires: ${new Date(Date.now()+3600000).toISOString()}
  lifetime_requests: 10
  daily_requests: 10
  lifetime_tokens: 100000
  lifetime_microusd: 100000
`);

test('inert HTTP faults never dispatch: disabled, expired, missing, mismatched, throttled, occupied and ambiguous commit',async()=>{
 for(const fault of ['disabled','expired','missing','mismatch','outage','occupied','ambiguous']) {
  const base=config(),c=fault==='expired'?{...base,expires:new Date(Date.now()-1000).toISOString()}:base;
  let value=initialLedger(c),calls=0,version=0;
  if(fault==='disabled')value.disabled=true;
  if(fault==='occupied')value.leaseUntil=Number.MAX_SAFE_INTEGER;
  if(fault==='mismatch')value.configId='mismatch';
  const store={read:async()=>{if(fault==='outage')throw Error('fixture429');return {value:fault==='missing'?null:structuredClone(value),etag:String(version)};},replace:async(next,etag)=>{assert.equal(etag,String(version));value=structuredClone(next);version++;if(fault==='ambiguous')throw Error('fixture_commit_outcome_unknown');return true;}};
  const server=createHostedServer({config:c,store,executor:async()=>{calls++;throw Error('must not dispatch');}});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));
  try {
   const response=await fetch(`http://127.0.0.1:${server.address().port}/api/guide/chat`,{method:'POST',headers:{Origin:base.origin,'Content-Type':'application/json'},body:JSON.stringify({question:'What is Just Play?',projectId:'just-play',history:[]})});
   assert.equal(response.status,fault==='occupied'?429:503,fault);assert.equal(calls,0,fault);
   assert.equal(value.requests,0,fault+' cannot consume dispatch reservation');
   if(fault==='occupied')assert.equal(value.leaseUntil,Number.MAX_SAFE_INTEGER);
   if(fault==='ambiguous')assert.equal(value.attempts,1,'uncertain committed attempt remains spent');
  }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
 }
});
