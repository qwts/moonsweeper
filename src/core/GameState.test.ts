import { describe, it, expect } from 'vitest';
import { GameState } from './GameState';
import { GameConfig } from '../types/game';

describe('GameState', () => {
  describe('Constructor', () => {
    it('should create valid initial state', () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10, seed: 12345 };
      const gameState = new GameState(config);

      expect(gameState.getStatus()).toBe('idle');
      expect(gameState.getElapsedTime()).toBe(0);
      expect(gameState.getFlaggedCount()).toBe(0);
      expect(gameState.getRemainingFlags()).toBe(10);
      expect(gameState.canUndo()).toBe(false);
      expect(gameState.canRedo()).toBe(false);

      const board = gameState.getBoard();
      expect(board.rows).toBe(9);
      expect(board.cols).toBe(9);
      expect(board.mines).toBe(10);
    });
  });

  describe('Timer Management', () => {
    it('should start timer on first reveal', () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10, seed: 12345 };
      const gameState = new GameState(config);

      // Find a safe cell
      const board = gameState.getBoard();
      let safeRow = 0, safeCol = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine) {
            safeRow = row;
            safeCol = col;
            break;
          }
        }
      }

      expect(gameState.getElapsedTime()).toBe(0);
      expect(gameState.getStatus()).toBe('idle');

      gameState.revealCell(safeRow, safeCol);

      expect(gameState.getStatus()).toBe('playing');
      // Time should be 0 immediately after starting
      expect(gameState.getElapsedTime()).toBe(0);
    });

    it('should track elapsed time correctly', async () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10, seed: 12345 };
      const gameState = new GameState(config);

      // Find a safe cell
      const board = gameState.getBoard();
      let safeRow = 0, safeCol = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine) {
            safeRow = row;
            safeCol = col;
            break;
          }
        }
      }

      gameState.revealCell(safeRow, safeCol);

      // Wait a bit and check time
      await new Promise(resolve => setTimeout(resolve, 1100));
      const elapsed = gameState.getElapsedTime();
      expect(elapsed).toBeGreaterThanOrEqual(1);
      expect(elapsed).toBeLessThanOrEqual(2);
    });

    it('should freeze timer when game ends (loss)', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a mine
      let mineRow = 0, mineCol = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (board.cells[row][col].isMine) {
            mineRow = row;
            mineCol = col;
            break;
          }
        }
      }

      gameState.revealCell(mineRow, mineCol);

      expect(gameState.getStatus()).toBe('lost');
      const frozenTime = gameState.getElapsedTime();
      
      // Time should stay the same  
      setTimeout(() => {
        expect(gameState.getElapsedTime()).toBe(frozenTime);
      }, 100);
    });
  });

  describe('Cell Reveal', () => {
    it('should reveal a safe cell correctly', () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10, seed: 12345 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a safe cell
      let safeRow = 0, safeCol = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine) {
            safeRow = row;
            safeCol = col;
            break;
          }
        }
      }

      const cell = board.cells[safeRow][safeCol];
      expect(cell.state).toBe('hidden');

      const result = gameState.revealCell(safeRow, safeCol);

      expect(result).toBe(true);
      expect(cell.state).toBe('revealed');
      expect(gameState.getStatus()).toBe('playing');
    });

    it('should trigger loss when revealing a mine', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 54321 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a mine
      let mineRow = 0, mineCol = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (board.cells[row][col].isMine) {
            mineRow = row;
            mineCol = col;
            break;
          }
        }
      }

      const result = gameState.revealCell(mineRow, mineCol);

      expect(result).toBe(true);
      expect(gameState.getStatus()).toBe('lost');
      expect(board.cells[mineRow][mineCol].state).toBe('revealed');
    });

    it('should not reveal flagged cells', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);

      gameState.toggleFlag(0, 0);
      const cell = gameState.getCell(0, 0);
      expect(cell?.state).toBe('flagged');

      const result = gameState.revealCell(0, 0);

      expect(result).toBe(false);
      expect(cell?.state).toBe('flagged');
    });

    it('should not reveal already revealed cells', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a safe cell
      let safeRow = 0, safeCol = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine) {
            safeRow = row;
            safeCol = col;
            break;
          }
        }
      }

      gameState.revealCell(safeRow, safeCol);
      const cell = board.cells[safeRow][safeCol];
      expect(cell.state).toBe('revealed');

      // Try to reveal again
      const result = gameState.revealCell(safeRow, safeCol);
      expect(result).toBe(false);
    });
  });

  describe('Flag Operations', () => {
    it('should flag and unflag cells correctly', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);

      const cell = gameState.getCell(0, 0);
      expect(cell?.state).toBe('hidden');
      expect(gameState.getFlaggedCount()).toBe(0);

      // Flag the cell
      gameState.toggleFlag(0, 0);
      expect(cell?.state).toBe('flagged');
      expect(gameState.getFlaggedCount()).toBe(1);
      expect(gameState.getRemainingFlags()).toBe(0);

      // Unflag the cell
      gameState.toggleFlag(0, 0);
      expect(cell?.state).toBe('hidden');
      expect(gameState.getFlaggedCount()).toBe(0);
      expect(gameState.getRemainingFlags()).toBe(1);
    });

    it('should not flag revealed cells', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a safe cell and reveal it
      let safeRow = 0, safeCol = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine) {
            safeRow = row;
            safeCol = col;
            break;
          }
        }
      }

      gameState.revealCell(safeRow, safeCol);
      const cell = board.cells[safeRow][safeCol];
      expect(cell.state).toBe('revealed');

      // Try to flag it
      const result = gameState.toggleFlag(safeRow, safeCol);
      expect(result).toBe(false);
      expect(cell.state).toBe('revealed');
    });
  });

  describe('Win Condition', () => {
    it('should detect win correctly when all safe cells are revealed', () => {
      // Small board for easy testing
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Reveal all safe cells
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          const cell = board.cells[row][col];
          if (!cell.isMine) {
            gameState.revealCell(row, col);
          }
        }
      }

      expect(gameState.getStatus()).toBe('won');
    });

    it('should auto-flag all mines on win', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Reveal all safe cells
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          const cell = board.cells[row][col];
          if (!cell.isMine) {
            gameState.revealCell(row, col);
          }
        }
      }

      // Check that all mines are flagged
      let flaggedMineCount = 0;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          const cell = board.cells[row][col];
          if (cell.isMine && cell.state === 'flagged') {
            flaggedMineCount++;
          }
        }
      }

      expect(flaggedMineCount).toBe(1);
    });
  });

  describe('Flood-Fill', () => {
    it('should reveal connected zero cells', () => {
      // Use a seed that creates a cluster of safe cells
      const config: GameConfig = { rows: 10, cols: 10, mines: 5, seed: 99999 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a zero cell
      let zeroRow = -1, zeroCol = -1;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine && board.cells[row][col].adjacentMines === 0) {
            zeroRow = row;
            zeroCol = col;
            break;
          }
        }
        if (zeroRow >= 0) break;
      }

      if (zeroRow >= 0) {
        const revealedBefore = gameState.getCells().flat().filter(c => c.state === 'revealed').length;
        gameState.revealCell(zeroRow, zeroCol);
        const revealedAfter = gameState.getCells().flat().filter(c => c.state === 'revealed').length;

        // Should have revealed multiple cells via flood fill
        expect(revealedAfter).toBeGreaterThan(revealedBefore + 1);
      }
    });

    it('should stop at numbered cells during flood-fill', () => {
      const config: GameConfig = { rows: 10, cols: 10, mines: 5, seed: 42 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a zero cell
      let zeroRow = -1, zeroCol = -1;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine && board.cells[row][col].adjacentMines === 0) {
            zeroRow = row;
            zeroCol = col;
            break;
          }
        }
        if (zeroRow >= 0) break;
      }

      if (zeroRow >= 0) {
        gameState.revealCell(zeroRow, zeroCol);

        // Check that numbered cells around the flood-filled area are revealed
        // but their neighbors beyond them are not (unless also zero)
        const revealedCells = gameState.getCells().flat().filter(c => c.state === 'revealed');
        expect(revealedCells.length).toBeGreaterThan(0);

        // All revealed cells should either be zero or adjacent to zero cells
        for (const cell of revealedCells) {
          if (cell.adjacentMines > 0) {
            const neighbors = gameState.getNeighbors(cell.row, cell.col);
            const hasZeroNeighbor = neighbors.some(n => n.adjacentMines === 0 && n.state === 'revealed');
            // If it's a numbered cell, it should be adjacent to a revealed zero cell
            if (!hasZeroNeighbor) {
              // Or it could be the starting cell
              expect(cell.row === zeroRow && cell.col === zeroCol).toBe(true);
            }
          }
        }
      }
    });
  });

  describe('Chord (Middle-Click)', () => {
    it('should perform chord on numbered cells with correct flag count', () => {
      const config: GameConfig = { rows: 10, cols: 10, mines: 10, seed: 77777 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a numbered cell with adjacent mines
      let numberedRow = -1, numberedCol = -1;
      for (let row = 1; row < board.rows - 1; row++) {
        for (let col = 1; col < board.cols - 1; col++) {
          const cell = board.cells[row][col];
          if (!cell.isMine && cell.adjacentMines > 0 && cell.adjacentMines <= 3) {
            numberedRow = row;
            numberedCol = col;
            break;
          }
        }
        if (numberedRow >= 0) break;
      }

      if (numberedRow >= 0) {
        // Reveal the numbered cell first
        gameState.revealCell(numberedRow, numberedCol);
        const cell = board.cells[numberedRow][numberedCol];
        
        // Flag the correct number of adjacent mines
        const neighbors = gameState.getNeighbors(numberedRow, numberedCol);
        let flaggedCount = 0;
        for (const neighbor of neighbors) {
          if (neighbor.isMine && flaggedCount < cell.adjacentMines) {
            gameState.toggleFlag(neighbor.row, neighbor.col);
            flaggedCount++;
          }
        }

        // Perform chord
        const result = gameState.performChord(numberedRow, numberedCol);

        // If there were unflagged safe neighbors, chord should have succeeded
        const hadUnflaggedSafeNeighbors = neighbors.some(n => !n.isMine && n.state === 'hidden');
        if (hadUnflaggedSafeNeighbors && flaggedCount === cell.adjacentMines) {
          expect(result).toBe(true);
        }
      }
    });

    it('should not chord with incorrect flag count', () => {
      const config: GameConfig = { rows: 10, cols: 10, mines: 10, seed: 55555 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a numbered cell
      let numberedRow = -1, numberedCol = -1;
      for (let row = 1; row < board.rows - 1; row++) {
        for (let col = 1; col < board.cols - 1; col++) {
          if (!board.cells[row][col].isMine && board.cells[row][col].adjacentMines > 0) {
            numberedRow = row;
            numberedCol = col;
            break;
          }
        }
        if (numberedRow >= 0) break;
      }

      if (numberedRow >= 0) {
        gameState.revealCell(numberedRow, numberedCol);
        
        // Don't flag any cells (or flag wrong number)
        const result = gameState.performChord(numberedRow, numberedCol);

        // Should fail because flag count doesn't match
        expect(result).toBe(false);
      }
    });

    it('should not chord on unrevealed cells', () => {
      const config: GameConfig = { rows: 5, cols: 5, mines: 1, seed: 12345 };
      const gameState = new GameState(config);

      const result = gameState.performChord(0, 0);
      expect(result).toBe(false);
    });

    it('should not chord on zero cells', () => {
      const config: GameConfig = { rows: 10, cols: 10, mines: 5, seed: 12345 };
      const gameState = new GameState(config);
      const board = gameState.getBoard();

      // Find a zero cell
      let zeroRow = -1, zeroCol = -1;
      for (let row = 0; row < board.rows; row++) {
        for (let col = 0; col < board.cols; col++) {
          if (!board.cells[row][col].isMine && board.cells[row][col].adjacentMines === 0) {
            zeroRow = row;
            zeroCol = col;
            break;
          }
        }
        if (zeroRow >= 0) break;
      }

      if (zeroRow >= 0) {
        gameState.revealCell(zeroRow, zeroCol);
        const result = gameState.performChord(zeroRow, zeroCol);
        expect(result).toBe(false);
      }
    });
  });

  describe('Serialization', () => {
    it('should serialize and deserialize correctly', () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10, seed: 12345 };
      const gameState = new GameState(config);

      // Make some moves
      gameState.revealCell(0, 0);
      gameState.toggleFlag(1, 1);

      // Serialize
      const serialized = gameState.serialize();

      // Deserialize
      const restored = GameState.deserialize(serialized);

      expect(restored.getStatus()).toBe(gameState.getStatus());
      expect(restored.getFlaggedCount()).toBe(gameState.getFlaggedCount());
      expect(restored.getRows()).toBe(gameState.getRows());
      expect(restored.getCols()).toBe(gameState.getCols());

      // Check that cells match
      const originalBoard = gameState.getBoard();
      const restoredBoard = restored.getBoard();
      
      for (let row = 0; row < originalBoard.rows; row++) {
        for (let col = 0; col < originalBoard.cols; col++) {
          const originalCell = originalBoard.cells[row][col];
          const restoredCell = restoredBoard.cells[row][col];
          
          expect(restoredCell.state).toBe(originalCell.state);
          expect(restoredCell.isMine).toBe(originalCell.isMine);
          expect(restoredCell.adjacentMines).toBe(originalCell.adjacentMines);
        }
      }
    });
  });

  describe('Game Reset', () => {
    it('should reset game with same configuration', () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10, seed: 12345 };
      const gameState = new GameState(config);

      // Make some moves
      gameState.revealCell(0, 0);
      gameState.toggleFlag(1, 1);

      // Reset
      const newGame = gameState.reset();

      expect(newGame.getStatus()).toBe('idle');
      expect(newGame.getFlaggedCount()).toBe(0);
      expect(newGame.getElapsedTime()).toBe(0);
      expect(newGame.getRows()).toBe(9);
      expect(newGame.getCols()).toBe(9);
      expect(newGame.getTotalMines()).toBe(10);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct remaining mines count', () => {
      const config: GameConfig = { rows: 9, cols: 9, mines: 10, seed: 12345 };
      const gameState = new GameState(config);

      expect(gameState.getRemainingMines()).toBe(10);

      gameState.toggleFlag(0, 0);
      expect(gameState.getRemainingMines()).toBe(9);

      gameState.toggleFlag(0, 1);
      gameState.toggleFlag(0, 2);
      expect(gameState.getRemainingMines()).toBe(7);
    });

    it('should return correct board dimensions', () => {
      const config: GameConfig = { rows: 16, cols: 30, mines: 99, seed: 12345 };
      const gameState = new GameState(config);

      expect(gameState.getRows()).toBe(16);
      expect(gameState.getCols()).toBe(30);
    });
  });
});
