import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import staticWebAppConfig from '../public/staticwebapp.config.json';

const serviceWorker = readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { engines?: { node?: string } };
const claims = JSON.parse(readFileSync(new URL('../.factory/claims.json', import.meta.url), 'utf8')) as Array<{ id: string; test: string }>;
const browserTests = readFileSync(new URL('./e2e/app.spec.ts', import.meta.url), 'utf8');

interface StaticWebAppConfig {
  routes: Array<{ route: string; headers?: Record<string, string> }>;
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  responseOverrides?: Record<string, { rewrite?: string }>;
  navigationFallback?: unknown;
}

describe('static deployment response policy', () => {
  const config = staticWebAppConfig as unknown as StaticWebAppConfig;

  it('caches only Vite content-hashed output as immutable for one year', () => {
    const immutable = config.routes.find(route => route.route === '/immutable/*');
    expect(immutable?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    expect(config.routes.find(route => route.route === '/sw.js')?.headers?.['Cache-Control']).toBe('no-cache');
  });

  it('serves the manifest correctly and provides privacy/security headers', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=()');
    expect(config.globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  });

  it('requires the production build to inject executable shell assets and a cache version', () => {
    expect(serviceWorker).toContain("const BUILD_ASSETS = [/* __APP_SHELL_ASSETS__ */]");
    expect(serviceWorker).toContain("pocket-reconcile-__BUILD_VERSION__");
    expect(serviceWorker).toContain('...BUILD_ASSETS');
  });

  it('uses a designed 404 response instead of rewriting unknown routes to the ledger shell', () => {
    expect(config.navigationFallback).toBeUndefined();
    expect(config.responseOverrides?.['404']?.rewrite).toBe('/404.html');
    expect(readFileSync(new URL('../404.html', import.meta.url), 'utf8')).toContain('Return to the ledger');
  });

  it('preloads the direct demo route for offline sample use', () => {
    expect(serviceWorker).toContain("'/demo/'");
    expect(readFileSync(new URL('../demo/index.html', import.meta.url), 'utf8')).toContain('Demo — Pocket Reconcile');
  });

  it('uses plain ledger terms instead of decorative field-guide labels', () => {
    const source = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const offline = readFileSync(new URL('../offline.html', import.meta.url), 'utf8');
    for (const phrase of ['Field ledger', 'Recent specimens', 'Field guide 02', 'Pack and restore', 'Plate A', 'Encrypted field pack', 'Notebook settings', 'Erase this notebook', 'New specimen', 'Count what’s there', 'What changed?']) {
      expect(source).not.toContain(phrase);
    }
    expect(source).toContain('Add a ledger entry');
    expect(offline).toContain('This page is not available offline yet');
  });

  it('documents and enforces the Node versions supported by Vite', () => {
    expect(packageJson.engines?.node).toBe('^20.19.0 || >=22.12.0');
    expect(readFileSync(new URL('../README.md', import.meta.url), 'utf8')).toContain('Requires Node.js 20.19+ or 22.12+.');
  });

  it('maps every registered claim to exactly one tagged browser test', () => {
    const ids = claims.map(claim => claim.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const claim of claims) {
      expect(claim.test).toBe(`npm run test:claims -- --grep @claim:${claim.id}`);
      expect(browserTests.split(`@claim:${claim.id}`).length - 1, claim.id).toBe(1);
    }
    const sourceTags = [...browserTests.matchAll(/@claim:([a-z0-9-]+)/g)].map(match => match[1]);
    expect(sourceTags.sort()).toEqual([...ids].sort());
  });

  it('keeps the catalog description verb-first and within 120 characters', () => {
    const description = readFileSync(new URL('../.factory/catalog-description.txt', import.meta.url), 'utf8').trim();
    expect(description.length).toBeLessThanOrEqual(120);
    expect(description).toMatch(/^Reconcile\b/);
  });
});
