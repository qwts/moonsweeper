/**
 * Base Command interface for the Command pattern.
 * 
 * This interface enables undo/redo functionality by requiring all game actions
 * to implement both execute and undo methods. Commands encapsulate game state
 * changes and store the necessary information to reverse those changes.
 * 
 * @interface Command
 */
export interface Command {
  /**
   * Executes the command, applying the game state change.
   */
  execute(): void;

  /**
   * Undoes the command, reverting the game state change.
   */
  undo(): void;
}
