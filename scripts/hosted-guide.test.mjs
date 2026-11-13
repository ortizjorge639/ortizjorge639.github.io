import test from 'node:test';
import assert from 'node:assert/strict';
// Import through a namespace so RED identifies the absent implementation.
const module = await import('./hosted-guide.mjs').catch(() => ({}));

const active = () => module.parseConfig(`frog:
  enabled: true
  backend: model-api
  access: public
  model_provider: azure-openai
  endpoint: https://example.openai.azure.com/
  deployment: gpt-5-mini
  origin: https://ortizjorge639.github.io
  ledger_endpoint: https://example.documents.azure.com/dbs/frog/colls/quota/docs/global
  expires: ${new Date(Date.now()+3600_000).toISOString()}
  lifetime_requests: 2
  daily_requests: 2
  lifetime_tokens: 100000
  lifetime_microusd: 100000
`);

test('durable CAS admission survives restart, rejects competing replicas and never refunds failed dispatch', async () => {
  assert.equal(typeof module.reserve, 'function', 'durable reservation must exist');
  const config = active();
  let state = module.initialLedger(config), version = 0;
  const store = { read: async () => ({ value: structuredClone(state), etag: String(version) }), replace: async (value, etag) => {
    if (etag !== String(version)) return false;
    state = structuredClone(value); version++; return true;
  }};
  const options = { now: Date.now(), inputTokens: 1000, outputTokens: 100, kind: 'dispatch' };
  const results = await Promise.allSettled([module.reserve(store,config,options), module.reserve(store,config,options)]);
  assert.equal(results.filter(x => x.status === 'fulfilled').length,1);
  assert.equal(state.requests,1);
  assert.equal(state.tokens,1100);
  assert.equal(state.microusd,1500);
  await assert.rejects(module.reserve(store,config,options), /busy/);
  await assert.rejects(module.reserve(store,config,{...options,now:options.now+61000}), /busy/, 'unknown provider outcome must not silently expire its global slot');
  assert.equal(typeof module.completeReservation,'function');
  await module.completeReservation(store,config,{requests:1});
  await module.reserve(store,config,{...options, now:options.now+61000});
  await assert.rejects(module.reserve(store,config,{...options, now:options.now+122000}), /budget/);
  assert.equal(state.requests,2);
  const broken = { read: async () => { throw Error('offline'); } };
  await assert.rejects(module.reserve(broken,config,options));
  state = { ...state, tokens: -1 };
  await assert.rejects(module.reserve(store,config,options), /ledger/);
});

test('direct adapter reserves before one bounded JSON model call, never sends tools, and fails closed on provider/tool/output failures', async () => {
  assert.equal(typeof module.executeModel, 'function', 'direct model adapter must exist');
  const config=active(); let calls=0, reserved=0;
  const reserveCall=async input => { reserved++; assert.equal(input.inputTokens, Buffer.byteLength('public prompt')+256); };
  const fetchImpl=async (url,options) => {
    calls++; assert.equal(reserved,calls); assert.match(url,/example.openai.azure.com\/openai\/v1\/chat\/completions$/);
    assert.equal(options.headers.Authorization,'Bearer server-secret');
    const body=JSON.parse(options.body); assert.equal(body.model,'gpt-5-mini'); assert.equal(body.max_completion_tokens,2048);
    assert.equal(body.store,false); assert.equal(body.n,1); assert.equal(body.stream,false); assert.equal(body.reasoning_effort,'minimal');
    assert.equal(body.tools,undefined); assert.equal(body.messages.length,1);
    return new Response(JSON.stringify({ choices:[{finish_reason:'stop',message:{content:JSON.stringify({answer:'Supported',citationIds:['public'],grounded:true})}}], usage:{prompt_tokens:4,completion_tokens:10} }));
  };
  const result=await module.executeModel('public prompt',{config,reserveCall,token:async()=> 'server-secret',fetchImpl});
  assert.equal(result.answer,'Supported'); assert.equal(calls,1);
  await assert.rejects(module.executeModel('public prompt',{config,reserveCall:async()=>{throw Error('budget');},token:async()=>'',fetchImpl}),/budget/);
  assert.equal(calls,1);
  for (const response of [new Response('private provider error',{status:401}),new Response(JSON.stringify({choices:[{finish_reason:'tool_calls',message:{tool_calls:[{}]}}]})),new Response('x'.repeat(65000))]) {
    await assert.rejects(module.executeModel('public prompt',{config,reserveCall:async()=>{},token:async()=> 'secret',fetchImpl:async()=>response}),/provider/);
  }
  await assert.rejects(module.executeModel('x'.repeat(48001),{config,reserveCall,token:async()=>'',fetchImpl}),/prompt/);
});

test('Cosmos identity store uses one fixed document, ETag conditional replace, no create/query/retry and no secret in errors', async () => {
  assert.equal(typeof module.cosmosStore,'function','shared durable REST store must exist');
  const config=active(); let calls=[];
  const store=module.cosmosStore(config,{token:async resource=>{assert.equal(resource,'https://cosmos.azure.com');return 'server-only';}, fetchImpl:async(url,options)=>{
    calls.push(options); assert.equal(url,config.ledger_endpoint); assert.match(options.headers.authorization,/type%3Daad/);
    if(options.method==='GET') return new Response(JSON.stringify({...module.initialLedger(config),_etag:'"v1"'}));
    assert.equal(options.method,'PUT'); assert.equal(options.headers['If-Match'],'"v1"'); return new Response('',{status:412});
  }});
  const read=await store.read(); assert.equal(read.etag,'"v1"'); assert.equal(await store.replace(read.value,read.etag),false); assert.equal(calls.length,2);
});

test('hosted HTTP keeps status free of inference, counts malformed/slow attempts without holding inference, enforces origins/kill/outage and grounds citations', async t => {
  const serverModule=await import('./hosted-server.mjs').catch(()=>({}));
  assert.equal(typeof serverModule.createHostedServer,'function','hosted service must exist');
  const config=active(); let value=module.initialLedger(config), version=0,calls=0,killed=false;
  const store={read:async()=>({value:structuredClone(value),etag:String(version)}),replace:async(next,etag)=>{if(etag!==String(version))return false;value=structuredClone(next);version++;return true;}};
  const server=serverModule.createHostedServer({config,store,kill:()=>killed,bodyDeadlineMs:150,executor:async(prompt)=>{
    calls++;assert.match(prompt,/PUBLIC_EVIDENCE/);return {answer:'Just Play uses mood, energy and time.',citationIds:['just-play:portfolio'],grounded:true};
  }});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); t.after(()=>{server.closeAllConnections();server.close();});
  const url=`http://127.0.0.1:${server.address().port}/api/guide`;
  const headers={'Content-Type':'application/json',Origin:config.origin};
  const question={question:'What does Just Play do?',projectId:'just-play',history:[]};
  assert.equal((await (await fetch(url+'/status')).json()).mode,'model-api'); assert.equal(calls,0);
  assert.equal((await fetch(url+'/chat',{method:'POST',headers:{...headers,Origin:'https://evil.example'},body:JSON.stringify(question)})).status,403);
  assert.equal((await fetch(url+'/chat',{method:'POST',headers,body:'{'})).status,400); assert.equal(value.attempts,1); assert.equal(value.requests,0);
  const {request}=await import('node:http');
  const slow=request(url+'/chat',{method:'POST',headers}); slow.on('error',()=>{}); slow.write('{');
  await new Promise(r=>setTimeout(r,30));
  const answer=await fetch(url+'/chat',{method:'POST',headers,body:JSON.stringify(question)});
  assert.equal(answer.status,200); assert.equal((await answer.json()).citations[0].id,'just-play:portfolio'); assert.equal(calls,1); slow.destroy();
  killed=true; assert.equal((await fetch(url+'/chat',{method:'POST',headers,body:JSON.stringify(question)})).status,503); assert.equal(calls,1);
});

test('disconnect during corpus loading and expiry during commit never dispatch provider', async t => {
  const {createHostedServer}=await import('./hosted-server.mjs');
  const {loadSources}=await import('./guide-sources.mjs');
  const sources=await loadSources();
  for(const scenario of ['disconnect','expiry']) {
    const base=active(),config=scenario==='expiry'?Object.freeze({...base,expires:new Date(Date.now()+70).toISOString()}):base;
    let value=module.initialLedger(config),version=0,calls=0,release;
    const store={read:async()=>({value:structuredClone(value),etag:String(version)}),replace:async(next,etag)=>{if(scenario==='expiry'&&next.requests>0)await new Promise(r=>setTimeout(r,120));if(etag!==String(version))return false;value=structuredClone(next);version++;return true;}};
    const server=createHostedServer({config,store,sourceLoader:()=>scenario==='disconnect'?new Promise(r=>{release=r;}):sources,executor:async()=>{calls++;return {answer:'Unsupported',grounded:false,citationIds:[]};}});
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const url=`http://127.0.0.1:${server.address().port}/api/guide/chat`;
    const payload={question:'Just Play?',projectId:'just-play',history:[]};
    if(scenario==='disconnect') {
      const {request}=await import('node:http');const req=request(url,{method:'POST',headers:{'Content-Type':'application/json'}});req.on('error',()=>{});req.end(JSON.stringify(payload));
      await new Promise(r=>setTimeout(r,20));req.destroy();await new Promise(r=>setTimeout(r,20));release(sources);await new Promise(r=>setTimeout(r,40));
    } else await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    server.closeAllConnections();server.close();
    assert.equal(calls,0,scenario+' must not dispatch');
    if(scenario==='expiry')assert.equal(value.requests,1,'committed expiry reservation is burned');
  }
});

test('direct-model config defaults disabled and rejects unsafe or ambiguous activation', () => {
  assert.equal(typeof module.parseConfig, 'function', 'production config adapter must exist');
  assert.equal(module.parseConfig('frog:\n  enabled: false\n').enabled, false);
  for (const text of ['frog:\n  enabled: true\n', 'frog:\n  enabled: false\n  enabled: true\n', 'frog:\n  enabled: yes\n', 'frog:\n  unknown: true\n']) assert.throws(() => module.parseConfig(text));
});
