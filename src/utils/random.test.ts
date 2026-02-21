import { describe, it, expect } from 'vitest';
import { SeededRandom } from './random';

describe('SeededRandom', () => {
  describe('Deterministic Behavior', () => {
    it('should produce same sequence with same seed', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.next());
        sequence2.push(rng2.next());
      }

      expect(sequence1).toEqual(sequence2);
    });

    it('should produce different sequences with different seeds', () => {
      const rng1 = new SeededRandom(111);
      const rng2 = new SeededRandom(222);

      const sequence1 = [];
      const sequence2 = [];

      for (let i = 0; i < 10; i++) {
        sequence1.push(rng1.next());
        sequence2.push(rng2.next());
      }

      expect(sequence1).not.toEqual(sequence2);
    });
  });

  describe('next() method', () => {
    it('should return values between 0 and 1', () => {
      const rng = new SeededRandom(54321);

      for (let i = 0; i < 100; i++) {
        const value = rng.next();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should generate different values in sequence', () => {
      const rng = new SeededRandom(99999);
      const values = new Set();

      for (let i = 0; i < 20; i++) {
        values.add(rng.next());
      }

      // Should have mostly unique values (at least 15 out of 20)
      expect(values.size).toBeGreaterThanOrEqual(15);
    });
  });

  describe('nextInt() method', () => {
    it('should return values between 0 and max-1', () => {
      const rng = new SeededRandom(42);
      const max = 10;

      for (let i = 0; i < 100; i++) {
        const value = rng.nextInt(max);
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(max);
        expect(Number.isInteger(value)).toBe(true);
      }
    });

    it('should work with different max values', () => {
      const rng = new SeededRandom(777);

      const value5 = rng.nextInt(5);
      expect(value5).toBeGreaterThanOrEqual(0);
      expect(value5).toBeLessThan(5);

      const value100 = rng.nextInt(100);
      expect(value100).toBeGreaterThanOrEqual(0);
      expect(value100).toBeLessThan(100);

      const value1000 = rng.nextInt(1000);
      expect(value1000).toBeGreaterThanOrEqual(0);
      expect(value1000).toBeLessThan(1000);
    });

    it('should generate relatively uniform distribution', () => {
      const rng = new SeededRandom(888);
      const max = 10;
      const counts = new Array(max).fill(0);

      // Generate 1000 random numbers
      for (let i = 0; i < 1000; i++) {
        const value = rng.nextInt(max);
        counts[value]++;
      }

      // Each bucket should have some values (not perfect but reasonably distributed)
      for (let i = 0; i < max; i++) {
        expect(counts[i]).toBeGreaterThan(0);
        // Roughly 100 per bucket ±70 for statistical variation
        expect(counts[i]).toBeGreaterThan(30);
        expect(counts[i]).toBeLessThan(200);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle seed of 0', () => {
      const rng = new SeededRandom(0);
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should handle large seed values', () => {
      const rng = new SeededRandom(999999999);
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should handle nextInt(1) correctly', () => {
      const rng = new SeededRandom(123);
      for (let i = 0; i < 10; i++) {
        expect(rng.nextInt(1)).toBe(0);
      }
    });
  });
});
