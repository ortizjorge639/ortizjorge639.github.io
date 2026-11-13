import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const children = [];
let stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) if (child.exitCode === null) child.kill('SIGTERM');
}

for (const args of [
  ['--experimental-strip-types', 'scripts/guide-server.mjs'],
  ['node_modules/vite/bin/vite.js', '--host', '127.0.0.1', '--port', '43190', '--strictPort'],
]) {
  const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit' });
  children.push(child);
  child.on('error', (error) => { console.error(`Local guide process failed: ${error.message}`); stop(1); });
  child.on('exit', (code, signal) => { if (!stopping) stop(code ?? (signal ? 1 : 0)); });
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
