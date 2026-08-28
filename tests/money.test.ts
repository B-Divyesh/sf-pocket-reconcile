import { describe, expect, it } from 'vitest';
import { formatMoney, fractionDigits, moneyInput, parseMoney } from '../src/money';

describe('decimal currency arithmetic', () => {
  it('converts decimal strings to integer minor units exactly', () => {
    expect(parseMoney('1,234.56', 'USD')).toBe(123456);
    expect(parseMoney('-0.10', 'INR')).toBe(-10);
    expect(parseMoney('.09', 'EUR')).toBe(9);
  });

  it('rejects ambiguous or over-precise amounts', () => {
    expect(parseMoney('10.999', 'USD')).toBeNull();
    expect(parseMoney('1.2.3', 'USD')).toBeNull();
    expect(parseMoney('', 'USD')).toBeNull();
  });

  it('handles zero-decimal currencies', () => {
    expect(fractionDigits('JPY')).toBe(0);
    expect(parseMoney('2400', 'JPY')).toBe(2400);
    expect(parseMoney('24.5', 'JPY')).toBeNull();
    expect(moneyInput(2400, 'JPY')).toBe('2400');
  });

  it('formats the maximum accepted minor-unit value without losing a cent', () => {
    const minor = parseMoney('90071992547409.91', 'USD');
    expect(minor).toBe(Number.MAX_SAFE_INTEGER);
    expect(formatMoney(minor!, 'USD')).toBe('$90,071,992,547,409.91');
    expect(moneyInput(minor!, 'USD')).toBe('90071992547409.91');
  });

  it('preserves the sign and cents for negative values below one major unit', () => {
    expect(formatMoney(-1, 'USD')).toBe('-$0.01');
    expect(formatMoney(-1, 'USD', true)).toBe('-$0.01');
    expect(moneyInput(-1, 'USD')).toBe('-0.01');
  });
});
