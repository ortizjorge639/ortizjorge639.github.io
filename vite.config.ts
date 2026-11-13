import { defineConfig } from 'vite';

export default defineConfig({
  build: { rollupOptions: { input: { main: 'index.html', reading: 'reading-shell.html' } } },
  server: {
    host: '127.0.0.1',
    port: 43190,
    strictPort: true,
    proxy: { '/api/guide': { target: 'http://127.0.0.1:43189' } },
  },
  preview: { proxy: {} },
});
