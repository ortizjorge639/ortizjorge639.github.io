import { defineConfig, type ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'node:http';

export default defineConfig({
  plugins: [{
    name: 'front-door-dev-routes',
    configureServer(server: ViteDevServer) {
      // Match the published directory layout without moving the sketchbook source.
      server.middlewares.use((request: IncomingMessage, _response: ServerResponse, next: () => void) => {
        const [path, query] = (request.url ?? '').split(/\?(.*)/s);
        const suffix = query === undefined ? '' : `?${query}`;
        if (path === '/' || path === '/index.html') request.url = `/landing-shell.html${suffix}`;
        else if (['/sketchbook', '/sketchbook/', '/sketchbook/index.html'].includes(path)) request.url = `/index.html${suffix}`;
        next();
      });
    },
  }],
  build: { rollupOptions: { input: { main: 'index.html', reading: 'reading-shell.html', landing: 'landing-shell.html' } } },
  server: {
    host: '127.0.0.1',
    port: 43190,
    strictPort: true,
    proxy: { '/api/guide': { target: 'http://127.0.0.1:43189' } },
  },
  preview: { proxy: {} },
});
