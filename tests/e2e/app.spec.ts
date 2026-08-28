import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates an account, records an entry, and reconciles exactly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reconcile cash and card balances.');
  await page.getByRole('button', { name: 'Create my first account' }).click();
  await page.getByLabel('Account name').fill('Pocket cash');
  await page.getByLabel('Balance right now').fill('100.00');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByLabel('Amount INR').fill('12.50');
  await page.getByLabel('Note').fill('Tea and snacks');
  await page.getByRole('button', { name: 'Add to ledger' }).click();
  await expect(page.getByText('₹87.50', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Start balance check' }).click();
  await page.getByRole('button', { name: 'Close this check' }).click();
  await page.getByRole('button', { name: 'Checks' }).click();
  await expect(page.getByText('Matched')).toBeVisible();
  await expect(page.getByText('₹87.50 observed')).toBeVisible();
});

test('keeps the maximum accepted decimal amount cent-exact in the ledger', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first account' }).click();
  await page.getByLabel('Account name').fill('Boundary wallet');
  await page.getByLabel('Currency').selectOption('USD');
  await page.getByLabel('Balance right now').fill('90071992547409.91');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('$90,071,992,547,409.91', { exact: true }).first()).toBeVisible();
});

test('rejects an impossible CSV date without changing the ledger', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first account' }).click();
  await page.getByLabel('Account name').fill('Pocket cash');
  await page.getByLabel('Balance right now').fill('100.00');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.locator('#csv-import').setInputFiles({
    name: 'impossible-date.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('date,account,amount,note\n2026-02-31,Pocket cash,-1.00,Impossible date')
  });
  await expect(page.getByRole('status')).toContainText('Row 2: use a date like 2026-08-28.');
  await page.locator('button[data-nav="ledger"]').click();
  await expect(page.getByText('0 total')).toBeVisible();
  await expect(page.getByText('₹100.00', { exact: true }).first()).toBeVisible();
});

test('rejects duplicate account names before they can make CSV assignment ambiguous', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first account' }).click();
  await page.getByLabel('Account name').fill('Pocket cash');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByRole('button', { name: 'Add account' }).click();
  await page.getByLabel('Account name').fill('  POCKET   CASH  ');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.locator('#account-error')).toHaveText('Use a unique account name so CSV entries always return to the right ledger.');
  await expect(page.getByLabel('Account name')).toBeFocused();
  await expect(page.locator('#account-dialog')).toBeVisible();
});

test('undo restores a deleted entry and its balance', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first account' }).click();
  await page.getByLabel('Account name').fill('Pocket cash');
  await page.getByLabel('Balance right now').fill('90.00');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByLabel('Received').check();
  await page.getByLabel('Amount INR').fill('5.00');
  await page.getByLabel('Note').fill('Cash returned');
  await page.getByRole('button', { name: 'Add to ledger' }).click();
  await expect(page.getByText('₹95.00', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Delete Cash returned entry' }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.getByText('₹90.00', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText('₹95.00', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Cash returned', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Entry restored.');
});

test('supports the primary keyboard path and dialog focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to ledger' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('button', { name: 'Create my first account' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Account name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Create my first account' })).toBeFocused();
});

test('makes no third-party requests in the ordinary free workflow', async ({ page }) => {
  const unexpectedOrigins = new Set<string>();
  page.on('request', request => {
    const origin = new URL(request.url()).origin;
    if (!['http://127.0.0.1:4173', 'https://pocket-reconcile.sociobot.in'].includes(origin)) unexpectedOrigins.add(origin);
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect([...unexpectedOrigins]).toEqual([]);
});

test('announces an installed service-worker update and reloads from its action', async ({ page }) => {
  let documentRequests = 0;
  page.on('request', request => { if (request.resourceType() === 'document') documentRequests += 1; });
  await page.addInitScript(() => {
    const worker = Object.assign(new EventTarget(), { state: 'installing' });
    const registration = Object.assign(new EventTarget(), { installing: worker });
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: {},
        register: async () => {
          setTimeout(() => {
            registration.dispatchEvent(new Event('updatefound'));
            worker.state = 'installed';
            worker.dispatchEvent(new Event('statechange'));
          }, 50);
          return registration;
        }
      }
    });
  });
  await page.goto('/');
  await expect(page.getByRole('status')).toContainText('A fresh field guide is ready.');
  await expect(page.getByRole('button', { name: 'Update' })).toBeVisible();
  const before = documentRequests;
  await Promise.all([
    page.waitForNavigation(),
    page.getByRole('button', { name: 'Update' }).click()
  ]);
  expect(documentRequests).toBeGreaterThan(before);
});

test('keeps every advertised mobile link target at least 44 by 44 CSS pixels', async ({ page }) => {
  await page.goto('/');
  for (const target of [
    page.getByRole('link', { name: 'Pocket Reconcile, ledger' }),
    page.getByRole('link', { name: 'Privacy' }),
    page.getByRole('link', { name: 'Terms' })
  ]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('has no serious accessibility violations on first run', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''))).toEqual([]);
  expect(errors).toEqual([]);
});

test('dark treatment and legal pages meet the accessibility baseline', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  for (const path of ['/', '/privacy/', '/terms/']) {
    await page.goto(path);
    const results = await new AxeBuilder({ page: page as never }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(results.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')), path).toEqual([]);
  }
});

test('first-visit app shell opens offline with the browser HTTP cache disabled', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.waitForFunction(() => navigator.serviceWorker?.controller);
  const cachedShell = await page.evaluate(async () => {
    const requests = (await Promise.all((await caches.keys()).map(async name => (await caches.open(name)).keys()))).flat();
    return requests.map(request => new URL(request.url).pathname);
  });
  expect(cachedShell.some(path => /^\/immutable\/.*\.js$/.test(path))).toBe(true);
  expect(cachedShell.some(path => /^\/immutable\/.*\.css$/.test(path))).toBe(true);
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Offline · ready')).toBeVisible();
});

test('@claim:demo-sandbox opens realistic sample data in its own namespace and discards it on exit', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1, name: 'Weekend cash' })).toBeVisible();
  await expect(page.getByText('Saturday market', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Demo controls')).toContainText('Demo — sample data, nothing is saved.');
  const namespaces = await page.evaluate(async () => ({
    databases: (await indexedDB.databases()).map(item => item.name),
    keys: Object.keys(localStorage)
  }));
  expect(namespaces.databases).toContain('demo:pocket-reconcile');
  expect(namespaces.keys.every(key => key.startsWith('demo:'))).toBe(true);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reconcile cash and card balances.');
  await expect.poll(() => page.evaluate(async () => (await indexedDB.databases()).map(item => item.name))).not.toContain('demo:pocket-reconcile');
});

test('@claim:offline-reload works offline after the first demo visit', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(() => navigator.serviceWorker?.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Weekend cash' })).toBeVisible();
  await expect(page.getByText('Offline · ready')).toBeVisible();
});

test('@claim:csv-export exports every sample transaction as CSV', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Backup' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const csv = await (await download).createReadStream().then(async stream => {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8');
  });
  expect(csv.split('\n')).toHaveLength(4);
  expect(csv).toContain('Saturday market');
  expect(csv).toContain('Daily card');
});

test('@claim:encrypted-backup exports a password-encrypted demo pack', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.getByLabel('New backup password').fill('demo-safe-password');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const contents = await (await download).createReadStream().then(async stream => {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8');
  });
  expect(contents).toContain('pocket-reconcile-encrypted');
  expect(contents).not.toContain('Weekend cash');
  expect(contents).not.toContain('Saturday market');
});

test('@claim:local-records keeps the demo flow on the product origin with no bank login', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Checks' }).click();
  await page.getByRole('button', { name: 'Ledger' }).click();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('@claim:exact-decimals keeps the accepted maximum decimal amount exact in demo mode', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add account' }).click();
  await page.getByLabel('Account name').fill('Maximum wallet');
  await page.getByLabel('Currency').selectOption('USD');
  await page.getByLabel('Balance right now').fill('90071992547409.91');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('$90,071,992,547,409.91', { exact: true }).first()).toBeVisible();
});
