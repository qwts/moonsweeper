/**
 * Core type definitions for the Minesweeper game
 */

/** State of an individual cell */
export type CellState = 'hidden' | 'revealed' | 'flagged';

/** Overall game status */
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

/**
 * Represents a single cell in the Minesweeper grid
 */
export interface Cell {
  /** Row index (0-based) */
  row: number;
  /** Column index (0-based) */
  col: number;
  /** Whether this cell contains a mine */
  isMine: boolean;
  /** Number of adjacent cells containing mines (0-8) */
  adjacentMines: number;
  /** Current state of the cell */
  state: CellState;
}

/**
 * Represents the complete game board
 */
export interface Board {
  /** Number of rows in the board */
  rows: number;
  /** Number of columns in the board */
  cols: number;
  /** Total number of mines on the board */
  mines: number;
  /** 2D array of cells [row][col] */
  cells: Cell[][];
}

/**
 * Configuration for creating a new game
 */
export interface GameConfig {
  /** Number of rows (5-50) */
  rows: number;
  /** Number of columns (5-50) */
  cols: number;
  /** Number of mines (1 to rows*cols-1) */
  mines: number;
  /** Optional seed for deterministic mine placement */
  seed?: number;
}

/**
 * Serialized game state for persistence
 */
export interface SerializedGameState {
  /** Game configuration */
  config: GameConfig;
  /** Current game status */
  status: GameStatus;
  /** Board state */
  board: Board;
  /** Number of remaining flags */
  remainingFlags: number;
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Timestamp when timer started */
  startTimestamp: number;
}
