import { describe, expect, it } from 'vitest';
import { fractionDigits, moneyInput, parseMoney } from '../src/money';

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
});
