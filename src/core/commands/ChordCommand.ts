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
 * Command for chord reveal (middle-click on numbered cell).
 * 
 * Chording reveals all adjacent unflagged cells around a numbered cell when
 * the number of adjacent flags matches the cell's number. This command stores
 * all cells that will be revealed and their previous states to enable undoing
 * the entire chord operation atomically.
 * 
 * @class ChordCommand
 * @implements {Command}
 */
export class ChordCommand implements Command {
  private readonly row: number;
  private readonly col: number;
  private readonly gameState: any; // Will be typed as GameState later
  private cellSnapshots: CellSnapshot[] = [];

  /**
   * Creates a ChordCommand instance.
   * 
   * @param gameState - Reference to the game state manager
   * @param row - Row index of the numbered cell to chord
   * @param col - Column index of the numbered cell to chord
   */
  constructor(gameState: any, row: number, col: number) {
    this.gameState = gameState;
    this.row = row;
    this.col = col;
  }

  /**
   * Executes the chord reveal action.
   * Reveals all adjacent unflagged cells if the flag count matches the cell's number.
   * Stores snapshots of all affected cells before revealing.
   */
  execute(): void {
    const cell = this.gameState.getCell(this.row, this.col);
    
    // Only chord on revealed numbered cells
    if (!cell.revealed || cell.adjacentMines === 0) {
      return;
    }
    
    // Count adjacent flags
    const adjacentCells = this.gameState.getAdjacentCells(this.row, this.col);
    const flaggedCount = adjacentCells.filter((c: any) => c.flagged).length;
    
    // Only chord if flag count matches the number
    if (flaggedCount !== cell.adjacentMines) {
      return;
    }
    
    // Store snapshots and reveal unflagged cells
    this.cellSnapshots = [];
    for (const adjCell of adjacentCells) {
      if (!adjCell.flagged && !adjCell.revealed) {
        this.cellSnapshots.push({
          row: adjCell.row,
          col: adjCell.col,
          revealed: adjCell.revealed
        });
        this.gameState.revealCell(adjCell.row, adjCell.col);
      }
    }
  }

  /**
   * Undoes the chord reveal by hiding all cells that were revealed.
   * Restores all affected cells to their previous states atomically.
   */
  undo(): void {
    for (const snapshot of this.cellSnapshots) {
      const cell = this.gameState.getCell(snapshot.row, snapshot.col);
      cell.revealed = snapshot.revealed;
    }
    
    // If undoing a losing move, restore playing status
    if (this.gameState.status === 'lost' || this.gameState.status === 'won') {
      this.gameState.status = 'playing';
    }
  }
}
