import { defineConfig, devices } from '@playwright/test';

const localBaseUrl = 'http://127.0.0.1:4173';
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? localBaseUrl;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'line',
  use: { baseURL, trace: 'retain-on-failure' },
  webServer: process.env.PLAYWRIGHT_BASE_URL ? undefined : { command: 'npm run preview:test -- --host 127.0.0.1', url: localBaseUrl, reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: 'mobile-390-chromium', use: { ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 390, height: 844 } } },
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } }
  ]
});
