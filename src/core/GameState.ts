import { BoardManager } from './Board';
import { Command } from './commands/Command';
import { GameConfig, GameStatus, Cell, SerializedGameState, Board } from '../types/game';

/**
 * Central game state manager for Minesweeper.
 * 
 * This class encapsulates all game logic including cell interactions (reveal, flag, chord),
 * timer management, win/loss detection, and undo/redo functionality via the Command pattern.
 * 
 * Key features:
 * - Pure TypeScript with no UI dependencies
 * - Timestamp-based timer (persists across page reloads)
 * - Iterative BFS flood-fill (prevents stack overflow)
 * - Command pattern for atomic undo/redo operations
 * - Configurable history depth (MAX_HISTORY)
 * 
 * @class GameState
 */
export class GameState {
  /** Board manager instance */
  private board: BoardManager;
  
  /** Current game status */
  public status: GameStatus;
  
  /** Number of cells revealed (tracked for efficiency) */
  private revealedCount: number;
  
  /** Set of flagged cell keys in format "row,col" */
  private flaggedCells: Set<string>;
  
  /** Timestamp when timer started (milliseconds since epoch) */
  private startTimestamp: number;
  
  /** Elapsed time in seconds (frozen when game ends) */
  private elapsedTime: number;
  
  /** Command history for undo/redo */
  private moveHistory: Command[];
  
  /** Current position in history (for redo) */
  private historyIndex: number;
  
  /** Original game configuration */
  private config: GameConfig;
  
  /** Maximum number of moves to keep in history */
  private static readonly MAX_HISTORY = 10;

  /**
   * Creates a new GameState instance with the given configuration.
   * 
   * @param config - Game configuration (rows, cols, mines, optional seed)
   * @throws Error if configuration is invalid (handled by BoardManager)
   */
  constructor(config: GameConfig) {
    this.config = config;
    this.board = new BoardManager(config);
    this.status = 'idle';
    this.revealedCount = 0;
    this.flaggedCells = new Set();
    this.startTimestamp = 0;
    this.elapsedTime = 0;
    this.moveHistory = [];
    this.historyIndex = -1;
  }

  /**
   * Gets the current board state.
   * 
   * @returns The board object with all cells
   */
  getBoard(): Board {
    return this.board.getBoard();
  }

  /**
   * Gets a specific cell from the board.
   * 
   * @param row - Row index
   * @param col - Column index
   * @returns The cell at the specified position, or null if out of bounds
   */
  getCell(row: number, col: number): Cell | null {
    return this.board.getCellAt(row, col);
  }

  /**
   * Gets all adjacent cells around a given position.
   * 
   * @param row - Row index of center cell
   * @param col - Column index of center cell
   * @returns Array of adjacent cells (up to 8 neighbors)
   */
  getNeighbors(row: number, col: number): Cell[] {
    return this.board.getNeighbors(row, col);
  }

  /**
   * Reveals a cell at the given position.
   * 
   * This is the core game action that:
   * - Starts the timer on first reveal
   * - Checks for mine (triggers loss)
   * - Triggers flood-fill for zero-mine cells
   * - Checks win condition
   * 
   * @param row - Row index of cell to reveal
   * @param col - Column index of cell to reveal
   * @returns true if reveal was successful, false if invalid
   */
  revealCell(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    
    // Invalid cell or cell already revealed/flagged
    if (!cell || cell.state === 'revealed' || cell.state === 'flagged') {
      return false;
    }

    // Only allow reveals when idle or playing
    if (this.status !== 'idle' && this.status !== 'playing') {
      return false;
    }

    // Start timer on first reveal
    if (this.status === 'idle') {
      this.startTimer();
      this.status = 'playing';
    }

    // Reveal the cell
    cell.state = 'revealed';
    this.revealedCount++;

    // Check if revealed a mine
    if (cell.isMine) {
      this.status = 'lost';
      this.stopTimer();
      this.revealAllMines();
      return true;
    }

    // Trigger flood-fill for zero cells
    if (cell.adjacentMines === 0) {
      this.floodFillReveal(row, col);
    }

    // Check win condition
    this.checkWinCondition();

    return true;
  }

  /**
   * Toggles the flag state of a cell.
   * 
   * @param row - Row index of cell to flag/unflag
   * @param col - Column index of cell to flag/unflag
   * @returns true if toggle was successful, false if invalid
   */
  toggleFlag(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    
    // Invalid cell or cell already revealed
    if (!cell || cell.state === 'revealed') {
      return false;
    }

    // Only allow flagging when idle or playing
    if (this.status !== 'idle' && this.status !== 'playing') {
      return false;
    }

    const key = `${row},${col}`;

    if (cell.state === 'flagged') {
      // Unflag
      cell.state = 'hidden';
      this.flaggedCells.delete(key);
    } else {
      // Flag
      cell.state = 'flagged';
      this.flaggedCells.add(key);
    }

    return true;
  }

  /**
   * Performs a chord reveal on a numbered cell.
   * 
   * Chording is the middle-click action that reveals all adjacent unflagged cells
   * when the number of adjacent flags matches the cell's number.
   * 
   * @param row - Row index of numbered cell
   * @param col - Column index of numbered cell
   * @returns true if chord was successful, false if invalid
   */
  performChord(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    
    // Only chord on revealed numbered cells
    if (!cell || cell.state !== 'revealed' || cell.adjacentMines === 0) {
      return false;
    }

    // Only allow chording when playing
    if (this.status !== 'playing') {
      return false;
    }

    // Count adjacent flags
    const neighbors = this.getNeighbors(row, col);
    const flaggedCount = neighbors.filter(n => n.state === 'flagged').length;

    // Only chord if flag count matches the number
    if (flaggedCount !== cell.adjacentMines) {
      return false;
    }

    // Reveal all unflagged adjacent cells
    let revealed = false;
    for (const neighbor of neighbors) {
      if (neighbor.state === 'hidden') {
        this.revealCell(neighbor.row, neighbor.col);
        revealed = true;
      }
    }

    return revealed;
  }

  /**
   * Performs flood-fill reveal using iterative BFS algorithm.
   * 
   * When a zero-cell is revealed, all adjacent cells are revealed recursively
   * using BFS to prevent stack overflow on large boards.
   * 
   * @param startRow - Row index of starting cell
   * @param startCol - Column index of starting cell
   */
  floodFillReveal(startRow: number, startCol: number): void {
    const visited = new Set<string>();
    const queue: [number, number][] = [[startRow, startCol]];

    while (queue.length > 0) {
      const [row, col] = queue.shift()!;
      const key = `${row},${col}`;

      // Skip if already visited
      if (visited.has(key)) {
        continue;
      }
      visited.add(key);

      // Get neighbors
      const neighbors = this.getNeighbors(row, col);
      
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.row},${neighbor.col}`;
        
        // Skip if already processed, revealed, flagged, or is a mine
        if (visited.has(neighborKey) || 
            neighbor.state === 'revealed' || 
            neighbor.state === 'flagged' || 
            neighbor.isMine) {
          continue;
        }

        // Reveal the neighbor
        neighbor.state = 'revealed';
        this.revealedCount++;

        // If neighbor is also zero, add to queue for further expansion
        if (neighbor.adjacentMines === 0) {
          queue.push([neighbor.row, neighbor.col]);
        }
      }
    }
  }

  /**
   * Checks if the win condition is met.
   * 
   * Win condition: all non-mine cells are revealed.
   */
  checkWinCondition(): void {
    if (this.status !== 'playing') {
      return;
    }

    const boardData = this.getBoard();
    const totalCells = boardData.rows * boardData.cols;
    const totalMines = boardData.mines;
    const safeCells = totalCells - totalMines;

    if (this.revealedCount === safeCells) {
      this.status = 'won';
      this.stopTimer();
      // Auto-flag all remaining mines
      this.flagAllMines();
    }
  }

  /**
   * Reveals all mines on the board (called on loss).
   */
  revealAllMines(): void {
    const boardData = this.getBoard();
    
    for (let row = 0; row < boardData.rows; row++) {
      for (let col = 0; col < boardData.cols; col++) {
        const cell = boardData.cells[row][col];
        if (cell.isMine) {
          cell.state = 'revealed';
        }
      }
    }
  }

  /**
   * Flags all mines on the board (called on win).
   */
  private flagAllMines(): void {
    const boardData = this.getBoard();
    
    for (let row = 0; row < boardData.rows; row++) {
      for (let col = 0; col < boardData.cols; col++) {
        const cell = boardData.cells[row][col];
        if (cell.isMine && cell.state !== 'flagged') {
          cell.state = 'flagged';
          this.flaggedCells.add(`${row},${col}`);
        }
      }
    }
  }

  /**
   * Starts the game timer by recording the current timestamp.
   */
  startTimer(): void {
    this.startTimestamp = Date.now();
  }

  /**
   * Gets the current elapsed time in seconds.
   * 
   * If game is in progress, calculates from timestamp.
   * If game has ended, returns frozen elapsed time.
   * 
   * @returns Elapsed time in seconds
   */
  getElapsedTime(): number {
    if (this.status === 'idle') {
      return 0;
    }
    
    if (this.status === 'playing' && this.startTimestamp > 0) {
      return Math.floor((Date.now() - this.startTimestamp) / 1000);
    }
    
    return this.elapsedTime;
  }

  /**
   * Stops the timer and freezes the elapsed time (called on game end).
   */
  stopTimer(): void {
    if (this.startTimestamp > 0) {
      this.elapsedTime = Math.floor((Date.now() - this.startTimestamp) / 1000);
    }
  }

  /**
   * Gets the number of remaining flags (mines - flagged cells).
   * 
   * @returns Number of remaining flags
   */
  getRemainingFlags(): number {
    const boardData = this.getBoard();
    return boardData.mines - this.flaggedCells.size;
  }

  /**
   * Executes a command and adds it to the history.
   * 
   * This manages the undo/redo history with a maximum depth limit.
   * When a new command is executed, any commands after the current history
   * position are discarded.
   * 
   * @param command - Command to execute
   */
  executeCommand(command: Command): void {
    // Execute the command
    command.execute();

    // Truncate history after current position (discard redo stack)
    this.moveHistory = this.moveHistory.slice(0, this.historyIndex + 1);

    // Add new command to history
    this.moveHistory.push(command);
    this.historyIndex++;

    // Enforce MAX_HISTORY limit (remove oldest commands)
    if (this.moveHistory.length > GameState.MAX_HISTORY) {
      this.moveHistory.shift();
      this.historyIndex--;
    }
  }

  /**
   * Undoes the last command.
   * 
   * Restores game state to before the last action. If undoing from a
   * win/loss state, restores the 'playing' status.
   * 
   * @returns true if undo was successful, false if no moves to undo
   */
  undo(): boolean {
    if (this.historyIndex < 0) {
      return false;
    }

    const command = this.moveHistory[this.historyIndex];
    command.undo();
    this.historyIndex--;

    // Restore playing status if undoing from end state
    if (this.status === 'won' || this.status === 'lost') {
      this.status = 'playing';
    }

    // Recalculate revealed count
    this.recalculateRevealedCount();

    return true;
  }

  /**
   * Redoes the next command.
   * 
   * Re-executes a previously undone command.
   * 
   * @returns true if redo was successful, false if no moves to redo
   */
  redo(): boolean {
    if (this.historyIndex >= this.moveHistory.length - 1) {
      return false;
    }

    this.historyIndex++;
    const command = this.moveHistory[this.historyIndex];
    command.execute();

    return true;
  }

  /**
   * Recalculates the revealed count by scanning the entire board.
   * Called after undo to ensure count accuracy.
   */
  private recalculateRevealedCount(): void {
    const boardData = this.getBoard();
    this.revealedCount = 0;

    for (let row = 0; row < boardData.rows; row++) {
      for (let col = 0; col < boardData.cols; col++) {
        if (boardData.cells[row][col].state === 'revealed') {
          this.revealedCount++;
        }
      }
    }
  }

  /**
   * Serializes the current game state for persistence.
   * 
   * @returns Serialized game state object
   */
  serialize(): SerializedGameState {
    return {
      config: this.config,
      status: this.status,
      board: this.getBoard(),
      remainingFlags: this.getRemainingFlags(),
      elapsedTime: this.getElapsedTime(),
      startTimestamp: this.startTimestamp,
    };
  }

  /**
   * Deserializes a saved game state and creates a GameState instance.
   * 
   * @param data - Serialized game state data
   * @returns Reconstructed GameState instance
   * @throws Error if deserialization fails
   */
  static deserialize(data: SerializedGameState): GameState {
    const gameState = new GameState(data.config);
    
    // Restore board state
    const currentBoard = gameState.getBoard();
    for (let row = 0; row < data.board.rows; row++) {
      for (let col = 0; col < data.board.cols; col++) {
        const savedCell = data.board.cells[row][col];
        const currentCell = currentBoard.cells[row][col];
        
        // Copy cell state
        currentCell.state = savedCell.state;
        currentCell.isMine = savedCell.isMine;
        currentCell.adjacentMines = savedCell.adjacentMines;
        
        // Track flagged cells
        if (savedCell.state === 'flagged') {
          gameState.flaggedCells.add(`${row},${col}`);
        }
      }
    }
    
    // Restore game state
    gameState.status = data.status;
    gameState.startTimestamp = data.startTimestamp;
    gameState.elapsedTime = data.elapsedTime;
    
    // Recalculate revealed count
    gameState.recalculateRevealedCount();
    
    return gameState;
  }

  /**
   * Resets the game with the same configuration.
   * 
   * Creates a new board with the same dimensions and mine count,
   * but with new mine placement (unless using same seed).
   * 
   * @returns New GameState instance with same config
   */
  reset(): GameState {
    return new GameState(this.config);
  }

  /**
   * Gets the current game status.
   * 
   * @returns Current game status
   */
  getStatus(): GameStatus {
    return this.status;
  }

  /**
   * Checks if a move can be undone.
   * 
   * @returns true if undo is available
   */
  canUndo(): boolean {
    return this.historyIndex >= 0;
  }

  /**
   * Checks if a move can be redone.
   * 
   * @returns true if redo is available
   */
  canRedo(): boolean {
    return this.historyIndex < this.moveHistory.length - 1;
  }

  /**
   * Gets the game configuration.
   * 
   * @returns Game configuration
   */
  getConfig(): GameConfig {
    return this.config;
  }

  /**
   * Gets the number of flagged cells.
   * 
   * @returns Count of flagged cells
   */
  getFlaggedCount(): number {
    return this.flaggedCells.size;
  }

  /**
   * Gets the total number of mines on the board.
   * 
   * @returns Total mine count
   */
  getTotalMines(): number {
    return this.board.getBoard().mines;
  }

  /**
   * Gets the remaining unflagged mines count.
   * 
   * @returns Remaining mines (totalMines - flaggedCount)
   */
  getRemainingMines(): number {
    return this.getTotalMines() - this.getFlaggedCount();
  }

  /**
   * Gets the board as a 2D array of cells.
   * 
   * @returns 2D array of cells
   */
  getCells(): Cell[][] {
    return this.board.getBoard().cells;
  }

  /**
   * Gets the number of rows on the board.
   * 
   * @returns Row count
   */
  getRows(): number {
    return this.board.getBoard().rows;
  }

  /**
   * Gets the number of columns on the board.
   * 
   * @returns Column count
   */
  getCols(): number {
    return this.board.getBoard().cols;
  }
}
