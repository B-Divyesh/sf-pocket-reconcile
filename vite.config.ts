import { defineConfig } from 'vite';
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function injectServiceWorkerShell(): Promise<void> {
  const root = new URL('.', import.meta.url);
  const dist = resolve(new URL('dist', root).pathname);
  const immutableDirectory = resolve(dist, 'immutable');
  const appAssets = (await readdir(immutableDirectory))
    .filter(name => /\.(?:css|js)$/.test(name))
    .sort()
    .map(name => `/immutable/${name}`);
  if (!appAssets.some(path => path.endsWith('.js')) || !appAssets.some(path => path.endsWith('.css'))) {
    throw new Error('The PWA shell manifest must include the built JavaScript and CSS.');
  }

  const source = await readFile(new URL('public/sw.js', root), 'utf8');
  const shellFiles = [
    'index.html', 'demo/index.html', '404.html', 'offline.html', 'privacy/index.html', 'terms/index.html',
    'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png',
    'icons/icon-maskable-512.png', 'assets/pressed-ledger-384.webp',
    'assets/pressed-ledger.webp', 'assets/pressed-ledger.jpg',
    ...appAssets.map(path => path.slice(1))
  ];
  const fingerprint = createHash('sha256');
  fingerprint.update(source);
  for (const path of shellFiles) fingerprint.update(await readFile(resolve(dist, path)));
  const version = fingerprint.digest('hex').slice(0, 12);
  const built = source
    .replace('__BUILD_VERSION__', version)
    .replace('/* __APP_SHELL_ASSETS__ */', appAssets.map(path => JSON.stringify(path)).join(', '));
  await writeFile(resolve(dist, 'sw.js'), built);
}

export default defineConfig({
  plugins: [{ name: 'inject-service-worker-shell', apply: 'build', closeBundle: injectServiceWorkerShell }],
  build: {
    target: 'es2022',
    outDir: 'dist',
    assetsDir: 'immutable',
    rollupOptions: {
      input: {
        app: new URL('index.html', import.meta.url).pathname,
        demo: new URL('demo/index.html', import.meta.url).pathname,
        notFound: new URL('404.html', import.meta.url).pathname,
        privacy: new URL('privacy/index.html', import.meta.url).pathname,
        terms: new URL('terms/index.html', import.meta.url).pathname,
        offline: new URL('offline.html', import.meta.url).pathname
      }
    }
  }
});
