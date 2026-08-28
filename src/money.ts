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
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    signDisplay: showSign ? 'always' : 'auto',
    minimumFractionDigits: fractionDigits(currency),
    maximumFractionDigits: fractionDigits(currency)
  }).format(minor / 10 ** fractionDigits(currency));
}

export function moneyInput(minor: number, currency: Currency): string {
  return (minor / 10 ** fractionDigits(currency)).toFixed(fractionDigits(currency));
}
