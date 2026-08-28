import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function ledgerSnapshot(page: Page, databaseName: string): Promise<string> {
  return page.evaluate(async name => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stores = await Promise.all([...database.objectStoreNames].sort().map(store => new Promise<[string, unknown[]]>((resolve, reject) => {
      const request = database.transaction(store).objectStore(store).getAll();
      request.onsuccess = () => resolve([store, request.result]);
      request.onerror = () => reject(request.error);
    })));
    database.close();
    const preferences = Object.keys(localStorage)
      .filter(key => !key.startsWith('demo:'))
      .sort()
      .map(key => [key, localStorage.getItem(key)]);
    return JSON.stringify({ stores, preferences });
  }, databaseName);
}

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

test('@claim:account-name-uniqueness rejects case and whitespace variants of an existing account', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Add account' }).click();
  await page.getByLabel('Account name').fill('  WEEKEND   CASH  ');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.locator('#account-error')).toHaveText('Use a unique account name so CSV entries always return to the right ledger.');
  await expect(page.getByLabel('Account name')).toBeFocused();
  await expect(page.locator('#account-dialog')).toBeVisible();
});

test('@claim:entry-delete deletes and restores an individual entry', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Received').check();
  await page.getByLabel('Amount INR').fill('5.00');
  await page.getByLabel('Note').fill('Cash returned');
  await page.getByRole('button', { name: 'Add to ledger' }).click();
  await expect(page.getByText('₹109.50', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Delete Cash returned entry' }).click();
  await page.locator('#confirm-delete').click();
  await expect(page.getByText('₹104.50', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Undo' }).click();
  await expect(page.getByText('₹109.50', { exact: true }).first()).toBeVisible();
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

test('@claim:pwa-install-update exposes an installable manifest and applies an update', async ({ page, context }) => {
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
  await page.goto('/demo');
  const manifest = await page.evaluate(async () => await (await fetch('/manifest.webmanifest')).json()) as { display: string; start_url: string; icons: unknown[] };
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toMatch(/^\//);
  expect(manifest.icons).toHaveLength(3);
  const manifestCheck = await (await context.newCDPSession(page)).send('Page.getAppManifest');
  expect(manifestCheck.errors).toEqual([]);
  await expect(page.getByRole('status')).toContainText('An app update is ready.');
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
    page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Ledger' }),
    page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Demo' }),
    page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Privacy' }),
    page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Terms' }),
    page.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }),
    page.getByRole('contentinfo').getByRole('link', { name: 'Terms' })
  ]) {
    const box = await target.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('keeps the first screen readable on mobile and gives both desktop actions equal height', async ({ page }) => {
  await page.goto('/');
  const viewport = page.viewportSize();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const primary = page.getByRole('link', { name: 'Try it with sample data' });
  const secondary = page.getByRole('button', { name: 'Create my first account' });
  await expect(primary).toHaveAttribute('href', '/?demo=1');
  const primaryBox = await primary.boundingBox();
  const secondaryBox = await secondary.boundingBox();
  expect(Math.abs((primaryBox?.height ?? 0) - (secondaryBox?.height ?? 0))).toBeLessThanOrEqual(1);
  if ((viewport?.width ?? 0) <= 390) {
    for (const target of [
      page.getByRole('heading', { level: 1 }),
      page.getByText('For privacy-minded budgeters who track a few accounts from a phone.'),
      primary,
      secondary,
      page.getByText('Works offline after first visit'),
      page.getByText('No bank login'),
      page.getByText('Export CSV or encrypted backup')
    ]) {
      const box = await target.boundingBox();
      expect((box?.y ?? 10000) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport?.height ?? 0);
    }
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

test('@claim:demo-sandbox isolates, resets, and fully discards sample state without changing personal records', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create my first account' }).click();
  await page.getByLabel('Account name').fill('Real sentinel');
  await page.getByLabel('Balance right now').fill('73.25');
  await page.getByRole('button', { name: 'Create account' }).click();
  await page.evaluate(() => localStorage.setItem('pr:personal-probe', 'keep-exactly'));
  const personalBefore = await ledgerSnapshot(page, 'pocket-reconcile');

  await page.goto('/?demo=1');
  await expect(page).toHaveURL(/\?demo=1$/);
  await expect(page).toHaveTitle('Demo — Pocket Reconcile');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/demo$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Weekend cash' })).toBeVisible();
  await expect(page.getByText('Saturday market', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Demo controls')).toContainText('Demo — sample data, nothing is saved.');
  const namespaces = await page.evaluate(async () => ({
    databases: (await indexedDB.databases()).map(item => item.name),
    keys: Object.keys(localStorage)
  }));
  expect(namespaces.databases).toContain('demo:pocket-reconcile');
  expect(namespaces.keys.some(key => key.startsWith('demo:'))).toBe(true);
  expect(namespaces.keys).toContain('pr:personal-probe');
  await expect(page.locator('#account-select option')).toHaveCount(2);
  await page.getByLabel('Amount INR').fill('1.00');
  await page.getByLabel('Note').fill('Temporary demo entry');
  await page.getByRole('button', { name: 'Add to ledger' }).click();
  await expect(page.getByText('Temporary demo entry', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByText('Temporary demo entry', { exact: true })).toHaveCount(0);
  const resetCounts = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:pocket-reconcile');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const counts = await Promise.all(['accounts', 'transactions', 'reconciliations'].map(store => new Promise<number>((resolve, reject) => {
      const request = database.transaction(store).objectStore(store).count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    })));
    database.close();
    return counts;
  });
  expect(resetCounts).toEqual([2, 3, 1]);
  await page.getByLabel('Amount INR').fill('2.00');
  await page.getByLabel('Note').fill('Discard with demo');
  await page.getByRole('button', { name: 'Add to ledger' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Paper tone').selectOption('dark');
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('demo:')).sort())).toEqual([
    'demo:pr:selected-account',
    'demo:pr:theme'
  ]);
  await page.getByRole('button', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Real sentinel');
  await expect.poll(() => page.evaluate(async () => (await indexedDB.databases()).map(item => item.name))).not.toContain('demo:pocket-reconcile');
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => key.startsWith('demo:')))).toEqual([]);
  expect(await ledgerSnapshot(page, 'pocket-reconcile')).toBe(personalBefore);
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
  const rows = csv.trim().split('\n');
  expect(rows).toHaveLength(4);
  expect(rows[0]).toBe('date,account,account_type,currency,amount,note');
  expect(rows[0]).not.toContain('opening');
  expect(rows[0]).not.toContain('reconciliation');
  expect(csv).toContain('Saturday market');
  expect(csv).toContain('Daily card');
});

test('@claim:encrypted-backup exports a password-encrypted demo pack', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
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
  expect([...origins]).toEqual([new URL(page.url()).origin]);
  const storedText = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:pocket-reconcile');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const values = await Promise.all([...database.objectStoreNames].map(store => new Promise<unknown[]>((resolve, reject) => {
      const request = database.transaction(store).objectStore(store).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    })));
    database.close();
    return JSON.stringify({ localStorage: { ...localStorage }, values });
  });
  expect(storedText).not.toContain('demo-safe-password');
});

test('keeps restore controls hidden until a backup file is chosen', async ({ page }) => {
  await page.goto('/demo?screen=backup');
  await expect(page.getByLabel('Backup password', { exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Replace local ledger' })).toBeHidden();
  await page.locator('#backup-import').setInputFiles({
    name: 'restore.pocket',
    mimeType: 'application/json',
    buffer: Buffer.from('{}')
  });
  await expect(page.getByLabel('Backup password', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace local ledger' })).toBeVisible();
});

test('@claim:local-records keeps the demo flow on the product origin with no bank login', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', request => origins.add(new URL(request.url()).origin));
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Checks' }).click();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByLabel('Paper tone').selectOption('dark');
  await page.locator('button[data-nav="ledger"]').click();
  expect([...origins]).toEqual([new URL(page.url()).origin]);
  await expect.poll(() => page.evaluate(async () => (await indexedDB.databases()).map(item => item.name))).toContain('demo:pocket-reconcile');
  expect(await page.evaluate(() => localStorage.getItem('demo:pr:theme'))).toBe('dark');
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('@claim:exact-decimals stores every supported currency in exact smallest units', async ({ page }) => {
  await page.goto('/demo');
  const cases = [
    ['INR', '123.45', 12345],
    ['USD', '90071992547409.91', Number.MAX_SAFE_INTEGER],
    ['EUR', '123.45', 12345],
    ['GBP', '123.45', 12345],
    ['CAD', '123.45', 12345],
    ['AUD', '123.45', 12345],
    ['JPY', '123', 123]
  ] as const;
  for (const [currency, amount] of cases) {
    await page.getByRole('button', { name: 'Add account' }).click();
    await page.getByLabel('Account name').fill(`${currency} exact`);
    await page.getByLabel('Currency').selectOption(currency);
    await page.getByLabel('Balance right now').fill(amount);
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByRole('heading', { level: 1, name: `${currency} exact` })).toBeVisible();
    if (currency === 'USD') {
      await expect(page.getByText('$90,071,992,547,409.91', { exact: true }).first()).toBeVisible();
    }
  }
  const stored = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:pocket-reconcile');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const accounts = await new Promise<Array<{ currency: string; openingMinor: number }>>((resolve, reject) => {
      const request = database.transaction('accounts').objectStore('accounts').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return Object.fromEntries(accounts.filter(account => account.currency !== 'INR' || account.openingMinor === 12345).map(account => [account.currency, account.openingMinor]));
  });
  for (const [currency, , minor] of cases) expect(stored[currency]).toBe(minor);
});

test('@claim:core-ledger records an entry and closes an exact balance check', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Amount INR').fill('12.50');
  await page.getByLabel('Note').fill('Tea and snacks');
  await page.getByRole('button', { name: 'Add to ledger' }).click();
  await expect(page.getByText('₹92.00', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Start balance check' }).click();
  await page.getByRole('button', { name: 'Close this check' }).click();
  await page.getByRole('button', { name: 'Checks' }).click();
  await expect(page.getByText('₹92.00 observed')).toBeVisible();
});

test('@claim:csv-import imports a valid transaction into its named account', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.locator('#csv-import').setInputFiles({
    name: 'one-entry.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,account,amount,note\n2026-08-28,Weekend cash,1.05,Found coin')
  });
  await expect(page.getByRole('status')).toContainText('1 entry imported.');
  await page.locator('button[data-nav="ledger"]').click();
  await expect(page.getByText('Found coin', { exact: true })).toBeVisible();
  await expect(page.getByText('₹105.55', { exact: true }).first()).toBeVisible();
});

test('@claim:csv-amount-signs applies negative and positive imported amounts in opposite directions', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.locator('#csv-import').setInputFiles({
    name: 'signed-entries.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,account,amount,note\n2026-08-28,Weekend cash,-2.00,Bus fare\n2026-08-28,Weekend cash,5.00,Refund')
  });
  await expect(page.getByRole('status')).toContainText('2 entries imported.');
  await page.locator('button[data-nav="ledger"]').click();
  await expect(page.getByText('Bus fare', { exact: true })).toBeVisible();
  await expect(page.getByText('Refund', { exact: true })).toBeVisible();
  await expect(page.getByText('₹107.50', { exact: true }).first()).toBeVisible();
});

test('@claim:atomic-csv-import rejects every row when any imported row is invalid', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.locator('#csv-import').setInputFiles({
    name: 'mixed.csv', mimeType: 'text/csv',
    buffer: Buffer.from('date,account,amount,note\n2026-08-28,Weekend cash,5.00,Must not import\n2026-02-31,Weekend cash,-1.00,Impossible')
  });
  await expect(page.getByRole('status')).toContainText('Row 3: use a date like 2026-08-28.');
  await page.locator('button[data-nav="ledger"]').click();
  await expect(page.getByText('Must not import', { exact: true })).toHaveCount(0);
  await expect(page.getByText('2 total')).toBeVisible();
});

test('@claim:backup-restore restores every account, entry, and check from an encrypted backup', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.getByLabel('New backup password').fill('complete-demo-password');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const backupPath = await (await downloadPromise).path();
  expect(backupPath).not.toBeNull();
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Erase all local data' }).click();
  await page.locator('#confirm-delete').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reconcile cash and card balances.');
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.locator('#backup-import').setInputFiles(backupPath!);
  await page.getByLabel('Backup password', { exact: true }).fill('complete-demo-password');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Replace local ledger' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Weekend cash');
  await expect(page.locator('#account-select option')).toHaveCount(2);
  await expect(page.getByText('Saturday market', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Checks' }).click();
  await expect(page.getByText('₹104.50 observed')).toBeVisible();
});

test('@claim:backup-password-recovery rejects a wrong password and accepts only the backup password', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Backup' }).click();
  await page.getByLabel('New backup password').fill('right-demo-password');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download encrypted backup' }).click();
  const backupPath = await (await downloadPromise).path();
  await page.locator('#backup-import').setInputFiles(backupPath!);
  await page.getByLabel('Backup password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Replace local ledger' }).click();
  await expect(page.locator('#backup-error')).toContainText('Check the password and file.');
  await page.getByLabel('Backup password', { exact: true }).fill('right-demo-password');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Replace local ledger' }).click();
  await expect(page.getByRole('status')).toContainText('Encrypted backup restored.');
});

test('@claim:erase-ledger erases every local ledger record after confirmation', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.getByRole('button', { name: 'Erase all local data' }).click();
  await expect(page.getByText('2 accounts, 3 entries, and 1 checks will be permanently deleted')).toBeVisible();
  await page.locator('#confirm-delete').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reconcile cash and card balances.');
  const counts = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:pocket-reconcile');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const counts = await Promise.all(['accounts', 'transactions', 'reconciliations'].map(store => new Promise<number>((resolve, reject) => {
      const request = database.transaction(store).objectStore(store).count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    })));
    database.close();
    return counts;
  });
  expect(counts).toEqual([0, 0, 0]);
});

test('@claim:discrepancy-note requires and records a note when balances differ', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Start balance check' }).click();
  await page.getByLabel('Counted balance INR').fill('103.50');
  await page.getByRole('button', { name: 'Close this check' }).click();
  await expect(page.locator('#reconcile-error')).toContainText('Add a note explaining this difference');
  await expect(page.getByLabel('Discrepancy note')).toBeFocused();
  await page.getByLabel('Discrepancy note').fill('One rupee used for parking');
  await page.getByRole('button', { name: 'Close this check' }).click();
  await page.getByRole('button', { name: 'Checks' }).click();
  await expect(page.getByText('One rupee used for parking', { exact: false })).toBeVisible();
});

test('browser Back restores section URL, title, focus, and announcement', async ({ page }) => {
  await page.goto('/demo?screen=backup');
  await expect(page.getByRole('heading', { level: 1, name: 'Back up and restore' })).toBeVisible();
  await expect(page).toHaveTitle('Backup — Pocket Reconcile');
  await page.reload();
  await expect(page).toHaveURL(/\/demo\?screen=backup$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Back up and restore' })).toBeVisible();
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Checks' }).click();
  await expect(page).toHaveURL(/\/demo\?screen=checks$/);
  await expect(page).toHaveTitle('Checks — Pocket Reconcile');
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\/demo\?screen=settings$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/demo\?screen=checks$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Balance checks' })).toBeFocused();
  await expect(page.locator('#route-status')).toHaveText('Checks screen');
  await page.goForward();
  await expect(page.getByRole('heading', { level: 1, name: 'Ledger settings' })).toBeFocused();
});

test('landing has the required sequence and every route has release metadata', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 2, name: 'How it works' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'What it does not do' })).toBeVisible();
  await expect(page.getByText('Built by Param Factory')).toBeVisible();
  const routes = {
    '/': 'Pocket Reconcile — private, offline balance checks',
    '/demo': 'Demo — Pocket Reconcile',
    '/privacy/': 'Privacy — Pocket Reconcile',
    '/terms/': 'Terms — Pocket Reconcile',
    '/404.html': 'Page not found — Pocket Reconcile',
    '/offline.html': 'Offline — Pocket Reconcile'
  };
  for (const [path, title] of Object.entries(routes)) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-card\.jpg$/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/icons/icon.svg');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/icons/apple-touch-icon.png');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes', '180x180');
    await expect(page.getByText('Built by Param Factory')).toBeVisible();
    await expect(page.getByText('Version 1.0.1')).toBeVisible();
  }
  const socialSize = await page.evaluate(async () => {
    const image = await createImageBitmap(await (await fetch('/assets/social-card.jpg')).blob());
    return [image.width, image.height];
  });
  expect(socialSize).toEqual([1200, 630]);
  const appleTouchSize = await page.evaluate(async () => {
    const image = await createImageBitmap(await (await fetch('/icons/apple-touch-icon.png')).blob());
    return [image.width, image.height];
  });
  expect(appleTouchSize).toEqual([180, 180]);
});

test('uses the same primary route links on the ledger and legal pages', async ({ page }) => {
  for (const path of ['/', '/demo', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Ledger' })).toHaveAttribute('href', /^(\/|\/demo)$/);
    await expect(nav.getByRole('link', { name: 'Demo' })).toHaveAttribute('href', '/demo');
    await expect(nav.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/privacy/');
    await expect(nav.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms/');
    if ((page.viewportSize()?.width ?? 0) <= 390) {
      const boxes = await Promise.all(['Ledger', 'Demo', 'Privacy', 'Terms'].map(name => nav.getByRole('link', { name }).boundingBox()));
      for (const box of boxes) {
        expect(box?.width).toBeGreaterThanOrEqual(44);
        expect(box?.height).toBeGreaterThanOrEqual(44);
      }
      for (let index = 1; index < boxes.length; index += 1) {
        expect(boxes[index]!.x).toBeGreaterThanOrEqual(boxes[index - 1]!.x + boxes[index - 1]!.width);
      }
    }
  }
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy policy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Terms of use');
  await page.goto('/404.html');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found');
});

test('explains excess currency precision instead of calling it zero', async ({ page }) => {
  await page.goto('/demo');
  await page.getByLabel('Amount INR').fill('0.001');
  await page.getByLabel('Note').fill('Precision probe');
  await page.getByRole('button', { name: 'Add to ledger' }).click();
  await expect(page.locator('#amount-error')).toHaveText('INR supports 2 decimal places. Round the amount and try again.');
});
