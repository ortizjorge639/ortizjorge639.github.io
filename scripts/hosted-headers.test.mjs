import test from 'node:test';
import assert from 'node:assert/strict';
import {request} from 'node:http';
import {once} from 'node:events';
import {createHostedServer} from './hosted-server.mjs';

test('App Service proxy and normal browser headers retain Origin within a bounded header envelope',async()=>{
 let providerCalls=0;
 const origin='https://ortizjorge639.github.io';
 const server=createHostedServer({config:{enabled:false,origin},sourceLoader:async()=>({sourceCount:12}),executor:async()=>{providerCalls++;throw Error('must not dispatch');}});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const get=headers=>new Promise((resolve,reject)=>{
  const req=request({hostname:'127.0.0.1',port:server.address().port,path:'/api/guide/status',headers},res=>{res.resume();res.on('end',()=>resolve({status:res.statusCode,cors:res.headers['access-control-allow-origin']}));});req.on('error',reject);req.end();
 });
 try {
  const headers=Object.fromEntries(Array.from({length:40},(_,i)=>['X-Proxy-Fixture-'+i,'small']));headers.Origin=origin;
  const normal=await get(headers);assert.equal(normal.status,200);assert.equal(normal.cors,origin,'platform-added headers must not silently truncate the browser Origin');
  const oversized=await get({Origin:origin,'X-Oversized-Fixture':'x'.repeat(20000)});assert.equal(oversized.status,431,'byte bound must still reject oversized headers');
  assert.equal(providerCalls,0);
 } finally {server.closeAllConnections();server.close();await once(server,'close');}
});
