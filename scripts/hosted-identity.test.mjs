import test from 'node:test';
import assert from 'node:assert/strict';
import {identityToken} from './hosted-guide.mjs';

test('observed App Service local identity contract supplies Cosmos audience without redirect or user credentials',async()=>{
 let calls=0;
 const result=await identityToken('https://cosmos.azure.com',AbortSignal.timeout(1000),{IDENTITY_ENDPOINT:'http://169.254.130.4:8081/msi/token',IDENTITY_HEADER:'synthetic-fixture'},async(url,options)=>{
  calls++;assert.equal(url.origin,'http://169.254.130.4:8081');assert.equal(url.pathname,'/msi/token');assert.equal(url.searchParams.get('api-version'),'2019-08-01');assert.equal(url.searchParams.get('resource'),'https://cosmos.azure.com');assert.equal(options.headers['X-IDENTITY-HEADER'],'synthetic-fixture');assert.equal(options.redirect,'error');
  return new Response(JSON.stringify({access_token:'synthetic-token'}));
 });
 assert.equal(result,'synthetic-token');assert.equal(calls,1);
});

test('identity rejects unobserved sockets and ambiguous URLs before any network call',async()=>{
 let calls=0;
 for(const endpoint of ['http://10.0.0.5:8081/msi/token','http://169.254.130.4.example.com:8081/msi/token','http://169.254.130.4:8082/msi/token','https://169.254.130.4:8081/msi/token','http://user:pass@169.254.130.4:8081/msi/token','http://169.254.130.4:8081/elsewhere','http://169.254.130.4:8081/msi/token?resource=other','http://169.254.130.4:8081/msi/token#fragment','http://example.com/msi/token']) {
  await assert.rejects(identityToken('https://cosmos.azure.com',undefined,{IDENTITY_ENDPOINT:endpoint,IDENTITY_HEADER:'synthetic-fixture'},async()=>{calls++;throw Error('must not fetch');}),/managed_identity_unavailable/);
 }
 await assert.rejects(identityToken('https://cosmos.azure.com',undefined,{IDENTITY_ENDPOINT:'http://169.254.130.4:8081/msi/token'},async()=>{calls++;throw Error('must not fetch');}),/managed_identity_unavailable/);
 assert.equal(calls,0);
});

test('App Service platform-selected endpoint may rotate on redeployment without a static IP guess',async()=>{
 for(const host of ['169.254.130.4','169.254.130.6']) {
  const result=await identityToken('https://cognitiveservices.azure.com',undefined,{IDENTITY_ENDPOINT:`http://${host}:8081/msi/token`,IDENTITY_HEADER:'synthetic-fixture'},async(url)=>{
   assert.equal(url.hostname,host);assert.equal(url.searchParams.get('resource'),'https://cognitiveservices.azure.com');
   return new Response(JSON.stringify({access_token:'synthetic-token'}));
  });
  assert.equal(result,'synthetic-token');
 }
});
