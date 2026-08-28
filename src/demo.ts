import type { AppData } from './types';

/** A realistic, deterministic ledger that is safe to reset at any time. */
export function sampleData(): AppData {
  return {
    version: 1,
    accounts: [
      { id: 'demo-cash', name: 'Weekend cash', kind: 'cash', currency: 'INR', openingMinor: 12500, createdAt: 1767225600000 },
      { id: 'demo-card', name: 'Daily card', kind: 'card', currency: 'INR', openingMinor: 42000, createdAt: 1767225601000 }
    ],
    transactions: [
      { id: 'demo-t1', accountId: 'demo-cash', amountMinor: -850, note: 'Saturday market', occurredOn: '2026-01-03', createdAt: 1767430800000 },
      { id: 'demo-t2', accountId: 'demo-cash', amountMinor: -1200, note: 'Train top-up', occurredOn: '2026-01-04', createdAt: 1767517200000 },
      { id: 'demo-t3', accountId: 'demo-card', amountMinor: -18450, note: 'Household shop', occurredOn: '2026-01-04', createdAt: 1767520800000 }
    ],
    reconciliations: [
      { id: 'demo-r1', accountId: 'demo-cash', expectedMinor: 10450, observedMinor: 10450, differenceMinor: 0, note: '', reconciledAt: 1767560400000, transactionCutoff: 1767560400000 }
    ]
  };
}
