import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    outDir: 'dist',
    rollupOptions: {
      input: {
        app: new URL('index.html', import.meta.url).pathname,
        privacy: new URL('privacy/index.html', import.meta.url).pathname,
        terms: new URL('terms/index.html', import.meta.url).pathname,
        offline: new URL('offline.html', import.meta.url).pathname
      }
    }
  }
});
