export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

export interface Account {
  id: string;
  name: string;
  kind: 'cash' | 'card' | 'other';
  currency: Currency;
  openingMinor: number;
  createdAt: number;
  archived?: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  amountMinor: number;
  note: string;
  occurredOn: string;
  createdAt: number;
}

export interface Reconciliation {
  id: string;
  accountId: string;
  expectedMinor: number;
  observedMinor: number;
  differenceMinor: number;
  note: string;
  reconciledAt: number;
  transactionCutoff: number;
}

export interface AppData {
  version: 1;
  accounts: Account[];
  transactions: Transaction[];
  reconciliations: Reconciliation[];
}

export type StoreName = 'accounts' | 'transactions' | 'reconciliations';
