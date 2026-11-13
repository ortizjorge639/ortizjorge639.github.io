import { createHash } from 'node:crypto';

// Deliberately small YAML scalar subset: no tags, aliases, merges, implicit dates,
// multiline strings, secrets, or unknown keys. Credentials come from host identity.
const fields = new Set(['enabled','backend','access','model_provider','endpoint','deployment','origin','ledger_endpoint','expires','lifetime_requests','daily_requests','lifetime_tokens','lifetime_microusd']);
export function parseConfig(text, now = Date.now()) {
  const config = {};
  let root = false;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!root) { if (line !== 'frog:') throw new Error('Expected frog YAML root'); root = true; continue; }
    const match = /^  ([a-z_]+): ([A-Za-z0-9:/._-]+)$/.exec(line);
    if (!match || !fields.has(match[1]) || Object.hasOwn(config, match[1])) throw new Error('Invalid, duplicate or unknown frog setting');
    const [,key,value] = match;
    if (key === 'enabled') { if (!['true','false'].includes(value)) throw new Error('enabled must be boolean'); config[key] = value === 'true'; }
    else if (/^(lifetime_|daily_)/.test(key)) { if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error('Invalid limit'); config[key] = Number(value); }
    else config[key] = value;
  }
  if (!root) throw new Error('Missing frog configuration');
  config.enabled ??= false;
  if (!config.enabled) return config;
  if (config.backend !== 'model-api' || config.access !== 'public' || config.model_provider !== 'azure-openai' || config.deployment !== 'gpt-5-mini') throw new Error('Unsupported or incomplete hosted backend; Copilot is loopback-only');
  const https = (value, pattern) => { const url = new URL(value); if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !pattern.test(url.hostname)) throw new Error('Invalid endpoint'); return url; };
  const model = https(config.endpoint, /^[a-z0-9-]+\.openai\.azure\.com$/);
  if (model.pathname !== '/') throw new Error('Expected Azure OpenAI root');
  const origin = https(config.origin, /^ortizjorge639\.github\.io$/);
  if (origin.origin !== config.origin) throw new Error('Expected exact public origin');
  const ledger = https(config.ledger_endpoint, /^[a-z0-9-]+\.documents\.azure\.com$/);
  if (!/^\/dbs\/[a-z0-9-]+\/colls\/[a-z0-9-]+\/docs\/global$/.test(ledger.pathname)) throw new Error('Expected fixed Cosmos ledger document');
  const expires = Date.parse(config.expires);
  if (!Number.isFinite(expires) || expires <= now || expires - now > 7 * 86400_000) throw new Error('Activation must expire within seven days');
  for (const [key,max] of Object.entries({ lifetime_requests:100, daily_requests:20, lifetime_tokens:2_000_000, lifetime_microusd:2_000_000 })) {
    if (!Number.isSafeInteger(config[key]) || config[key] < 1 || config[key] > max) throw new Error('Missing or excessive '+key);
  }
  return Object.freeze(config);
}
export function configId(config) { return createHash('sha256').update(JSON.stringify(config)).digest('hex'); }

export const MODEL_LIMITS = Object.freeze({ promptBytes:48_000, outputTokens:2048, timeoutMs:30_000, leaseMs:60_000 });

export async function boundedJson(response, maxBytes=64_000) {
  if (!response.ok || Number(response.headers.get('content-length')||0)>maxBytes) { await response.body?.cancel(); throw new Error('provider_unavailable'); }
  const chunks=[]; let size=0;
  for await (const chunk of response.body) { size+=chunk.length; if (size>maxBytes) throw new Error('provider_response_bound'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new Error('provider_response_invalid'); }
}
export async function executeModel(prompt,{config,reserveCall,token=identityToken,fetchImpl=fetch,signal,isActive=()=>true,outputTokens=MODEL_LIMITS.outputTokens}={}) {
  const active=()=>{if(!config.enabled || !isActive() || !Number.isFinite(Date.parse(config.expires)) || Date.now()>=Date.parse(config.expires))throw new Error('disabled');};
  active();
  const bytes=Buffer.byteLength(prompt,'utf8');
  if (bytes>MODEL_LIMITS.promptBytes || !Number.isInteger(outputTokens) || outputTokens<1 || outputTokens>MODEL_LIMITS.outputTokens) throw new Error('prompt_or_output_bound');
  const deadline=AbortSignal.timeout(MODEL_LIMITS.timeoutMs);
  const combined=signal ? AbortSignal.any([signal,deadline]) : deadline;
  combined.throwIfAborted();
  // UTF8 bytes upper-bound text tokens for the pinned byte-level tokenizer;
  //256 additional tokens conservatively cover one-message API framing.
  await reserveCall({kind:'dispatch',inputTokens:bytes+256,outputTokens});
  combined.throwIfAborted();
  active();
  const accessToken=await token('https://cognitiveservices.azure.com',combined);
  active();
  combined.throwIfAborted();
  let response;
  try {
    response=await fetchImpl(`${config.endpoint}openai/v1/chat/completions`,{
      method:'POST',redirect:'error',signal:combined,
      headers:{'Content-Type':'application/json',Authorization:`Bearer ${accessToken}`},
      body:JSON.stringify({model:config.deployment,messages:[{role:'user',content:prompt}],max_completion_tokens:outputTokens,reasoning_effort:'minimal',verbosity:'low',response_format:{type:'json_object'},n:1,stream:false,store:false}),
    });
  } catch { throw new Error(combined.aborted ? 'provider_timeout' : 'provider_unavailable'); }
  const data=await boundedJson(response);
  const choice=data.choices?.[0];
  if (data.choices?.length!==1 || choice.finish_reason!=='stop' || choice.message?.tool_calls || choice.message?.function_call || typeof choice.message?.content!=='string' || choice.message.content.length>10000 || !Number.isInteger(data.usage?.prompt_tokens) || data.usage.prompt_tokens>bytes+256 || !Number.isInteger(data.usage?.completion_tokens) || data.usage.completion_tokens>outputTokens) throw new Error('provider_response_invalid');
  try { return JSON.parse(choice.message.content); } catch { throw new Error('provider_response_invalid'); }
}

export async function completeReservation(store,config,receipt) {
  const {value,etag}=await store.read();
  if(value?.configId!==configId(config)||value.requests!==receipt.requests||value.leaseUntil!==Number.MAX_SAFE_INTEGER)throw new Error('invalid completion');
  if(!await store.replace({...value,leaseUntil:0},etag))throw new Error('busy');
}

export async function identityToken(resource,signal,env=process.env,fetchImpl=fetch) {
  const endpoint=new URL(env.IDENTITY_ENDPOINT || 'http://invalid');
  // App Service owns IDENTITY_ENDPOINT and its rotating SSRF-mitigation header.
  // Its IP changes on redeploy; never derive this URL/header from visitor input.
  // Follow that platform contract, with extra local numeric socket restrictions,
  // rather than guessing an Azure allocation IP or allowing arbitrary URLs.
  const knownHost=['127.0.0.1','169.254.129.1','169.254.129.2'].includes(endpoint.hostname);
  const platformSocket=/^169\.254\.(?:\d{1,3})\.(?:\d{1,3})$/.test(endpoint.hostname) && endpoint.port==='8081';
  if (!env.IDENTITY_HEADER || endpoint.protocol!=='http:' || endpoint.username || endpoint.password || endpoint.search || endpoint.hash || !/^\/msi\/token$/i.test(endpoint.pathname) || !(knownHost || platformSocket)) throw new Error('managed_identity_unavailable');
  endpoint.searchParams.set('api-version','2019-08-01'); endpoint.searchParams.set('resource',resource);
  const data=await boundedJson(await fetchImpl(endpoint,{headers:{'X-IDENTITY-HEADER':env.IDENTITY_HEADER},signal,redirect:'error'}),16000);
  if(typeof data.access_token!=='string' || !data.access_token) throw new Error('managed_identity_unavailable');
  return data.access_token;
}
export function cosmosStore(config,{token=identityToken,fetchImpl=fetch}={}) {
  const call=async(method,value,etag)=> {
    const signal=AbortSignal.timeout(3000);
    const access=await token('https://cosmos.azure.com',signal);
    const headers={authorization:encodeURIComponent(`type=aad&ver=1.0&sig=${access}`),'x-ms-date':new Date().toUTCString(),'x-ms-version':'2018-12-31','x-ms-documentdb-partitionkey':'["global"]','Content-Type':'application/json'};
    if(etag) headers['If-Match']=etag;
    // Never strip a Cosmos error into a fallback or create a missing document.
    return fetchImpl(config.ledger_endpoint,{method,headers,signal,redirect:'error',...(value?{body:JSON.stringify(value)}:{})});
  };
  return {
    async read() { const data=await boundedJson(await call('GET'),16000); if(typeof data._etag!=='string') throw new Error('invalid ledger'); return {value:data,etag:data._etag}; },
    async replace(value,etag) { const clean=Object.fromEntries(Object.entries(value).filter(([k])=>!k.startsWith('_'))); if(Buffer.byteLength(JSON.stringify(clean))>16000) throw new Error('invalid ledger'); const response=await call('PUT',clean,etag); const ok=response.ok; await response.body?.cancel(); if(response.status===412) return false; if(!ok) throw new Error('ledger_unavailable'); return true; },
  };
}
export function initialLedger(config) {
  return { id:'global', configId:configId(config), requests:0, tokens:0, microusd:0, attempts:0, dailyRequests:0, dailyAttempts:0, minuteAttempts:0, day:'', minute:0, leaseUntil:0, disabled:false };
}
// Only the explicit operator initializer may create a ledger. Request handling
// must never call initialLedger or restore/reset/reseed a missing document.
export async function reserve(store, config, { now=Date.now(), inputTokens=0, outputTokens=0, kind='dispatch' }={}) {
  if (!config.enabled || now >= Date.parse(config.expires)) throw new Error('disabled');
  if (!['dispatch','attempt'].includes(kind)) throw new Error('invalid admission');
  if (![inputTokens,outputTokens].every(n => Number.isSafeInteger(n) && n >= 0) || inputTokens > MODEL_LIMITS.promptBytes+256 || outputTokens > MODEL_LIMITS.outputTokens) throw new Error('token bound');
  const { value:old, etag } = await store.read();
  const counters = ['requests','tokens','microusd','attempts','dailyRequests','dailyAttempts','minuteAttempts','minute','leaseUntil'];
  if (!old || old.id !== 'global' || old.configId !== configId(config) || !etag || typeof old.disabled !== 'boolean' || typeof old.day !== 'string' || counters.some(k => !Number.isSafeInteger(old[k]) || old[k]<0)) throw new Error('invalid ledger');
  if (old.disabled) throw new Error('disabled');
  const value = { ...old };
  const day = new Date(now).toISOString().slice(0,10), minute = Math.floor(now/60_000);
  if (value.day !== day) { value.day=day; value.dailyRequests=0; value.dailyAttempts=0; }
  if (value.minute !== minute) { value.minute=minute; value.minuteAttempts=0; }
  if (kind === 'attempt') {
    if (value.attempts >= 10000 || value.dailyAttempts >= 500 || value.minuteAttempts >= 30) throw new Error('rate_limited');
    value.attempts++; value.dailyAttempts++; value.minuteAttempts++;
  } else {
    const tokens = inputTokens + outputTokens;
    // USD1/1M input and5/1M output upper reservation; no cache discount.
    const cost = inputTokens + outputTokens*5;
    if (value.requests >= config.lifetime_requests || value.dailyRequests >= config.daily_requests || value.tokens+tokens > config.lifetime_tokens || value.microusd+cost > config.lifetime_microusd) throw new Error('budget_exhausted');
    if (value.leaseUntil > 0) throw new Error('busy');
    value.requests++; value.dailyRequests++; value.tokens+=tokens; value.microusd+=cost;
    // Durable semaphore, NOT an expiring lease: unknown provider outcomes
    // remain globally closed across crash/restart until operator reconciliation.
    value.leaseUntil=Number.MAX_SAFE_INTEGER;
  }
  // One conditional write, no SDK/retry loop. Ambiguous commit is burned and
  // never authorizes inference; a412 cannot be interpreted as success.
  if (!await store.replace(value,etag)) throw new Error('busy');
  return { requests:value.requests, tokens:value.tokens, microusd:value.microusd };
}
