import type { AppData } from './types';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: 250_000 },
    material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

export async function encryptBackup(data: AppData, password: string): Promise<string> {
  if (password.length < 8) throw new Error('Use at least 8 characters for the backup password.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data)));
  return JSON.stringify({ format: 'pocket-reconcile-encrypted', version: 1, kdf: 'PBKDF2-SHA256-250000', salt: bytesToBase64(salt), iv: bytesToBase64(iv), data: bytesToBase64(new Uint8Array(cipher)) });
}

export async function decryptBackup(payload: string, password: string): Promise<AppData> {
  let parsed: { format?: string; version?: number; salt?: string; iv?: string; data?: string };
  try { parsed = JSON.parse(payload) as typeof parsed; } catch { throw new Error('This is not a Pocket Reconcile backup.'); }
  if (parsed.format !== 'pocket-reconcile-encrypted' || parsed.version !== 1 || !parsed.salt || !parsed.iv || !parsed.data) {
    throw new Error('This backup format is not supported.');
  }
  try {
    const salt = base64ToBytes(parsed.salt);
    const iv = base64ToBytes(parsed.iv);
    const key = await deriveKey(password, salt);
    const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as BufferSource }, key, base64ToBytes(parsed.data) as BufferSource);
    const data = JSON.parse(decoder.decode(clear)) as AppData;
    validateBackup(data);
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Backup')) throw error;
    throw new Error('Could not open the backup. Check the password and file.');
  }
}

function validateBackup(data: AppData): void {
  if (data?.version !== 1 || !Array.isArray(data.accounts) || !Array.isArray(data.transactions) || !Array.isArray(data.reconciliations)) {
    throw new Error('Backup data is incomplete or from a newer version.');
  }
}
