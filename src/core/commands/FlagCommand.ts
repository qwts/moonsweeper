import { Command } from './Command';

/**
 * Command for toggling a flag on a cell.
 * 
 * This command stores the cell's position and previous flag state to enable
 * undoing a flag toggle action. When executed, it toggles the flag state.
 * When undone, it restores the previous flag state.
 * 
 * @class FlagCommand
 * @implements {Command}
 */
export class FlagCommand implements Command {
  private readonly row: number;
  private readonly col: number;
  private readonly gameState: any; // Will be typed as GameState later
  private previousFlagged: boolean;

  /**
   * Creates a FlagCommand instance.
   * 
   * @param gameState - Reference to the game state manager
   * @param row - Row index of the cell to flag
   * @param col - Column index of the cell to flag
   */
  constructor(gameState: any, row: number, col: number) {
    this.gameState = gameState;
    this.row = row;
    this.col = col;
    this.previousFlagged = false;
  }

  /**
   * Executes the flag toggle action on the cell.
   * Stores the previous flag state before toggling.
   */
  execute(): void {
    const cell = this.gameState.getCell(this.row, this.col);
    this.previousFlagged = cell.flagged;
    this.gameState.toggleFlag(this.row, this.col);
  }

  /**
   * Undoes the flag toggle action by restoring the previous flag state.
   */
  undo(): void {
    const cell = this.gameState.getCell(this.row, this.col);
    cell.flagged = this.previousFlagged;
    
    // Update mine counter if needed
    this.gameState.updateMineCounter();
  }
}
