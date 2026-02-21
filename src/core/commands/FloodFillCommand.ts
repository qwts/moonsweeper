import { Command } from './Command';

/**
 * Cell state snapshot for undo operations.
 */
interface CellSnapshot {
  row: number;
  col: number;
  revealed: boolean;
}

/**
 * Command for flood-fill reveal using BFS algorithm.
 * 
 * When a cell with zero adjacent mines is revealed, all adjacent cells
 * are recursively revealed using an iterative BFS approach (to prevent
 * stack overflow). This command stores all cells that were revealed during
 * the flood-fill operation to enable undoing the entire operation atomically.
 * 
 * @class FloodFillCommand
 * @implements {Command}
 */
export class FloodFillCommand implements Command {
  private readonly startRow: number;
  private readonly startCol: number;
  private readonly gameState: any; // Will be typed as GameState later
  private cellSnapshots: CellSnapshot[] = [];

  /**
   * Creates a FloodFillCommand instance.
   * 
   * @param gameState - Reference to the game state manager
   * @param startRow - Row index of the starting cell for flood fill
   * @param startCol - Column index of the starting cell for flood fill
   */
  constructor(gameState: any, startRow: number, startCol: number) {
    this.gameState = gameState;
    this.startRow = startRow;
    this.startCol = startCol;
  }

  /**
   * Executes the flood-fill reveal using BFS algorithm.
   * Reveals the starting cell and all connected cells with zero adjacent mines.
   * Stores snapshots of all affected cells before revealing.
   */
  execute(): void {
    const visited = new Set<string>();
    const queue: [number, number][] = [[this.startRow, this.startCol]];
    this.cellSnapshots = [];

    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      const key = `${row},${col}`;

      // Skip if already visited or out of bounds
      if (visited.has(key)) continue;
      visited.add(key);

      const cell = this.gameState.getCell(row, col);
      if (!cell || cell.revealed || cell.flagged || cell.hasMine) {
        continue;
      }

      // Store snapshot and reveal cell
      this.cellSnapshots.push({
        row,
        col,
        revealed: cell.revealed
      });
      cell.revealed = true;

      // If cell has zero adjacent mines, add all adjacent cells to queue
      if (cell.adjacentMines === 0) {
        const adjacentCells = this.gameState.getAdjacentCells(row, col);
        for (const adj of adjacentCells) {
          queue.push([adj.row, adj.col]);
        }
      }
    }

    // Check win condition after flood fill
    this.gameState.checkWinCondition();
  }

  /**
   * Undoes the flood-fill reveal by hiding all cells that were revealed.
   * Restores all affected cells to their previous states atomically.
   */
  undo(): void {
    for (const snapshot of this.cellSnapshots) {
      const cell = this.gameState.getCell(snapshot.row, snapshot.col);
      cell.revealed = snapshot.revealed;
    }

    // If undoing a winning move, restore playing status
    if (this.gameState.status === 'won' || this.gameState.status === 'lost') {
      this.gameState.status = 'playing';
    }
  }
}
