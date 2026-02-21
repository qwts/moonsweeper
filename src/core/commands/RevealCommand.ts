import { Command } from './Command';

/**
 * Command for revealing a single cell.
 * 
 * This command stores the cell's position and previous state (revealed status)
 * to enable undoing a reveal action. When executed, it reveals the cell.
 * When undone, it hides the cell by restoring its previous revealed state.
 * 
 * @class RevealCommand
 * @implements {Command}
 */
export class RevealCommand implements Command {
  private readonly row: number;
  private readonly col: number;
  private readonly gameState: any; // Will be typed as GameState later
  private previousRevealed: boolean;

  /**
   * Creates a RevealCommand instance.
   * 
   * @param gameState - Reference to the game state manager
   * @param row - Row index of the cell to reveal
   * @param col - Column index of the cell to reveal
   */
  constructor(gameState: any, row: number, col: number) {
    this.gameState = gameState;
    this.row = row;
    this.col = col;
    this.previousRevealed = false;
  }

  /**
   * Executes the reveal action on the cell.
   * Stores the previous revealed state before revealing.
   */
  execute(): void {
    const cell = this.gameState.getCell(this.row, this.col);
    this.previousRevealed = cell.revealed;
    this.gameState.revealCell(this.row, this.col);
  }

  /**
   * Undoes the reveal action by hiding the cell.
   * Restores the cell to its previous revealed state.
   */
  undo(): void {
    const cell = this.gameState.getCell(this.row, this.col);
    cell.revealed = this.previousRevealed;
    
    // If undoing a losing move, restore playing status
    if (this.gameState.status === 'lost' || this.gameState.status === 'won') {
      this.gameState.status = 'playing';
    }
  }
}
