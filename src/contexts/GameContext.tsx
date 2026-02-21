import { createContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { GameState } from '../core/GameState';
import { GameConfig, GameStatus } from '../types/game';
import { 
  loadGameState, 
  saveGameState, 
  clearGameState,
  saveGameToHistory,
  updateStatistics 
} from '../core/storage';
import { audioManager } from '../utils/audio';
import { syncStorage } from '../shared/chrome-storage';

/**
 * Interface for the game context value
 */
interface GameContextValue {
  gameState: GameState | null;
  status: GameStatus;
  elapsedTime: number;
  remainingFlags: number;
  isLoading: boolean;
  revealCell: (row: number, col: number) => void;
  toggleFlag: (row: number, col: number) => void;
  performChord: (row: number, col: number) => void;
  undo: () => void;
  redo: () => void;
  startNewGame: (config: GameConfig) => void;
  resetGame: () => void;
  clearSavedGame: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Game context for sharing game state across components
 */
export const GameContext = createContext<GameContextValue | null>(null);

/**
 * Props for GameProvider component
 */
interface GameProviderProps {
  children: ReactNode;
}

/**
 * GameProvider component that manages the game state and provides
 * actions to child components via React Context.
 * 
 * Features:
 * - Manages GameState instance
 * - Triggers re-renders on state changes
 * - Provides game actions (reveal, flag, chord, undo, redo)
 * - Handles timer updates with setInterval
 * - Auto-saves game state to chrome.storage
 * - Loads saved game state on mount
 */
export function GameProvider({ children }: GameProviderProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, forceUpdate] = useState({});
  const lastSavedStatus = useRef<GameStatus | null>(null);
  const audioInitialized = useRef(false);
  
  // Force a re-render to update UI with latest game state
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Initialize audio system on mount
  useEffect(() => {
    if (audioInitialized.current) {
      return;
    }

    const initAudio = async () => {
      try {
        // Preload audio files
        await audioManager.preload();

        // Load audio settings from chrome.storage.sync
        const soundEnabled = await syncStorage.get('soundEnabled');
        const soundVolume = await syncStorage.get('soundVolume');

        audioManager.setMuted(!(soundEnabled ?? false));
        audioManager.setVolume(soundVolume ?? 0.5);

        audioInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initAudio();
  }, []);

  // Listen for storage changes to sync audio settings across contexts
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.soundEnabled) {
        audioManager.setMuted(!changes.soundEnabled.newValue);
      }
      if (changes.soundVolume) {
        const newVolume = changes.soundVolume.newValue;
        if (typeof newVolume === 'number') {
          audioManager.setVolume(newVolume);
        }
      }
    };

    // Only set up listener in extension environment
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.onChanged.addListener(handleStorageChange);
      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  // Load saved game state on mount
  useEffect(() => {
    let mounted = true;
    
    const loadSavedGame = async () => {
      try {
        const savedState = await loadGameState();
        if (savedState && mounted) {
          const restoredGame = GameState.deserialize(savedState);
          setGameState(restoredGame);
        }
      } catch (error) {
        console.error('Failed to load saved game:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadSavedGame();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Timer effect - updates every second when game is playing
  useEffect(() => {
    if (!gameState || gameState.status !== 'playing') {
      return;
    }

    const interval = setInterval(() => {
      triggerUpdate();
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, gameState?.status, triggerUpdate]);

  // Auto-save game state when it changes
  useEffect(() => {
    if (!gameState || isLoading) {
      return;
    }

    const saveGame = async () => {
      try {
        const serialized = gameState.serialize();
        await saveGameState(serialized);

        // If game just ended, save to history and update statistics
        if (
          (gameState.status === 'won' || gameState.status === 'lost') &&
          lastSavedStatus.current === 'playing'
        ) {
          const board = gameState.getBoard();
          const difficulty = `${board.rows}x${board.cols}x${board.mines}`;
          const elapsedTime = gameState.getElapsedTime();
          
          await saveGameToHistory({
            timestamp: Date.now(),
            config: serialized.config,
            won: gameState.status === 'won',
            time: elapsedTime,
          });

          await updateStatistics(
            gameState.status === 'won',
            elapsedTime,
            difficulty
          );
        }

        lastSavedStatus.current = gameState.status;
      } catch (error) {
        console.error('Failed to auto-save game state:', error);
      }
    };

    // Debounce saves to avoid excessive writes
    const timeoutId = setTimeout(saveGame, 300);
    
    return () => clearTimeout(timeoutId);
  }, [gameState, isLoading]);

  /**
   * Starts a new game with the given configuration
   */
  const startNewGame = useCallback((config: GameConfig) => {
    const newGame = new GameState(config);
    setGameState(newGame);
    lastSavedStatus.current = null;
  }, []);

  /**
   * Resets the current game (new board, same config)
   */
  const resetGame = useCallback(() => {
    if (!gameState) return;
    const newGame = gameState.reset();
    setGameState(newGame);
    lastSavedStatus.current = null;
  }, [gameState]);

  /**
   * Clears the saved game state from storage
   */
  const clearSavedGame = useCallback(async () => {
    try {
      await clearGameState();
      setGameState(null);
      lastSavedStatus.current = null;
    } catch (error) {
      console.error('Failed to clear saved game:', error);
      throw error;
    }
  }, []);

  /**
   * Reveals a cell at the given position
   */
  const revealCell = useCallback((row: number, col: number) => {
    if (!gameState) return;
    
    const prevStatus = gameState.status;
    gameState.revealCell(row, col);
    const newStatus = gameState.status;
    
    // Play reveal sound for normal reveals
    if (prevStatus === 'playing') {
      audioManager.play('reveal');
    }
    
    // Play win/loss sounds for game end
    if (prevStatus === 'playing' && newStatus === 'won') {
      audioManager.play('win');
    } else if (prevStatus === 'playing' && newStatus === 'lost') {
      audioManager.play('loss');
    }
    
    triggerUpdate();
  }, [gameState, triggerUpdate]);

  /**
   * Toggles flag state of a cell
   */
  const toggleFlag = useCallback((row: number, col: number) => {
    if (!gameState) return;
    gameState.toggleFlag(row, col);
    
    // Play flag sound
    audioManager.play('flag');
    
    triggerUpdate();
  }, [gameState, triggerUpdate]);

  /**
   * Performs a chord reveal on a numbered cell
   */
  const performChord = useCallback((row: number, col: number) => {
    if (!gameState) return;
    gameState.performChord(row, col);
    triggerUpdate();
  }, [gameState, triggerUpdate]);

  /**
   * Undoes the last move
   */
  const undo = useCallback(() => {
    if (!gameState) return;
    gameState.undo();
    triggerUpdate();
  }, [gameState, triggerUpdate]);

  /**
   * Redoes the last undone move
   */
  const redo = useCallback(() => {
    if (!gameState) return;
    gameState.redo();
    triggerUpdate();
  }, [gameState, triggerUpdate]);

  // Compute derived values
  const status = gameState?.status || 'idle';
  const elapsedTime = gameState?.getElapsedTime() || 0;
  const remainingFlags = gameState?.getRemainingMines() || 0;
  const canUndo = gameState?.canUndo() || false;
  const canRedo = gameState?.canRedo() || false;

  const value: GameContextValue = {
    gameState,
    status,
    elapsedTime,
    remainingFlags,
    isLoading,
    revealCell,
    toggleFlag,
    performChord,
    undo,
    redo,
    startNewGame,
    resetGame,
    clearSavedGame,
    canUndo,
    canRedo,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}
