import { Board, Cell, GameConfig } from '../types/game';
import { SeededRandom } from '../utils/random';

/**
 * Manages board creation, mine placement, and cell operations
 * Pure TypeScript class with no UI dependencies
 */
export class BoardManager {
  private board: Board;

  /**
   * Create a new board with the given configuration
   * @param config - Game configuration (dimensions, mines, optional seed)
   * @throws Error if configuration is invalid
   */
  constructor(config: GameConfig) {
    this.validateConfig(config);
    
    this.board = {
      rows: config.rows,
      cols: config.cols,
      mines: config.mines,
      cells: [],
    };

    this.initializeCells();
    this.placeMines(config.seed);
    this.calculateAdjacentMines();
  }

  /**
   * Get the current board state
   */
  getBoard(): Board {
    return this.board;
  }

  /**
   * Validate game configuration
   * @param config - Configuration to validate
   * @throws Error if configuration is invalid
   */
  private validateConfig(config: GameConfig): void {
    if (config.rows < 5 || config.rows > 50) {
      throw new Error('Rows must be between 5 and 50');
    }
    if (config.cols < 5 || config.cols > 50) {
      throw new Error('Columns must be between 5 and 50');
    }
    if (config.mines < 1) {
      throw new Error('At least 1 mine is required');
    }
    const totalCells = config.rows * config.cols;
    if (config.mines >= totalCells) {
      throw new Error('Number of mines must be less than total cells');
    }
  }

  /**
   * Initialize the 2D cell array with default values
   * All cells start hidden with no mines
   */
  private initializeCells(): void {
    this.board.cells = [];
    for (let row = 0; row < this.board.rows; row++) {
      this.board.cells[row] = [];
      for (let col = 0; col < this.board.cols; col++) {
        this.board.cells[row][col] = {
          row,
          col,
          isMine: false,
          adjacentMines: 0,
          state: 'hidden',
        };
      }
    }
  }

  /**
   * Place mines randomly on the board using Fisher-Yates shuffle
   * @param seed - Optional seed for deterministic placement
   */
  private placeMines(seed?: number): void {
    const totalCells = this.board.rows * this.board.cols;
    const positions: number[] = [];
    
    // Create array of all cell positions
    for (let i = 0; i < totalCells; i++) {
      positions.push(i);
    }

    // Fisher-Yates shuffle with optional seeded RNG
    const rng = seed !== undefined ? new SeededRandom(seed) : null;
    
    for (let i = totalCells - 1; i > 0; i--) {
      const j = rng ? rng.nextInt(i + 1) : Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Place mines at the first K shuffled positions
    for (let i = 0; i < this.board.mines; i++) {
      const position = positions[i];
      const row = Math.floor(position / this.board.cols);
      const col = position % this.board.cols;
      this.board.cells[row][col].isMine = true;
    }
  }

  /**
   * Calculate adjacent mine counts for all cells
   * Must be called after mine placement
   */
  private calculateAdjacentMines(): void {
    for (let row = 0; row < this.board.rows; row++) {
      for (let col = 0; col < this.board.cols; col++) {
        if (!this.board.cells[row][col].isMine) {
          const neighbors = this.getNeighbors(row, col);
          const mineCount = neighbors.filter(cell => cell.isMine).length;
          this.board.cells[row][col].adjacentMines = mineCount;
        }
      }
    }
  }

  /**
   * Safely get a cell at the given position
   * @param row - Row index
   * @param col - Column index
   * @returns The cell at the position, or null if out of bounds
   */
  getCellAt(row: number, col: number): Cell | null {
    if (row < 0 || row >= this.board.rows || col < 0 || col >= this.board.cols) {
      return null;
    }
    return this.board.cells[row][col];
  }

  /**
   * Get all adjacent cells (up to 8 neighbors)
   * @param row - Row index of the center cell
   * @param col - Column index of the center cell
   * @returns Array of adjacent cells (excluding out-of-bounds positions)
   */
  getNeighbors(row: number, col: number): Cell[] {
    const neighbors: Cell[] = [];
    
    // Check all 8 directions
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        // Skip the center cell itself
        if (dr === 0 && dc === 0) continue;
        
        const neighbor = this.getCellAt(row + dr, col + dc);
        if (neighbor !== null) {
          neighbors.push(neighbor);
        }
      }
    }
    
    return neighbors;
  }
}
