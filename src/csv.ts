import type { Account, AppData, Transaction } from './types';
import { moneyInput, parseMoney } from './money';

export function accountNameKey(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function quote(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function exportCsv(data: AppData): string {
  const accounts = new Map(data.accounts.map(account => [account.id, account]));
  const rows = [['date', 'account', 'account_type', 'currency', 'amount', 'note']];
  for (const item of [...data.transactions].sort((a, b) => a.occurredOn.localeCompare(b.occurredOn))) {
    const account = accounts.get(item.accountId);
    if (!account) continue;
    rows.push([item.occurredOn, account.name, account.kind, account.currency, moneyInput(item.amountMinor, account.currency), item.note]);
  }
  return rows.map(row => row.map(quote).join(',')).join('\n');
}

export function parseCsv(text: string, accounts: Account[]): { transactions: Transaction[]; errors: string[] } {
  const lines = parseRows(text.replace(/^\uFEFF/, ''));
  if (!lines.length) return { transactions: [], errors: ['The CSV is empty.'] };
  const header = lines[0]?.map(cell => cell.trim().toLowerCase()) ?? [];
  const required = ['date', 'account', 'amount', 'note'];
  const missing = required.filter(name => !header.includes(name));
  if (missing.length) return { transactions: [], errors: [`Missing column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}.`] };
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const errors: string[] = [];
  const transactions: Transaction[] = [];
  const importStartedAt = Date.now() - lines.length;
  lines.slice(1).forEach((row, offset) => {
    if (row.every(cell => !cell.trim())) return;
    const line = offset + 2;
    const name = row[index.account ?? -1]?.trim() ?? '';
    const matches = accounts.filter(item => accountNameKey(item.name) === accountNameKey(name));
    if (!matches.length) { errors.push(`Row ${line}: account “${name}” does not exist.`); return; }
    if (matches.length > 1) { errors.push(`Row ${line}: account “${name}” is ambiguous. Rename duplicate accounts before importing.`); return; }
    const account = matches[0];
    if (!account) return;
    const occurredOn = row[index.date ?? -1]?.trim() ?? '';
    if (!isCalendarDate(occurredOn)) {
      errors.push(`Row ${line}: use a date like 2026-08-28.`); return;
    }
    const amountMinor = parseMoney(row[index.amount ?? -1] ?? '', account.currency);
    if (amountMinor === null) { errors.push(`Row ${line}: amount is not valid for ${account.currency}.`); return; }
    transactions.push({
      id: crypto.randomUUID(), accountId: account.id, amountMinor,
      note: row[index.note ?? -1]?.trim() || 'Imported entry', occurredOn, createdAt: importStartedAt + offset
    });
  });
  return { transactions, errors };
}

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= (daysInMonth[month - 1] ?? 0);
}

function parseRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1; }
      else quoted = !quoted;
    } else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += char;
  }
  row.push(field);
  if (row.some(cell => cell.length) || rows.length === 0) rows.push(row);
  return rows;
}
