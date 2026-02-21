import { describe, it, expect } from 'vitest';
import { DIFFICULTY_PRESETS, validateCustomConfig } from './presets';

describe('Difficulty Presets', () => {
  describe('Easy Preset', () => {
    it('should be 9×9 with 10 mines', () => {
      const easy = DIFFICULTY_PRESETS.easy;
      expect(easy.rows).toBe(9);
      expect(easy.cols).toBe(9);
      expect(easy.mines).toBe(10);
    });
  });

  describe('Medium Preset', () => {
    it('should be 16×16 with 40 mines', () => {
      const medium = DIFFICULTY_PRESETS.medium;
      expect(medium.rows).toBe(16);
      expect(medium.cols).toBe(16);
      expect(medium.mines).toBe(40);
    });
  });

  describe('Hard Preset', () => {
    it('should be 30×16 with 99 mines', () => {
      const hard = DIFFICULTY_PRESETS.hard;
      expect(hard.rows).toBe(30);
      expect(hard.cols).toBe(16);
      expect(hard.mines).toBe(99);
    });
  });
});

describe('validateCustomConfig', () => {
  describe('Valid Configurations', () => {
    it('should accept valid minimum config (5×5 with 1 mine)', () => {
      const result = validateCustomConfig(5, 5, 1);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid maximum config (50×50 with 2499 mines)', () => {
      const result = validateCustomConfig(50, 50, 2499);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept typical custom config (12×12 with 20 mines)', () => {
      const result = validateCustomConfig(12, 12, 20);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('Invalid Row Configurations', () => {
    it('should reject rows < 5', () => {
      const result = validateCustomConfig(4, 10, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Rows must be between 5 and 50');
    });

    it('should reject rows > 50', () => {
      const result = validateCustomConfig(51, 10, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Rows must be between 5 and 50');
    });

    it('should reject negative rows', () => {
      const result = validateCustomConfig(-1, 10, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Rows must be between 5 and 50');
    });
  });

  describe('Invalid Column Configurations', () => {
    it('should reject cols < 5', () => {
      const result = validateCustomConfig(10, 4, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Columns must be between 5 and 50');
    });

    it('should reject cols > 50', () => {
      const result = validateCustomConfig(10, 51, 10);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Columns must be between 5 and 50');
    });

    it('should reject negative cols', () => {
      const result = validateCustomConfig(10, -1, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Columns must be between 5 and 50');
    });
  });

  describe('Invalid Mine Configurations', () => {
    it('should reject mines < 1', () => {
      const result = validateCustomConfig(10, 10, 0);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Mines must be at least 1');
    });

    it('should reject negative mines', () => {
      const result = validateCustomConfig(10, 10, -5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Mines must be at least 1');
    });

    it('should reject mines >= total cells', () => {
      const result = validateCustomConfig(5, 5, 25);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Mines must be less than total cells (at least one safe cell required)');
    });

    it('should reject mines > total cells', () => {
      const result = validateCustomConfig(5, 5, 30);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Mines must be less than total cells (at least one safe cell required)');
    });
  });

  describe('Error Messages', () => {
    it('should return descriptive error for invalid rows', () => {
      const result = validateCustomConfig(100, 10, 5);
      expect(result.error).toContain('Rows must be between 5 and 50');
    });

    it('should return descriptive error for invalid columns', () => {
      const result = validateCustomConfig(10, 100, 5);
      expect(result.error).toContain('Columns must be between 5 and 50');
    });

    it('should return descriptive error for too many mines', () => {
      const result = validateCustomConfig(10, 10, 100);
      expect(result.error).toContain('Mines must be less than total cells');
    });

    it('should return descriptive error for too few mines', () => {
      const result = validateCustomConfig(10, 10, 0);
      expect(result.error).toContain('Mines must be at least 1');
    });
  });
});
