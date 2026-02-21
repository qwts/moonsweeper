import { useState } from 'react';
import { GameProvider } from '../contexts/GameContext';
import { useGame } from '../hooks/useGame';
import { useTheme } from '../hooks/useTheme';
import { EndGameModal } from './EndGameModal';
import { GameSetup } from './GameSetup';
import { Board } from './Board';
import { StatusBar } from './StatusBar';
import { Controls } from './Controls';
import styles from '../styles/Game.module.css';

/**
 * Internal game component (wrapped by GameProvider)
 * 
 * This component conditionally renders either the game setup screen
 * or the active game board. It orchestrates all game UI components.
 */
function GameInternal() {
  const { gameState, status, elapsedTime, resetGame, startNewGame, revealCell, toggleFlag, performChord, undo, redo, canUndo, canRedo } = useGame();
  const [showSetup, setShowSetup] = useState(true);
  
  // Initialize theme system
  useTheme();

  // Handle starting a new game from setup screen
  const handleStartGame = (config: any) => {
    startNewGame(config);
    setShowSetup(false);
  };

  // Handle "New Game" button - return to setup
  const handleNewGame = () => {
    setShowSetup(true);
  };

  // Handle "Play Again" button - reset with same config
  const handlePlayAgain = () => {
    resetGame();
  };

  // Show setup screen when no game exists or explicitly requested
  if (!gameState || showSetup) {
    return (
      <div className={styles.gameContainer}>
        <GameSetup onStartGame={handleStartGame} />
      </div>
    );
  }

  // Render active game
  return (
    <div className={styles.gameContainer}>
      <div className={styles.gameBoard}>
        <h1 className={styles.gameTitle}>MindSweeper</h1>
        
        {/* Status Bar */}
        <StatusBar
          elapsedTime={elapsedTime}
          totalMines={gameState.getTotalMines()}
          flaggedCount={gameState.getFlaggedCount()}
        />

        {/* Game Board */}
        <Board
          cells={gameState.getCells()}
          onReveal={revealCell}
          onFlag={toggleFlag}
          onChord={performChord}
          disabled={status === 'won' || status === 'lost'}
        />

        {/* Controls */}
        <div className={styles.controlsSection}>
          <button onClick={handleNewGame} className={styles.newGameButton}>
            New Game
          </button>
          <Controls
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </div>
      </div>

      {/* End Game Modal */}
      <EndGameModal
        status={status}
        elapsedTime={elapsedTime}
        onPlayAgain={handlePlayAgain}
        onNewGame={handleNewGame}
      />
    </div>
  );
}

/**
 * Main game component that wraps everything in GameProvider.
 * 
 * This is the top-level component that orchestrates the entire game UI:
 * - Conditionally renders GameSetup or active game based on status
 * - Manages layout and overall game flow
 * - Provides EndGameModal overlay
 * 
 * Component hierarchy:
 * Game (with GameProvider)
 *   └─ GameInternal
 *       ├─ GameSetup (when no game or setup requested)
 *       └─ Active Game (when game in progress)
 *           ├─ StatusBar (timer, mine counter)
 *           ├─ Board (grid with cells)
 *           ├─ Controls (undo/redo buttons)
 *           └─ EndGameModal (win/loss overlay)
 */
export function Game() {
  return (
    <GameProvider>
      <GameInternal />
    </GameProvider>
  );
}
