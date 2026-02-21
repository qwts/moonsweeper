import { useState, useEffect } from 'react';
import { GameProvider } from '../contexts/GameContext';
import { useGame } from '../hooks/useGame';
import { useTheme } from '../hooks/useTheme';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { EndGameModal } from './EndGameModal';
import { GameSetup } from './GameSetup';
import { Board } from './Board';
import { StatusBar } from './StatusBar';
import { Controls } from './Controls';
import { ShortcutsHelp } from './ShortcutsHelp';
import { audioManager } from '../utils/audio';
import { syncStorage } from '../shared/chrome-storage';
import { MessageType, UpdateSettingsMessage } from '../shared/message-types';
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
  const [muteToast, setMuteToast] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean | undefined>(undefined);
  
  // Initialize theme system
  useTheme();
  
  // Load animation preference from storage
  useEffect(() => {
    const loadAnimationPreference = async () => {
      const enabled = await syncStorage.get('animationsEnabled');
      // Default to true if not set
      setAnimationsEnabled(enabled !== false);
    };
    loadAnimationPreference();

    // Listen for storage changes
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.animationsEnabled) {
        setAnimationsEnabled(changes.animationsEnabled.newValue !== false);
      }
    };

    if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => chrome.storage.onChanged.removeListener(handleStorageChange);
    }
  }, []);
  
  // Initialize animation control system with user preference
  useReducedMotion(animationsEnabled);

  // Global keyboard listener for shortcuts modal (H or ?)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Show shortcuts help with H or ? key
      if (
        (event.key.toLowerCase() === 'h' || event.key === '?') &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        setShowShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Keyboard shortcut for mute/unmute (M key)
  useEffect(() => {
    const handleKeyPress = async (event: KeyboardEvent) => {
      // Only handle 'M' key when not typing in an input
      if (
        event.key.toLowerCase() === 'm' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLTextAreaElement)
      ) {
        event.preventDefault();
        
        try {
          // Toggle mute in audio manager
          const newMuted = audioManager.toggleMute();
          
          // Show toast
          setMuteToast(newMuted ? '🔇 Muted' : '🔊 Unmuted');
          setTimeout(() => setMuteToast(null), 2000);
          
          // Save to chrome.storage
          const soundEnabled = !newMuted;
          await syncStorage.set('soundEnabled', soundEnabled);
          
          // Also send message to background to update settings
          if (typeof chrome !== 'undefined' && chrome.runtime) {
            const message: UpdateSettingsMessage = {
              type: MessageType.UPDATE_SETTINGS,
              timestamp: Date.now(),
              settings: { soundEnabled },
            };
            chrome.runtime.sendMessage(message).catch((error) => {
              console.warn('Failed to update settings via message:', error);
            });
          }
        } catch (error) {
          console.error('Failed to toggle mute:', error);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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
      {/* Mute toast notification */}
      {muteToast && (
        <div
          className={styles.muteToast}
          role="status"
          aria-live="polite"
        >
          {muteToast}
        </div>
      )}
      
      <div className={styles.gameBoard}>
        <h1 className={styles.gameTitle}>MindSweeper</h1>
        
        <main role="main" aria-label="Game board">
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
        </main>

        {/* Controls */}
        <nav aria-label="Game controls">
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
            <button
              onClick={() => setShowShortcuts(true)}
              className={styles.helpButton}
              aria-label="Show keyboard shortcuts"
              title="Keyboard shortcuts (H or ?)"
            >
              ?
            </button>
          </div>
        </nav>
      </div>

      {/* End Game Modal */}
      <EndGameModal
        status={status}
        elapsedTime={elapsedTime}
        onPlayAgain={handlePlayAgain}
        onNewGame={handleNewGame}
      />

      {/* Keyboard Shortcuts Help */}
      <ShortcutsHelp
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
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
