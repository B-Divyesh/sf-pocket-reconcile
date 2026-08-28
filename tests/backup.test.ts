import { describe, expect, it } from 'vitest';
import { decryptBackup, encryptBackup } from '../src/backup';
import type { AppData } from '../src/types';

const emptyData: AppData = { version: 1, accounts: [], transactions: [], reconciliations: [] };

describe('encrypted recovery pack', () => {
  it('round-trips a versioned ledger without exposing clear JSON', async () => {
    const encrypted = await encryptBackup(emptyData, 'fern-field-2026');
    expect(encrypted).not.toContain('"accounts":[]');
    await expect(decryptBackup(encrypted, 'fern-field-2026')).resolves.toEqual(emptyData);
  });

  it('rejects weak export passwords and incorrect restore passwords', async () => {
    await expect(encryptBackup(emptyData, 'short')).rejects.toThrow('at least 8');
    const encrypted = await encryptBackup(emptyData, 'correct-password');
    await expect(decryptBackup(encrypted, 'wrong-password')).rejects.toThrow('Check the password');
  });
});
