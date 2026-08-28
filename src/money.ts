import type { Currency } from './types';

const ZERO_DECIMAL = new Set<Currency>(['JPY']);

export function fractionDigits(currency: Currency): number {
  return ZERO_DECIMAL.has(currency) ? 0 : 2;
}

export function parseMoney(value: string, currency: Currency): number | null {
  const raw = value.trim().replace(/[,\s]/g, '');
  if (!raw || !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(raw)) return null;
  const digits = fractionDigits(currency);
  const negative = raw.startsWith('-');
  const unsigned = raw.replace(/^[+-]/, '');
  const [whole = '0', fraction = ''] = unsigned.split('.');
  if (fraction.length > digits || (digits === 0 && raw.includes('.'))) return null;
  const minorText = `${whole}${fraction.padEnd(digits, '0')}`.replace(/^0+(?=\d)/, '');
  const minor = Number(minorText || '0') * (negative ? -1 : 1);
  return Number.isSafeInteger(minor) ? minor : null;
}

export function formatMoney(minor: number, currency: Currency, showSign = false): string {
  const digits = fractionDigits(currency);
  const { major, fraction, negative } = splitMinor(minor, digits);
  // Intl formats BigInt without first rounding through a binary floating-point
  // major-unit value. A -1 probe preserves the sign for values between -1 and 0.
  const signedMajor = negative ? (major === 0n ? -1n : -major) : major;
  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    signDisplay: showSign ? 'always' : 'auto',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
  const digitFormatter = new Intl.NumberFormat(undefined, { useGrouping: false, maximumFractionDigits: 0 });
  const localizedZero = digitFormatter.format(0);
  const localizedFraction = fraction.replace(/\d/g, digit => digitFormatter.format(Number(digit)));
  return formatter.formatToParts(signedMajor).map(part => {
    if (part.type === 'integer' && negative && major === 0n) return localizedZero;
    if (part.type === 'fraction') return localizedFraction;
    return part.value;
  }).join('');
}

export function moneyInput(minor: number, currency: Currency): string {
  const digits = fractionDigits(currency);
  const { major, fraction, negative } = splitMinor(minor, digits);
  return `${negative ? '-' : ''}${major}${digits ? `.${fraction}` : ''}`;
}

function splitMinor(minor: number, digits: number): { major: bigint; fraction: string; negative: boolean } {
  if (!Number.isSafeInteger(minor)) throw new RangeError('Money must use safe integer minor units.');
  const negative = minor < 0;
  const absolute = BigInt(Math.abs(minor));
  const scale = 10n ** BigInt(digits);
  return {
    major: absolute / scale,
    fraction: digits ? String(absolute % scale).padStart(digits, '0') : '',
    negative
  };
}
