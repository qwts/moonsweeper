export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface DifficultyPreset {
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTY_PRESETS: Record<DifficultyLevel, DifficultyPreset> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 30, cols: 16, mines: 99 },
};

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateCustomConfig(
  rows: number,
  cols: number,
  mines: number
): ValidationResult {
  if (rows < 5 || rows > 50) {
    return {
      valid: false,
      error: 'Rows must be between 5 and 50',
    };
  }

  if (cols < 5 || cols > 50) {
    return {
      valid: false,
      error: 'Columns must be between 5 and 50',
    };
  }

  if (mines < 1) {
    return {
      valid: false,
      error: 'Mines must be at least 1',
    };
  }

  const totalCells = rows * cols;
  if (mines >= totalCells) {
    return {
      valid: false,
      error: 'Mines must be less than total cells (at least one safe cell required)',
    };
  }

  return { valid: true };
}
