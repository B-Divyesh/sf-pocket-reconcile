import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('creates an account, records an entry, and reconciles exactly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Bring the numbers back into agreement.');
  await page.getByRole('button', { name: 'Plant my first account' }).click();
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
  await page.getByRole('button', { name: 'Plant my first account' }).click();
  await page.getByLabel('Account name').fill('Boundary wallet');
  await page.getByLabel('Currency').selectOption('USD');
  await page.getByLabel('Balance right now').fill('90071992547409.91');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByText('$90,071,992,547,409.91', { exact: true }).first()).toBeVisible();
});

test('rejects an impossible CSV date without changing the ledger', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Plant my first account' }).click();
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

test('supports the primary keyboard path and dialog focus', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to ledger' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.getByRole('button', { name: 'Plant my first account' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Account name')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Plant my first account' })).toBeFocused();
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

test('installed app shell opens offline', async ({ page, context }) => {
  await page.goto('/');
  await page.waitForFunction(() => navigator.serviceWorker?.ready);
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText('Offline · ready')).toBeVisible();
});
