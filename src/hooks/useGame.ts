import { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

/**
 * Custom hook for accessing the game context.
 * 
 * Provides access to game state and all game actions:
 * - gameState: Current GameState instance
 * - status: Current game status
 * - elapsedTime: Elapsed time in seconds
 * - remainingFlags: Number of remaining flags
 * - revealCell: Reveal a cell
 * - toggleFlag: Toggle flag on a cell
 * - performChord: Perform chord on a numbered cell
 * - undo: Undo last move
 * - redo: Redo last undone move
 * - startNewGame: Start a new game with config
 * - resetGame: Reset game with same config
 * - canUndo: Whether undo is available
 * - canRedo: Whether redo is available
 * 
 * @throws Error if used outside of GameProvider
 * @returns Game context value
 */
export function useGame() {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  
  return context;
}
