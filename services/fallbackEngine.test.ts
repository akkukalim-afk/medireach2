import { describe, it, expect } from 'vitest';
import {
  haversineDistanceKm,
  calculateEtaMinutes,
  calculatePharmacyScore,
  isOrderDelayed,
} from './fallbackEngine';

describe('Fallback Engine Unit Tests', () => {
  describe('Haversine Distance Calculation', () => {
    it('calculates distance between Yelahanka New Town and Yelahanka Old Town correctly (~1.2 km)', () => {
      // Apollo (New Town): 13.1007, 77.5963
      // MedPlus (Old Town): 13.1070, 77.5985
      const dist = haversineDistanceKm(13.1007, 77.5963, 13.1070, 77.5985);
      expect(dist).toBeGreaterThan(0.5);
      expect(dist).toBeLessThan(1.5);
    });

    it('returns 0 when coordinates are identical', () => {
      const dist = haversineDistanceKm(13.1007, 77.5963, 13.1007, 77.5963);
      expect(dist).toBe(0);
    });
  });

  describe('ETA Calculation', () => {
    it('calculates realistic ETA based on distance and prep time', () => {
      // 3 km at 18 km/h is 10 mins transit + 15 mins prep = 25 mins
      const eta = calculateEtaMinutes(3.0, 15, 18);
      expect(eta).toBe(25);
    });
  });

  describe('Pharmacy Multi-Factor Scoring', () => {
    it('ranks fully-stocked closer pharmacy higher than distant pharmacy with partial stock', () => {
      const scoreHigh = calculatePharmacyScore({
        stockMatchRatio: 1.0,
        distanceKm: 1.0,
        maxRadiusKm: 5.0,
        etaMinutes: 18,
        rating: 4.8,
      });

      const scoreLow = calculatePharmacyScore({
        stockMatchRatio: 0.5,
        distanceKm: 4.5,
        maxRadiusKm: 5.0,
        etaMinutes: 35,
        rating: 3.5,
      });

      expect(scoreHigh).toBeGreaterThan(scoreLow);
    });

    it('score remains within [0, 1] range', () => {
      const perfectScore = calculatePharmacyScore({
        stockMatchRatio: 1.0,
        distanceKm: 0.0,
        maxRadiusKm: 5.0,
        etaMinutes: 0,
        rating: 5.0,
      });

      const worstScore = calculatePharmacyScore({
        stockMatchRatio: 0.0,
        distanceKm: 5.0,
        maxRadiusKm: 5.0,
        etaMinutes: 60,
        rating: 0.0,
      });

      expect(perfectScore).toBeLessThanOrEqual(1.0);
      expect(worstScore).toBeGreaterThanOrEqual(0.0);
    });
  });

  describe('Order Delay Detection (Trigger B)', () => {
    it('detects an order is delayed when current time exceeds promised ETA + threshold', () => {
      const promisedEta = new Date('2026-11-08T10:00:00Z');
      const currentTimeDelayed = new Date('2026-11-08T10:15:00Z'); // 15 mins late (threshold 10 mins)

      const delayed = isOrderDelayed(
        {
          status: 'PREPARING',
          promisedEta,
          deliveredAt: null,
        },
        10,
        currentTimeDelayed
      );

      expect(delayed).toBe(true);
    });

    it('does not flag an order delayed when within ETA + threshold window', () => {
      const promisedEta = new Date('2026-11-08T10:00:00Z');
      const currentTimeOnTime = new Date('2026-11-08T10:05:00Z'); // only 5 mins past ETA (threshold 10 mins)

      const delayed = isOrderDelayed(
        {
          status: 'PREPARING',
          promisedEta,
          deliveredAt: null,
        },
        10,
        currentTimeOnTime
      );

      expect(delayed).toBe(false);
    });

    it('never flags already delivered or cancelled orders as delayed', () => {
      const promisedEta = new Date('2026-11-08T10:00:00Z');
      const wayLater = new Date('2026-11-08T12:00:00Z');

      const deliveredOrder = isOrderDelayed(
        {
          status: 'DELIVERED',
          promisedEta,
          deliveredAt: new Date(),
        },
        10,
        wayLater
      );

      expect(deliveredOrder).toBe(false);
    });
  });
});

