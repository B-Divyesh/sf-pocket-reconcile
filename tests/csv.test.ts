import { describe, expect, it, vi } from 'vitest';
import { exportCsv, parseCsv } from '../src/csv';
import type { Account, AppData } from '../src/types';

const account: Account = { id: 'a1', name: 'Pocket cash', kind: 'cash', currency: 'INR', openingMinor: 10000, createdAt: 1 };

describe('CSV ownership', () => {
  it('quotes user notes and round-trips amounts', () => {
    const data: AppData = { version: 1, accounts: [account], reconciliations: [], transactions: [{ id: 't1', accountId: 'a1', amountMinor: -1250, note: 'Tea, snacks', occurredOn: '2026-08-28', createdAt: 2 }] };
    const csv = exportCsv(data);
    expect(csv).toContain('"Tea, snacks"');
    const parsed = parseCsv(csv, [account]);
    expect(parsed.errors).toEqual([]);
    expect(parsed.transactions[0]?.amountMinor).toBe(-1250);
  });

  it('reports unknown accounts without importing partial bad rows', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'id' });
    const parsed = parseCsv('date,account,amount,note\n2026-08-28,Unknown,-2.00,Coffee', [account]);
    expect(parsed.transactions).toHaveLength(0);
    expect(parsed.errors[0]).toContain('does not exist');
  });
});
