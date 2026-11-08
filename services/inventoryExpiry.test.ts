import { describe, it, expect } from 'vitest';

export function categorizeBatchExpiry(expiryDate: Date, currentDate: Date = new Date()): {
  isExpired: boolean;
  isExpiring30: boolean;
  isExpiring60: boolean;
  isExpiring90: boolean;
  daysRemaining: number;
} {
  const diffMs = expiryDate.getTime() - currentDate.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    isExpired: days < 0,
    isExpiring30: days >= 0 && days <= 30,
    isExpiring60: days > 30 && days <= 60,
    isExpiring90: days > 60 && days <= 90,
    daysRemaining: days,
  };
}

describe('Inventory Expiry Monitoring Logic (Objective 7)', () => {
  const today = new Date('2026-11-08T00:00:00Z');

  it('correctly classifies a batch expiring in 15 days as critical <30 days alert', () => {
    const exp = new Date('2026-11-23T00:00:00Z');
    const result = categorizeBatchExpiry(exp, today);

    expect(result.isExpired).toBe(false);
    expect(result.isExpiring30).toBe(true);
    expect(result.isExpiring60).toBe(false);
    expect(result.daysRemaining).toBe(15);
  });

  it('correctly classifies a batch expiring in 45 days as <60 days warning', () => {
    const exp = new Date('2026-12-23T00:00:00Z');
    const result = categorizeBatchExpiry(exp, today);

    expect(result.isExpired).toBe(false);
    expect(result.isExpiring30).toBe(false);
    expect(result.isExpiring60).toBe(true);
    expect(result.daysRemaining).toBe(45);
  });

  it('correctly auto-flags an expired batch and marks it as expired', () => {
    const exp = new Date('2026-10-31T00:00:00Z');
    const result = categorizeBatchExpiry(exp, today);

    expect(result.isExpired).toBe(true);
    expect(result.isExpiring30).toBe(false);
    expect(result.daysRemaining).toBeLessThan(0);
  });

  it('treats a batch expiring in 365 days as healthy (not expiring soon)', () => {
    const exp = new Date('2027-11-08T00:00:00Z');
    const result = categorizeBatchExpiry(exp, today);

    expect(result.isExpired).toBe(false);
    expect(result.isExpiring30).toBe(false);
    expect(result.isExpiring60).toBe(false);
    expect(result.isExpiring90).toBe(false);
    expect(result.daysRemaining).toBe(365);
  });
});

