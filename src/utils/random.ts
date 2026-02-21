/**
 * Seeded random number generator using Linear Congruential Generator (LCG)
 * Provides deterministic random numbers for reproducible mine placement
 */

/**
 * Seeded random number generator for deterministic randomness
 * Uses Linear Congruential Generator algorithm: X(n+1) = (a * X(n) + c) mod m
 */
export class SeededRandom {
  private seed: number;
  
  // LCG constants (same as used in Numerical Recipes)
  private readonly a = 1664525;
  private readonly c = 1013904223;
  private readonly m = 4294967296; // 2^32

  /**
   * Create a new seeded random number generator
   * @param seed - Initial seed value (any non-negative integer)
   */
  constructor(seed: number) {
    this.seed = Math.abs(seed) % this.m;
  }

  /**
   * Generate the next random number in the sequence
   * @returns A pseudo-random number between 0 (inclusive) and 1 (exclusive)
   */
  next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m;
    return this.seed / this.m;
  }

  /**
   * Generate a random integer in the range [0, max)
   * @param max - Upper bound (exclusive)
   * @returns A pseudo-random integer between 0 (inclusive) and max (exclusive)
   */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}
