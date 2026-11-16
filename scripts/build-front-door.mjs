import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Vite still builds the original sketchbook from index.html. Publish it at its
// own directory before promoting the independently built static front door.
export async function buildFrontDoor(root = process.cwd()) {
  const dist = resolve(root, 'dist');
  const landing = await readFile(resolve(dist, 'landing-shell.html'), 'utf8');
  const sketchbook = await readFile(resolve(dist, 'index.html'), 'utf8');
  if (!sketchbook.includes('id="entry-screen"') || !sketchbook.includes('id="app"')) {
    throw new Error('Missing built sketchbook; run Vite before arranging entries');
  }
  if (!landing.includes('id="landing-content"') || !landing.includes('/sketchbook/#home')) {
    throw new Error('Missing built front door; refusing to replace the sketchbook');
  }
  await mkdir(resolve(dist, 'sketchbook'), { recursive: true });
  await copyFile(resolve(dist, 'index.html'), resolve(dist, 'sketchbook/index.html'));
  await copyFile(resolve(dist, 'landing-shell.html'), resolve(dist, 'index.html'));
  await rm(resolve(dist, 'landing-shell.html'));
  console.log('Published static front door and /sketchbook/ entry.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildFrontDoor();
