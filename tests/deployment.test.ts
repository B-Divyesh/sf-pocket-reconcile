import { describe, expect, it } from 'vitest';
import staticWebAppConfig from '../public/staticwebapp.config.json';

interface StaticWebAppConfig {
  routes: Array<{ route: string; headers?: Record<string, string> }>;
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
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
});
