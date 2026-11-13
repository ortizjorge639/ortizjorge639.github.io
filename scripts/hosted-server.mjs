import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { LIMITS, validateInput } from './guide-input.mjs';
import { loadSources, retrieveSources, buildPrompt, validateAnswer } from './guide-sources.mjs';
import { parseConfig, reserve, completeReservation, cosmosStore, executeModel, MODEL_LIMITS } from './hosted-guide.mjs';

const publicError = code => ({ code, error: ({ disabled:'Live answers are disabled. Public project notes are still available.', budget_exhausted:'The frog has reached its small public budget. Browse the project notes instead.', busy:'The frog is resting between questions. Please try again in a minute.', rate_limited:'Too many requests. Please wait a minute.', invalid_input:'Please send a valid portfolio question.', timeout:'The question took too long. Please try later.' })[code] || 'Live answers are temporarily unavailable. Browse the public project notes.' });
async function body(req, deadlineMs) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers['content-type']||'') || req.headers['content-encoding'] || Number(req.headers['content-length']||0)>LIMITS.body) throw Error('invalid_input');
  const chunks=[]; let bytes=0;
  return new Promise((resolve,reject)=>{
    const finish=(error)=>{clearTimeout(timer);req.off('data',data);req.off('end',end);req.off('error',fail);req.off('aborted',fail);if(error){req.resume();reject(error);} };
    const data=chunk=>{bytes+=chunk.length;if(bytes>LIMITS.body)finish(Error('invalid_input'));else chunks.push(chunk);};
    const fail=()=>finish(Error('invalid_input'));
    const end=()=>{finish();try{resolve(validateInput(JSON.parse(Buffer.concat(chunks).toString('utf8'))));}catch{reject(Error('invalid_input'));}};
    const timer=setTimeout(()=>finish(Error('timeout')),deadlineMs);
    req.on('data',data);req.once('end',end);req.once('error',fail);req.once('aborted',fail);
  });
}
export function createHostedServer({config,store=config.enabled?cosmosStore(config):null,executor=executeModel,sourceLoader=loadSources,kill=()=>process.env.GUIDE_KILL_SWITCH==='1',bodyDeadlineMs=2000}={}) {
  let reading=0,recent=[];
  const controllers=new Set();
  // Immutable public corpus loaded once; no runtime GitHub credentials/refresh.
  const corpus=Promise.resolve().then(sourceLoader); corpus.catch(()=>{});
  const server=createServer({maxHeaderSize:16_384},async(req,res)=>{
    const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'",Connection:'close',Vary:'Origin'};
    const send=(status,value)=>{if(!res.destroyed&&!res.writableEnded){res.writeHead(status,headers);res.end(JSON.stringify(value));}};
    let controller,ownsBody=false,timer;
    try {
      recent=recent.filter(t=>Date.now()-t<60000);if(recent.length>=30)throw Error('rate_limited');recent.push(Date.now());
      if(req.headers.origin && req.headers.origin!==config.origin) return send(403,publicError('invalid_input'));
      if(req.headers.origin===config.origin) headers['Access-Control-Allow-Origin']=config.origin;
      if(req.method==='OPTIONS' && ['/api/guide/status','/api/guide/chat'].includes(req.url)) {
        headers['Access-Control-Allow-Methods']='GET, POST, OPTIONS';headers['Access-Control-Allow-Headers']='Content-Type';return send(204,{});
      }
      const enabled=config.enabled && !kill() && Date.now()<Date.parse(config.expires);
      if(req.url==='/api/guide/status'&&req.method==='GET') {
        const sources=await corpus;
        return send(200,{available:!!enabled,mode:'model-api',provider:'azure-openai',authVerified:false,readiness:enabled?'configured_not_inference_verified':'disabled',sourceCount:sources.sourceCount});
      }
      if(req.url!=='/api/guide/chat'||req.method!=='POST')return send(404,publicError('invalid_input'));
      if(!enabled)throw Error('disabled');
      controller=new AbortController();controllers.add(controller);
      res.once('close',()=>{if(!res.writableEnded)controller.abort();});
      if(res.destroyed)controller.abort();
      timer=setTimeout(()=>controller.abort(),MODEL_LIMITS.timeoutMs);
      const check=()=>{controller.signal.throwIfAborted();if(kill()||Date.now()>=Date.parse(config.expires))throw Error('disabled');};
      check();
      if(reading>=4)throw Error('busy');reading++;ownsBody=true;
      await reserve(store,config,{kind:'attempt'});check();
      const input=await body(req,bodyDeadlineMs);check();
      reading--;ownsBody=false;
      const sources=await corpus;check();
      const selected=retrieveSources(sources,input),prompt=buildPrompt(input,selected);
      const inputTokens=Buffer.byteLength(prompt)+256;
      if(inputTokens>MODEL_LIMITS.promptBytes+256)throw Error('invalid_input');
      const receipt=await reserve(store,config,{kind:'dispatch',inputTokens,outputTokens:MODEL_LIMITS.outputTokens});
      check();
      const result=await executor(prompt,{config,signal:controller.signal,isActive:()=>!kill(),reserveCall:async()=>{},token:undefined});
      const answer=validateAnswer(result,selected,input.projectId);
      await completeReservation(store,config,receipt);
      return send(200,answer);
    } catch(error) {
      const code=['disabled','budget_exhausted','busy','rate_limited','invalid_input','timeout'].includes(error?.message)?error.message:'unavailable';
      send(code==='invalid_input'?400:code==='timeout'?408:['busy','rate_limited','budget_exhausted'].includes(code)?429:503,publicError(code));
      // Deliberately no prompts, responses, provider bodies, tokens or headers.
    } finally {clearTimeout(timer);if(ownsBody)reading--;if(controller)controllers.delete(controller);}
  });
  // App Service injects proxy headers before normal browser CORS headers.
  // Keep the 16KiB byte ceiling while admitting that bounded platform envelope.
  server.headersTimeout=5000;server.requestTimeout=5000;server.timeout=35000;server.maxHeadersCount=64;server.maxConnections=16;
  server.on('close',()=>{for(const controller of controllers)controller.abort();});
  return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const config=parseConfig(await readFile(process.env.GUIDE_CONFIG||new URL('../frog.yaml',import.meta.url),'utf8'));
  const server=createHostedServer({config});
  const port=Number(process.env.PORT||8080);if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid port');
  server.listen(port,'0.0.0.0');
  for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{server.closeAllConnections();server.close();});
}
