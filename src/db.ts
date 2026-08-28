import type { Account, AppData, Reconciliation, StoreName, Transaction } from './types';

const DB_NAME = 'pocket-reconcile';
const DB_VERSION = 1;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('accounts')) db.createObjectStore('accounts', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', { keyPath: 'id' });
        store.createIndex('accountId', 'accountId');
      }
      if (!db.objectStoreNames.contains('reconciliations')) {
        const store = db.createObjectStore('reconciliations', { keyPath: 'id' });
        store.createIndex('accountId', 'accountId');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Could not open local storage.'));
  });
}

async function storeRequest<T>(storeName: StoreName, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const request = action(transaction.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Local save failed.'));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error ?? new Error('Local save failed.'));
  });
}

export const db = {
  all<T>(store: StoreName) { return storeRequest<T[]>(store, 'readonly', value => value.getAll()); },
  put<T>(store: StoreName, value: T) { return storeRequest<IDBValidKey>(store, 'readwrite', target => target.put(value)); },
  delete(store: StoreName, key: string) { return storeRequest<undefined>(store, 'readwrite', target => target.delete(key)); },
  clear(store: StoreName) { return storeRequest<undefined>(store, 'readwrite', target => target.clear()); }
};

export async function loadData(): Promise<AppData> {
  const [accounts, transactions, reconciliations] = await Promise.all([
    db.all<Account>('accounts'), db.all<Transaction>('transactions'), db.all<Reconciliation>('reconciliations')
  ]);
  return { version: 1, accounts, transactions, reconciliations };
}

export async function replaceData(data: AppData): Promise<void> {
  await Promise.all((['accounts', 'transactions', 'reconciliations'] as StoreName[]).map(store => db.clear(store)));
  for (const account of data.accounts) await db.put('accounts', account);
  for (const item of data.transactions) await db.put('transactions', item);
  for (const item of data.reconciliations) await db.put('reconciliations', item);
}

export async function eraseData(): Promise<void> {
  await Promise.all((['accounts', 'transactions', 'reconciliations'] as StoreName[]).map(store => db.clear(store)));
}
