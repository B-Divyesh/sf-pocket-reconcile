import './styles.css';
import type { Account, AppData, Currency, Reconciliation, Transaction } from './types';
import { db, eraseData, loadData, replaceData } from './db';
import { exportCsv, parseCsv } from './csv';
import { decryptBackup, encryptBackup } from './backup';
import { formatMoney, moneyInput, parseMoney } from './money';
import { cachedLicense, captureLicenseFromUrl, checkoutUrl, clearLicense, storeLicense, verifyLicense, type LicenseState } from './license';

type Screen = 'ledger' | 'history' | 'backup' | 'field-kit' | 'settings';

const appNode = document.querySelector<HTMLDivElement>('#app');
if (!appNode) throw new Error('App root is missing.');
const app: HTMLDivElement = appNode;

let data: AppData = { version: 1, accounts: [], transactions: [], reconciliations: [] };
let selectedId = localStorage.getItem('pr:selected-account');
let screen: Screen = 'ledger';
let reconcileOpen = false;
let license: LicenseState = cachedLicense();
let deletedTransaction: Transaction | null = null;
let toastTimer = 0;

const currencies: Currency[] = ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];
const today = () => new Date().toISOString().slice(0, 10);
const h = (value: unknown) => String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char);
const dateLabel = (value: string | number) => new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' }).format(typeof value === 'number' ? value : new Date(`${value}T12:00:00`));

function selectedAccount(): Account | undefined {
  return data.accounts.find(account => account.id === selectedId && !account.archived) ?? data.accounts.find(account => !account.archived);
}

function accountTransactions(accountId: string): Transaction[] {
  return data.transactions.filter(item => item.accountId === accountId).sort((a, b) => b.occurredOn.localeCompare(a.occurredOn) || b.createdAt - a.createdAt);
}

function accountReconciliations(accountId: string): Reconciliation[] {
  return data.reconciliations.filter(item => item.accountId === accountId).sort((a, b) => b.reconciledAt - a.reconciledAt);
}

export function expectedBalance(account: Account, transactions: Transaction[], reconciliations: Reconciliation[]): number {
  const latest = [...reconciliations].sort((a, b) => b.reconciledAt - a.reconciledAt)[0];
  const baseline = latest?.observedMinor ?? account.openingMinor;
  const cutoff = latest?.transactionCutoff ?? 0;
  return baseline + transactions.filter(item => item.createdAt > cutoff).reduce((sum, item) => sum + item.amountMinor, 0);
}

function announce(message: string, action?: { label: string; handler: string }): void {
  const region = document.querySelector<HTMLDivElement>('#toast');
  if (!region) return;
  window.clearTimeout(toastTimer);
  region.innerHTML = `<span>${h(message)}</span>${action ? `<button type="button" data-action="${action.handler}">${h(action.label)}</button>` : ''}`;
  region.hidden = false;
  toastTimer = window.setTimeout(() => { region.hidden = true; }, action ? 9000 : 4200);
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url; link.download = name; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function shell(): void {
  const online = navigator.onLine;
  app.innerHTML = `
    <header class="app-header">
      <a class="brand" href="#ledger" data-nav="ledger" aria-label="Pocket Reconcile, ledger">
        <svg aria-hidden="true" viewBox="0 0 42 42"><path d="M10 34C10 20 18 8 34 7c-1 16-9 25-24 27Z"/><path d="M10 34c7-9 13-15 22-23M20 24l-1-8m6 2 7 1"/></svg>
        <span>Pocket<br><em>Reconcile</em></span>
      </a>
      <div class="header-tools">
        <span id="connection" class="connection ${online ? '' : 'is-offline'}"><span aria-hidden="true"></span>${online ? 'On device' : 'Offline · ready'}</span>
        <button class="icon-button" type="button" data-action="toggle-theme" aria-label="Change color theme" title="Change color theme"><span aria-hidden="true">◐</span></button>
      </div>
    </header>
    <nav class="index-nav" aria-label="Field guide sections">
      ${navButton('ledger', '01', 'Ledger')}
      ${navButton('history', '02', 'Checks')}
      ${navButton('backup', '03', 'Backup')}
      ${navButton('field-kit', '04', 'Field Kit')}
      ${navButton('settings', '05', 'Settings')}
    </nav>
    <main id="main" tabindex="-1">${renderScreen()}</main>
    <footer class="app-footer">
      <p>Your records stay on this device.</p>
      <p><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><span>Generated botanical artwork</span></p>
    </footer>
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
    ${accountDialog()}
    ${deleteDialog()}
  `;
  bindEvents();
}

function navButton(id: Screen, number: string, label: string): string {
  return `<button type="button" data-nav="${id}" ${screen === id ? 'aria-current="page"' : ''}><span>${number}</span>${label}</button>`;
}

function renderScreen(): string {
  if (screen === 'history') return renderHistory();
  if (screen === 'backup') return renderBackup();
  if (screen === 'field-kit') return renderFieldKit();
  if (screen === 'settings') return renderSettings();
  return renderLedger();
}

function renderLedger(): string {
  if (!data.accounts.length) return `
    <section class="welcome" aria-labelledby="welcome-title">
      <div class="welcome-copy">
        <p class="eyebrow">A two-minute balance check</p>
        <h1 id="welcome-title">Bring the numbers back into agreement.</h1>
        <p class="lede">Record the handful of things your bank or memory missed, count what is actually there, and close the check. No bank login. No cloud ledger.</p>
        <button class="primary" type="button" data-action="open-account">Plant my first account</button>
        <ul class="trust-list" aria-label="Product promises"><li>Works offline</li><li>Exact decimal arithmetic</li><li>Encrypted backups</li></ul>
      </div>
      <figure class="hero-figure"><picture><source srcset="/assets/pressed-ledger-384.webp 384w, /assets/pressed-ledger.webp 768w" sizes="(max-width: 760px) calc(100vw - 48px), 465px" type="image/webp"><img src="/assets/pressed-ledger.jpg" width="768" height="512" alt="An open field notebook with a fern aligned across two ledger columns" fetchpriority="high" decoding="async"></picture><figcaption>Observe · record · reconcile</figcaption></figure>
    </section>`;

  const account = selectedAccount();
  if (!account) return '<h1>Ledger</h1><p>No active account is available.</p>';
  selectedId = account.id;
  localStorage.setItem('pr:selected-account', account.id);
  const transactions = accountTransactions(account.id);
  const reconciliations = accountReconciliations(account.id);
  const expected = expectedBalance(account, transactions, reconciliations);
  const latest = reconciliations[0];
  return `
    <section class="ledger-head">
      <div><p class="eyebrow">Field ledger · ${h(account.kind)}</p><h1>${h(account.name)}</h1><p class="balance-label">Expected balance</p><p class="big-balance">${h(formatMoney(expected, account.currency))}</p><p class="balance-basis">${latest ? `Since your ${h(dateLabel(latest.reconciledAt))} check` : `Opening balance plus ${transactions.length} ${transactions.length === 1 ? 'entry' : 'entries'}`}</p></div>
      <div class="account-switcher"><label for="account-select">Account</label><div><select id="account-select">${data.accounts.filter(item => !item.archived).map(item => `<option value="${item.id}" ${item.id === account.id ? 'selected' : ''}>${h(item.name)}</option>`).join('')}</select><button class="small-button" type="button" data-action="open-account">Add account</button></div></div>
    </section>
    <div class="ledger-grid">
      <section class="work-sheet" aria-labelledby="quick-title">
        <div class="section-heading"><div><p class="eyebrow">Quick entry</p><h2 id="quick-title">What changed?</h2></div><span class="specimen-number">A–${String(transactions.length + 1).padStart(2, '0')}</span></div>
        <form id="transaction-form" class="transaction-form">
          <fieldset><legend>Direction</legend><div class="segmented"><label><input type="radio" name="direction" value="spent" checked><span>Spent</span></label><label><input type="radio" name="direction" value="received"><span>Received</span></label></div></fieldset>
          <div class="amount-field"><label for="amount">Amount <span>${account.currency}</span></label><input id="amount" name="amount" inputmode="decimal" autocomplete="off" required placeholder="0${account.currency === 'JPY' ? '' : '.00'}"><p id="amount-error" class="field-error" aria-live="polite"></p></div>
          <div class="form-row"><div><label for="note">Note</label><input id="note" name="note" maxlength="80" required placeholder="Groceries, cash tip…"></div><div><label for="date">Date</label><input id="date" name="date" type="date" value="${today()}" required></div></div>
          <button class="primary" type="submit">Add to ledger</button>
        </form>
      </section>
      <section class="reconcile-card ${reconcileOpen ? 'is-open' : ''}" aria-labelledby="reconcile-title">
        <div class="section-heading"><div><p class="eyebrow">Balance snapshot</p><h2 id="reconcile-title">Count what’s there</h2></div><span class="seal-mark" aria-hidden="true">✓</span></div>
        ${reconcileOpen ? reconcileForm(account, expected) : `<p>Compare this ledger with the cash, card, or wallet in front of you.</p><dl class="measurement"><div><dt>Ledger says</dt><dd>${h(formatMoney(expected, account.currency))}</dd></div><div><dt>Last checked</dt><dd>${latest ? h(dateLabel(latest.reconciledAt)) : 'Not yet'}</dd></div></dl><button class="primary" type="button" data-action="start-reconcile">Start balance check</button>`}
      </section>
    </div>
    <section class="entries" aria-labelledby="entries-title">
      <div class="section-heading"><div><p class="eyebrow">Recent specimens</p><h2 id="entries-title">Ledger entries</h2></div><span>${transactions.length} total</span></div>
      ${transactions.length ? `<ul class="entry-list">${transactions.slice(0, 20).map(item => transactionRow(item, account)).join('')}</ul>${transactions.length > 20 ? '<p class="muted">Showing the 20 most recent entries. Your full ledger is included in exports.</p>' : ''}` : `<div class="small-empty"><span aria-hidden="true">↳</span><p><strong>The page is clear.</strong><br>Add only what changed since your opening balance.</p></div>`}
    </section>`;
}

function reconcileForm(account: Account, expected: number): string {
  return `<form id="reconcile-form" class="reconcile-form">
    <p>Enter the balance you can see now. A difference needs a note so future you knows what happened.</p>
    <div><label for="observed">Counted balance <span>${account.currency}</span></label><input id="observed" name="observed" inputmode="decimal" value="${h(moneyInput(expected, account.currency))}" required></div>
    <div class="difference-preview" id="difference-preview"><span>Difference</span><strong>${h(formatMoney(0, account.currency, true))}</strong></div>
    <div id="discrepancy-wrap" hidden><label for="discrepancy-note">Discrepancy note <span>Required when different</span></label><textarea id="discrepancy-note" name="discrepancyNote" maxlength="160" rows="2" placeholder="Cash count includes an unrecorded purchase"></textarea></div>
    <p id="reconcile-error" class="field-error" aria-live="polite"></p>
    <div class="button-row"><button class="primary" type="submit">Close this check</button><button class="quiet" type="button" data-action="cancel-reconcile">Cancel</button></div>
  </form>`;
}

function transactionRow(item: Transaction, account: Account): string {
  return `<li><span class="entry-date">${h(new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(new Date(`${item.occurredOn}T12:00:00`)))}</span><span class="entry-note">${h(item.note)}</span><strong class="${item.amountMinor >= 0 ? 'positive' : ''}">${h(formatMoney(item.amountMinor, account.currency, true))}</strong><button type="button" data-delete-transaction="${item.id}" aria-label="Delete ${h(item.note)} entry">×</button></li>`;
}

function renderHistory(): string {
  const checks = [...data.reconciliations].sort((a, b) => b.reconciledAt - a.reconciledAt);
  return `<section class="page-head"><p class="eyebrow">Field guide 02</p><h1>Balance checks</h1><p class="lede">Every closed check, including the differences you chose to carry forward.</p></section>
    ${checks.length ? `<ol class="check-list">${checks.map(check => {
      const account = data.accounts.find(item => item.id === check.accountId);
      if (!account) return '';
      const matched = check.differenceMinor === 0;
      return `<li><div class="check-seal ${matched ? 'matched' : 'different'}"><span aria-hidden="true">${matched ? '✓' : 'Δ'}</span>${matched ? 'Matched' : 'Noted'}</div><div><p class="eyebrow">${h(account.name)} · ${h(dateLabel(check.reconciledAt))}</p><h2>${h(formatMoney(check.observedMinor, account.currency))} observed</h2><dl class="check-values"><div><dt>Expected</dt><dd>${h(formatMoney(check.expectedMinor, account.currency))}</dd></div><div><dt>Difference</dt><dd>${h(formatMoney(check.differenceMinor, account.currency, true))}</dd></div></dl>${check.note ? `<p class="check-note">“${h(check.note)}”</p>` : ''}</div></li>`;
    }).join('')}</ol>` : `<div class="page-empty"><span aria-hidden="true">◎</span><h2>No checks pressed yet</h2><p>Open the Ledger and start a balance check when you have the real balance in front of you.</p><button class="primary" data-nav="ledger" type="button">Go to ledger</button></div>`}`;
}

function renderBackup(): string {
  const count = data.accounts.length + data.transactions.length + data.reconciliations.length;
  return `<section class="page-head"><p class="eyebrow">Field guide 03</p><h1>Pack and restore</h1><p class="lede">Your browser is the only home for this ledger. Keep a copy somewhere you control.</p></section>
    <div class="backup-grid">
      <section class="backup-block"><span class="plate-number">Plate A</span><h2>Portable CSV</h2><p>Exports transaction rows for spreadsheets. Account opening balances and check history are not included.</p><button class="secondary" type="button" data-action="export-csv" ${data.transactions.length ? '' : 'disabled'}>Export CSV</button><label class="file-button">Import CSV<input id="csv-import" type="file" accept=".csv,text/csv"></label><details><summary>Required CSV columns</summary><code>date,account,amount,note</code><p>Account names must already exist. Use negative amounts for spending.</p></details></section>
      <section class="backup-block featured"><span class="plate-number">Plate B · complete</span><h2>Encrypted field pack</h2><p>Includes all ${count} local records. AES-256-GCM encryption happens on this device; the password is never stored.</p><form id="backup-form"><label for="backup-password">New backup password <span>8+ characters</span></label><input id="backup-password" name="password" type="password" minlength="8" autocomplete="new-password" required><button class="primary" type="submit" ${count ? '' : 'disabled'}>Download encrypted backup</button></form><hr><label class="file-button">Choose backup to restore<input id="backup-import" type="file" accept=".pocket,.json,application/json"></label><div id="restore-password-wrap" hidden><label for="restore-password">Backup password</label><input id="restore-password" type="password" autocomplete="current-password"><button class="secondary" type="button" data-action="restore-backup">Replace local ledger</button></div><p id="backup-error" class="field-error" aria-live="polite"></p><p class="fine-print">No password recovery is possible. Test important backups on another browser profile.</p></section>
    </div>`;
}

function renderFieldKit(): string {
  return `<section class="field-kit-head"><div><p class="eyebrow">A one-time field upgrade</p><h1>Keep more ledgers in the same pocket.</h1><p class="lede">The free edition includes two accounts, every reconciliation tool, CSV, and encrypted backups. Field Kit supports the product and removes the account limit.</p><p class="price"><strong>₹499</strong><span>one time</span></p><a class="primary button-link" href="${checkoutUrl()}">Buy Field Kit</a><p class="merchant">Secure checkout by Sociobot/Dodo, the merchant of record. Refunds are handled there.</p></div><div class="kit-card"><p class="eyebrow">Field Kit includes</p><ul><li><span>∞</span><div><strong>Unlimited accounts</strong><p>Keep cash, cards, and travel wallets separate.</p></div></li><li><span>◐</span><div><strong>Manual appearance</strong><p>Keep light or night paper independent of your device.</p></div></li><li><span>↗</span><div><strong>Future Field Kit additions</strong><p>One purchase for this product, not a subscription.</p></div></li></ul></div></section>
    <section class="restore-license"><div><p class="eyebrow">${license.valid ? 'License active' : 'Already purchased?'}</p><h2>${license.valid ? 'Field Kit is pressed into this device.' : 'Restore your field key'}</h2><p>${license.notice ? h(license.notice) : license.valid ? 'Unlimited accounts and manual appearance are unlocked.' : 'Paste the license token from your receipt. Verification needs a connection once.'}</p></div>${license.valid ? `<button class="quiet danger-text" type="button" data-action="remove-license">Remove from device</button>` : `<form id="license-form"><label for="license-token">License token</label><div><input id="license-token" name="token" autocomplete="off" required><button class="secondary" type="submit">Verify license</button></div><p id="license-error" class="field-error" aria-live="polite"></p></form>`}</section>
    <p class="legal-line">By purchasing, you agree to the <a href="/terms/">terms</a>. Learn how license verification works in the <a href="/privacy/">privacy policy</a>.</p>`;
}

function renderSettings(): string {
  return `<section class="page-head"><p class="eyebrow">Field guide 05</p><h1>Notebook settings</h1><p class="lede">Manage accounts, paper tone, and the local records on this device.</p></section>
    <div class="settings-list">
      <section><div><h2>Paper tone</h2><p>${license.valid ? 'Field Kit lets you choose a fixed tone.' : 'Free edition follows your device. Field Kit unlocks a fixed choice.'}</p></div><select id="theme-setting" ${license.valid ? '' : 'disabled'} aria-label="Paper tone"><option value="system">Follow device</option><option value="light">Day paper</option><option value="dark">Night paper</option></select></section>
      <section class="accounts-setting"><div><h2>Accounts</h2><p>${data.accounts.length} of ${license.valid ? 'unlimited' : '2 free'} used</p></div><div class="account-manage">${data.accounts.map(account => `<div><span><strong>${h(account.name)}</strong><small>${h(account.currency)} · ${h(account.kind)}</small></span><button type="button" class="quiet danger-text" data-delete-account="${account.id}">Delete</button></div>`).join('')}<button type="button" class="secondary" data-action="open-account">Add account</button></div></section>
      <section class="danger-zone"><div><h2>Erase this notebook</h2><p>Permanently deletes accounts, entries, and checks from this browser. Export a backup first.</p></div><button type="button" class="danger-button" data-action="erase-all">Erase all local data</button></section>
    </div>`;
}

function accountDialog(): string {
  return `<dialog id="account-dialog"><form id="account-form" method="dialog"><div class="dialog-head"><div><p class="eyebrow">New specimen</p><h2>Add an account</h2></div><button type="button" class="icon-button" data-action="close-account" aria-label="Close">×</button></div><label for="account-name">Account name</label><input id="account-name" name="name" maxlength="40" required placeholder="Pocket cash"><div class="form-row"><div><label for="account-kind">Type</label><select id="account-kind" name="kind"><option value="cash">Cash</option><option value="card">Card</option><option value="other">Other</option></select></div><div><label for="currency">Currency</label><select id="currency" name="currency">${currencies.map(value => `<option ${value === 'INR' ? 'selected' : ''}>${value}</option>`).join('')}</select></div></div><label for="opening">Balance right now</label><input id="opening" name="opening" inputmode="decimal" required value="0.00"><p class="field-hint">This becomes the starting measurement. Add only later changes.</p><p id="account-error" class="field-error" aria-live="polite"></p><button class="primary" type="submit">Create account</button></form></dialog>`;
}

function deleteDialog(): string {
  return `<dialog id="confirm-dialog"><form method="dialog"><div class="dialog-head"><div><p class="eyebrow">Permanent action</p><h2 id="confirm-title">Delete this record?</h2></div></div><p id="confirm-copy"></p><div class="button-row"><button id="confirm-delete" class="danger-button" value="confirm">Delete</button><button class="quiet" value="cancel">Keep it</button></div></form></dialog>`;
}

function bindEvents(): void {
  document.querySelectorAll<HTMLElement>('[data-nav]').forEach(element => element.addEventListener('click', () => {
    screen = element.dataset.nav as Screen; reconcileOpen = false; history.replaceState({}, '', `#${screen}`); shell(); document.querySelector<HTMLElement>('#main')?.focus();
  }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach(element => element.addEventListener('click', () => void handleAction(element.dataset.action ?? '')));
  document.querySelector<HTMLSelectElement>('#account-select')?.addEventListener('change', event => { selectedId = (event.target as HTMLSelectElement).value; shell(); });
  document.querySelector<HTMLFormElement>('#account-form')?.addEventListener('submit', event => void addAccount(event));
  document.querySelector<HTMLFormElement>('#transaction-form')?.addEventListener('submit', event => void addTransaction(event));
  document.querySelector<HTMLFormElement>('#reconcile-form')?.addEventListener('submit', event => void reconcile(event));
  document.querySelector<HTMLInputElement>('#observed')?.addEventListener('input', updateDifference);
  document.querySelectorAll<HTMLElement>('[data-delete-transaction]').forEach(button => button.addEventListener('click', () => confirmTransactionDelete(button.dataset.deleteTransaction ?? '')));
  document.querySelectorAll<HTMLElement>('[data-delete-account]').forEach(button => button.addEventListener('click', () => confirmAccountDelete(button.dataset.deleteAccount ?? '')));
  document.querySelector<HTMLFormElement>('#backup-form')?.addEventListener('submit', event => void exportBackup(event));
  document.querySelector<HTMLInputElement>('#csv-import')?.addEventListener('change', event => void importCsvFile(event));
  document.querySelector<HTMLInputElement>('#backup-import')?.addEventListener('change', showRestorePassword);
  document.querySelector<HTMLFormElement>('#license-form')?.addEventListener('submit', event => void restoreLicense(event));
  const themeSelect = document.querySelector<HTMLSelectElement>('#theme-setting');
  if (themeSelect) { themeSelect.value = localStorage.getItem('pr:theme') ?? 'system'; themeSelect.addEventListener('change', () => { localStorage.setItem('pr:theme', themeSelect.value); applyTheme(); }); }
}

async function handleAction(action: string): Promise<void> {
  if (action === 'open-account') {
    if (!license.valid && data.accounts.length >= 2) { screen = 'field-kit'; shell(); announce('The free edition includes two accounts. Field Kit removes the limit.'); return; }
    const dialog = document.querySelector<HTMLDialogElement>('#account-dialog'); dialog?.showModal(); document.querySelector<HTMLInputElement>('#account-name')?.focus();
  }
  if (action === 'close-account') document.querySelector<HTMLDialogElement>('#account-dialog')?.close();
  if (action === 'start-reconcile') { reconcileOpen = true; shell(); document.querySelector<HTMLInputElement>('#observed')?.select(); }
  if (action === 'cancel-reconcile') { reconcileOpen = false; shell(); }
  if (action === 'export-csv') { download(`pocket-reconcile-${today()}.csv`, exportCsv(data), 'text/csv;charset=utf-8'); announce('CSV exported.'); }
  if (action === 'restore-backup') await restoreBackup();
  if (action === 'remove-license') { clearLicense(); license = cachedLicense(); applyTheme(); shell(); announce('License removed from this device.'); }
  if (action === 'toggle-theme') toggleTheme();
  if (action === 'erase-all') confirmEraseAll();
  if (action === 'undo-transaction' && deletedTransaction) { await db.put('transactions', deletedTransaction); data.transactions.push(deletedTransaction); deletedTransaction = null; shell(); announce('Entry restored.'); }
  if (action === 'reload-update') location.reload();
}

async function addAccount(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const values = new FormData(form);
  const currency = values.get('currency') as Currency;
  const openingMinor = parseMoney(String(values.get('opening') ?? ''), currency);
  const error = document.querySelector('#account-error');
  if (openingMinor === null) { if (error) error.textContent = `Enter a valid ${currency} amount.`; return; }
  const account: Account = { id: crypto.randomUUID(), name: String(values.get('name') ?? '').trim(), kind: values.get('kind') as Account['kind'], currency, openingMinor, createdAt: Date.now() };
  if (!account.name) { if (error) error.textContent = 'Give this account a name.'; return; }
  await db.put('accounts', account); data.accounts.push(account); selectedId = account.id; document.querySelector<HTMLDialogElement>('#account-dialog')?.close(); shell(); announce(`${account.name} created on this device.`);
}

async function addTransaction(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const account = selectedAccount(); if (!account) return;
  const form = event.currentTarget as HTMLFormElement;
  const values = new FormData(form);
  let amount = parseMoney(String(values.get('amount') ?? ''), account.currency);
  const error = document.querySelector('#amount-error');
  if (amount === null || amount === 0) { if (error) error.textContent = 'Enter an amount other than zero.'; return; }
  amount = Math.abs(amount) * (values.get('direction') === 'spent' ? -1 : 1);
  const transaction: Transaction = { id: crypto.randomUUID(), accountId: account.id, amountMinor: amount, note: String(values.get('note') ?? '').trim(), occurredOn: String(values.get('date')), createdAt: Date.now() };
  if (!transaction.note) { if (error) error.textContent = 'Add a short note so you can identify this entry.'; return; }
  await db.put('transactions', transaction); data.transactions.push(transaction); shell(); document.querySelector<HTMLInputElement>('#amount')?.focus(); announce(`${transaction.note} added: ${formatMoney(amount, account.currency, true)}.`);
}

function updateDifference(): void {
  const account = selectedAccount(); if (!account) return;
  const observed = parseMoney(document.querySelector<HTMLInputElement>('#observed')?.value ?? '', account.currency);
  const expected = expectedBalance(account, accountTransactions(account.id), accountReconciliations(account.id));
  const preview = document.querySelector('#difference-preview strong');
  const wrap = document.querySelector<HTMLElement>('#discrepancy-wrap');
  if (preview) preview.textContent = observed === null ? '—' : formatMoney(observed - expected, account.currency, true);
  if (wrap) wrap.hidden = observed === null || observed === expected;
}

async function reconcile(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const account = selectedAccount(); if (!account) return;
  const values = new FormData(event.currentTarget as HTMLFormElement);
  const observedMinor = parseMoney(String(values.get('observed') ?? ''), account.currency);
  const expectedMinor = expectedBalance(account, accountTransactions(account.id), accountReconciliations(account.id));
  const note = String(values.get('discrepancyNote') ?? '').trim();
  const error = document.querySelector('#reconcile-error');
  if (observedMinor === null) { if (error) error.textContent = 'Enter the balance shown by your cash, card, or wallet.'; return; }
  if (observedMinor !== expectedMinor && !note) { if (error) error.textContent = 'Add a note explaining this difference before closing the check.'; document.querySelector<HTMLTextAreaElement>('#discrepancy-note')?.focus(); return; }
  const now = Date.now();
  const check: Reconciliation = { id: crypto.randomUUID(), accountId: account.id, expectedMinor, observedMinor, differenceMinor: observedMinor - expectedMinor, note, reconciledAt: now, transactionCutoff: now };
  await db.put('reconciliations', check); data.reconciliations.push(check); reconcileOpen = false; shell(); announce(check.differenceMinor === 0 ? `${account.name} matched exactly.` : `Difference recorded. ${account.name} now starts from the counted balance.`);
}

function confirmTransactionDelete(id: string): void {
  const item = data.transactions.find(value => value.id === id); if (!item) return;
  showConfirm('Delete this entry?', `“${item.note}” will be removed from the expected balance.`, async () => {
    await db.delete('transactions', item.id); data.transactions = data.transactions.filter(value => value.id !== item.id); deletedTransaction = item; shell(); announce('Entry deleted.', { label: 'Undo', handler: 'undo-transaction' });
  });
}

function confirmAccountDelete(id: string): void {
  const account = data.accounts.find(value => value.id === id); if (!account) return;
  showConfirm(`Delete ${account.name}?`, 'Its entries and balance-check history will also be permanently deleted.', async () => {
    const transactionIds = data.transactions.filter(item => item.accountId === id).map(item => item.id);
    const checkIds = data.reconciliations.filter(item => item.accountId === id).map(item => item.id);
    await Promise.all([db.delete('accounts', id), ...transactionIds.map(key => db.delete('transactions', key)), ...checkIds.map(key => db.delete('reconciliations', key))]);
    data.accounts = data.accounts.filter(item => item.id !== id); data.transactions = data.transactions.filter(item => item.accountId !== id); data.reconciliations = data.reconciliations.filter(item => item.accountId !== id); selectedId = null; shell(); announce(`${account.name} deleted.`);
  });
}

function confirmEraseAll(): void {
  showConfirm('Erase the whole notebook?', `${data.accounts.length} accounts, ${data.transactions.length} entries, and ${data.reconciliations.length} checks will be permanently deleted from this browser.`, async () => { await eraseData(); data = { version: 1, accounts: [], transactions: [], reconciliations: [] }; selectedId = null; screen = 'ledger'; shell(); announce('All local ledger data erased.'); });
}

function showConfirm(title: string, copy: string, action: () => Promise<void>): void {
  const dialog = document.querySelector<HTMLDialogElement>('#confirm-dialog');
  const titleNode = document.querySelector('#confirm-title'); const copyNode = document.querySelector('#confirm-copy'); const button = document.querySelector<HTMLButtonElement>('#confirm-delete');
  if (!dialog || !titleNode || !copyNode || !button) return;
  titleNode.textContent = title; copyNode.textContent = copy;
  button.onclick = event => { event.preventDefault(); dialog.close(); void action(); };
  dialog.showModal(); button.focus();
}

async function exportBackup(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  const password = String(new FormData(event.currentTarget as HTMLFormElement).get('password') ?? '');
  const error = document.querySelector('#backup-error');
  try { const content = await encryptBackup(data, password); download(`pocket-reconcile-${today()}.pocket`, content, 'application/json'); announce('Encrypted backup downloaded. Keep its password separately.'); }
  catch (reason) { if (error) error.textContent = reason instanceof Error ? reason.message : 'Could not create the backup.'; }
}

async function importCsvFile(event: Event): Promise<void> {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  const result = parseCsv(await file.text(), data.accounts);
  if (result.errors.length) { announce(`${result.errors[0]}${result.errors.length > 1 ? ` ${result.errors.length - 1} more row errors.` : ''}`); return; }
  for (const item of result.transactions) await db.put('transactions', item);
  data.transactions.push(...result.transactions); announce(`${result.transactions.length} ${result.transactions.length === 1 ? 'entry' : 'entries'} imported.`); (event.target as HTMLInputElement).value = '';
}

let pendingBackupFile: File | null = null;
function showRestorePassword(event: Event): void {
  pendingBackupFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  const wrap = document.querySelector<HTMLElement>('#restore-password-wrap'); if (wrap) wrap.hidden = !pendingBackupFile;
  document.querySelector<HTMLInputElement>('#restore-password')?.focus();
}

async function restoreBackup(): Promise<void> {
  const error = document.querySelector('#backup-error');
  if (!pendingBackupFile) { if (error) error.textContent = 'Choose a .pocket backup first.'; return; }
  const password = document.querySelector<HTMLInputElement>('#restore-password')?.value ?? '';
  try {
    const restored = await decryptBackup(await pendingBackupFile.text(), password);
    if (!confirm(`Replace this local ledger with ${restored.accounts.length} accounts and ${restored.transactions.length} entries from the backup?`)) return;
    await replaceData(restored); data = restored; selectedId = restored.accounts[0]?.id ?? null; screen = 'ledger'; shell(); announce('Encrypted backup restored.');
  } catch (reason) { if (error) error.textContent = reason instanceof Error ? reason.message : 'Could not restore the backup.'; }
}

async function restoreLicense(event: SubmitEvent): Promise<void> {
  event.preventDefault(); const token = String(new FormData(event.currentTarget as HTMLFormElement).get('token') ?? '').trim(); const error = document.querySelector('#license-error');
  if (!token) return; storeLicense(token); license = await verifyLicense(true);
  if (!license.valid) { if (error) error.textContent = license.notice ?? 'This license is not active.'; return; }
  applyTheme(); shell(); announce('Field Kit restored on this device.');
}

function applyTheme(): void {
  const setting = license.valid ? localStorage.getItem('pr:theme') ?? 'system' : 'system';
  document.documentElement.dataset.theme = setting;
}

function toggleTheme(): void {
  if (!license.valid) { screen = 'field-kit'; shell(); announce('Manual paper tone is included in Field Kit.'); return; }
  const current = localStorage.getItem('pr:theme') ?? 'system';
  const resolvedDark = current === 'dark' || (current === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  localStorage.setItem('pr:theme', resolvedDark ? 'light' : 'dark'); applyTheme(); shell();
}

function updateConnection(): void {
  const node = document.querySelector('#connection'); if (!node) return;
  node.classList.toggle('is-offline', !navigator.onLine); node.innerHTML = `<span aria-hidden="true"></span>${navigator.onLine ? 'On device' : 'Offline · ready'}`;
  announce(navigator.onLine ? 'Connection restored. Your ledger remains local.' : 'You’re offline. The ledger and backups still work.');
}

async function start(): Promise<void> {
  captureLicenseFromUrl(); license = cachedLicense(); applyTheme();
  const hash = location.hash.slice(1) as Screen; if (['ledger', 'history', 'backup', 'field-kit', 'settings'].includes(hash)) screen = hash;
  try { data = await loadData(); shell(); } catch { app.innerHTML = `<main id="main" class="fatal"><h1>Couldn’t open the local ledger.</h1><p>Your browser blocked IndexedDB. Allow site storage or try a non-private window, then reload.</p><button onclick="location.reload()">Try again</button></main>`; return; }
  license = await verifyLicense(); applyTheme(); if (screen === 'field-kit') shell();
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      registration.addEventListener('updatefound', () => { const worker = registration.installing; worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) announce('A fresh field guide is ready.', { label: 'Update', handler: 'reload-update' }); }); });
    } catch { announce('Offline installation is unavailable in this browser.'); }
  }
}

window.addEventListener('online', updateConnection);
window.addEventListener('offline', updateConnection);
void start();
