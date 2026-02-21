import { describe, it, expect, beforeEach } from 'vitest';
import { BoardManager } from './Board';
import { GameConfig } from '../types/game';

describe('BoardManager', () => {
  describe('Board Creation', () => {
    it('should create 9×9 board with 81 cells', () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10 };
      const boardManager = new BoardManager(config);
      const board = boardManager.getBoard();

      expect(board.rows).toBe(9);
      expect(board.cols).toBe(9);
      expect(board.cells.length).toBe(9);
      expect(board.cells[0].length).toBe(9);

      // Count total cells
      let totalCells = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          totalCells++;
        }
      }
      expect(totalCells).toBe(81);
    });

    it('should create 16×16 board with exactly 40 mines', () => {
      const config: GameConfig = { rows: 16, cols: 16, mines: 40, seed: 12345 };
      const boardManager = new BoardManager(config);
      const board = boardManager.getBoard();

      expect(board.rows).toBe(16);
      expect(board.cols).toBe(16);
      expect(board.mines).toBe(40);

      // Count actual mines
      let mineCount = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (board.cells[row][col].isMine) {
            mineCount++;
          }
        }
      }
      expect(mineCount).toBe(40);
    });
  });

  describe('Seeded Mine Placement', () => {
    it('should produce identical mine layouts with same seed (tested 3 times)', () => {
      const config: GameConfig = { rows: 10, cols: 10, mines: 15, seed: 42 };

      // Create 3 boards with the same seed
      const board1 = new BoardManager(config).getBoard();
      const board2 = new BoardManager(config).getBoard();
      const board3 = new BoardManager(config).getBoard();

      // Compare all cells between board1 and board2
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          expect(board1.cells[row][col].isMine).toBe(board2.cells[row][col].isMine);
        }
      }

      // Compare all cells between board1 and board3
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          expect(board1.cells[row][col].isMine).toBe(board3.cells[row][col].isMine);
        }
      }
    });

    it('should produce different mine layouts with different seeds', () => {
      const config1: GameConfig = { rows: 10, cols: 10, mines: 15, seed: 100 };
      const config2: GameConfig = { rows: 10, cols: 10, mines: 15, seed: 200 };

      const board1 = new BoardManager(config1).getBoard();
      const board2 = new BoardManager(config2).getBoard();

      // Count differences in mine placement
      let differences = 0;
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          if (board1.cells[row][col].isMine !== board2.cells[row][col].isMine) {
            differences++;
          }
        }
      }

      // Should have at least some differences
      expect(differences).toBeGreaterThan(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should reject mines >= total cells', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 25 };
      expect(() => new BoardManager(config)).toThrow('Number of mines must be less than total cells');
    });

    it('should reject negative dimensions', () => {
      const config1: GameConfig = { rows: -1, cols: 10, mines: 10 };
      expect(() => new BoardManager(config1)).toThrow('Rows must be between 5 and 50');

      const config2: GameConfig = { rows: 10, cols: -1, mines: 10 };
      expect(() => new BoardManager(config2)).toThrow('Columns must be between 5 and 50');
    });

    it('should reject dimensions < 5', () => {
      const config1: GameConfig = { rows: 3, cols: 10, mines: 5 };
      expect(() => new BoardManager(config1)).toThrow('Rows must be between 5 and 50');

      const config2: GameConfig = { rows: 10, cols: 3, mines: 5 };
      expect(() => new BoardManager(config2)).toThrow('Columns must be between 5 and 50');
    });

    it('should reject dimensions > 50', () => {
      const config1: GameConfig = { rows: 51, cols: 10, mines: 10 };
      expect(() => new BoardManager(config1)).toThrow('Rows must be between 5 and 50');

      const config2: GameConfig = { rows: 10, cols: 51, mines: 10 };
      expect(() => new BoardManager(config2)).toThrow('Columns must be between 5 and 50');
    });
  });

  describe('Adjacent Mine Counts', () => {
    it('should calculate correct adjacent mine count for corner cell (top-left)', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const boardManager = new BoardManager(config);
      const board = boardManager.getBoard();

      // Manually place a mine for predictable testing
      // Clear all mines first
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          board.cells[row][col].isMine = false;
        }
      }

      // Place mine at (0,1) - adjacent to corner (0,0)
      board.cells[0][1].isMine = true;

      // Recalculate adjacent counts
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!board.cells[row][col].isMine) {
            const neighbors = boardManager.getNeighbors(row, col);
            board.cells[row][col].adjacentMines = neighbors.filter(n => n.isMine).length;
          }
        }
      }

      // Corner (0,0) should have 1 adjacent mine
      expect(board.cells[0][0].adjacentMines).toBe(1);
    });

    it('should calculate correct adjacent mine count for edge cell', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 2, seed: 54321 };
      const boardManager = new BoardManager(config);
      const board = boardManager.getBoard();

      // Clear all mines
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          board.cells[row][col].isMine = false;
        }
      }

      // Place mines around edge cell (0,2)
      board.cells[0][1].isMine = true; // left
      board.cells[0][3].isMine = true; // right

      // Recalculate adjacent counts
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!board.cells[row][col].isMine) {
            const neighbors = boardManager.getNeighbors(row, col);
            board.cells[row][col].adjacentMines = neighbors.filter(n => n.isMine).length;
          }
        }
      }

      // Edge cell (0,2) should have 2 adjacent mines
      expect(board.cells[0][2].adjacentMines).toBe(2);
    });

    it('should calculate correct adjacent mine count for center cell', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 8, seed: 99999 };
      const boardManager = new BoardManager(config);
      const board = boardManager.getBoard();

      // Clear all mines
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          board.cells[row][col].isMine = false;
        }
      }

      // Place mines around center cell (2,2)
      const surroundingPositions = [
        [1, 1], [1, 2], [1, 3],
        [2, 1],         [2, 3],
        [3, 1], [3, 2], [3, 3]
      ];

      for (const [row, col] of surroundingPositions) {
        board.cells[row][col].isMine = true;
      }

      // Recalculate adjacent counts
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          if (!board.cells[row][col].isMine) {
            const neighbors = boardManager.getNeighbors(row, col);
            board.cells[row][col].adjacentMines = neighbors.filter(n => n.isMine).length;
          }
        }
      }

      // Center cell (2,2) should have 8 adjacent mines
      expect(board.cells[2][2].adjacentMines).toBe(8);
    });
  });

  describe('getNeighbors', () => {
    let boardManager: BoardManager;

    beforeEach(() => {
      const config: GameConfig = { rows: 10, cols: 10, mines: 10, seed: 12345 };
      boardManager = new BoardManager(config);
    });

    it('should return 3 neighbors for corner cell', () => {
      const neighbors = boardManager.getNeighbors(0, 0);
      expect(neighbors.length).toBe(3);
    });

    it('should return 5 neighbors for edge cell', () => {
      const neighbors = boardManager.getNeighbors(0, 5);
      expect(neighbors.length).toBe(5);
    });

    it('should return 8 neighbors for center cell', () => {
      const neighbors = boardManager.getNeighbors(5, 5);
      expect(neighbors.length).toBe(8);
    });
  });

  describe('getCellAt', () => {
    let boardManager: BoardManager;

    beforeEach(() => {
      const config: GameConfig = { rows: 10, cols: 10, mines: 10 };
      boardManager = new BoardManager(config);
    });

    it('should return cell for valid coordinates', () => {
      const cell = boardManager.getCellAt(5, 5);
      expect(cell).not.toBeNull();
      expect(cell?.row).toBe(5);
      expect(cell?.col).toBe(5);
    });

    it('should return null for out-of-bounds coordinates', () => {
      expect(boardManager.getCellAt(-1, 5)).toBeNull();
      expect(boardManager.getCellAt(5, -1)).toBeNull();
      expect(boardManager.getCellAt(10, 5)).toBeNull();
      expect(boardManager.getCellAt(5, 10)).toBeNull();
    });
  });
});
