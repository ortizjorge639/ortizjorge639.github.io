import {mkdir,readFile,writeFile,lstat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseConfig} from './hosted-guide.mjs';

// Deliberate file allowlist, not a recursive repository/workspace upload.
export const HOST_FILES=Object.freeze([
 'scripts/hosted-server.mjs','scripts/hosted-guide.mjs','scripts/guide-input.mjs','scripts/guide-sources.mjs',
 'src/projects.ts','src/project-catalog.json','src/stories.ts','src/current-stories.ts','src/screens.ts',
 'data/guide-sources.json','README.md',
 'scripts/source-policy.mjs','src/inventory-story.ts','public/case-studies/inventory-data-assistant.md',
 'src/technical-case-stories.ts','public/case-studies/document-evidence-pipeline.md','public/case-studies/custom-model-auth-diagnostics.md',
]);
const root=fileURLToPath(new URL('../',import.meta.url));
export async function writeHostDirectory(target,{configText}={}) {
 parseConfig(configText);
 // Refuse to overwrite any existing target, including symlinks.
 await mkdir(target,{recursive:false});
 const files=[];
 const put=async(name,content)=>{
  const destination=path.join(target,name);
  await mkdir(path.dirname(destination),{recursive:true});
  await writeFile(destination,content,{flag:'wx',mode:0o600});
  files.push({name,bytes:Buffer.byteLength(content),sha256:createHash('sha256').update(content).digest('hex')});
 };
 for(const name of HOST_FILES) {
  const source=path.join(root,name);
  if(!(await lstat(source)).isFile())throw Error('Host input must be a regular file: '+name);
  await put(name,await readFile(source));
 }
 await put('frog.yaml',configText);
 await put('package.json',JSON.stringify({name:'joji-public-frog',private:true,type:'module',engines:{node:'>=22.12.0'},scripts:{start:'node --experimental-strip-types scripts/hosted-server.mjs'}})+'\n');
 const manifest={version:1,files};
 await writeFile(path.join(target,'host-manifest.json'),JSON.stringify(manifest,null,2),{flag:'wx',mode:0o600});
 return manifest;
}
if(process.argv[1]===fileURLToPath(import.meta.url)) {
 const [target,configPath]=process.argv.slice(2);
 if(!target||!configPath)throw Error('Usage: node scripts/package-hosted.mjs NEW_DIRECTORY CONFIG_YAML');
 console.log(JSON.stringify(await writeHostDirectory(target,{configText:await readFile(configPath,'utf8')}),null,2));
}
