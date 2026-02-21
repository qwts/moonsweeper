/**
 * Popup UI component for Chrome extension popup mode (400×600px)
 * 
 * This component replaces GameContext with background service worker communication.
 * All game state is managed by the background script and synchronized via message passing.
 */
import { useState, useEffect, useCallback } from 'react';
import { Board } from '../components/Board';
import { StatusBar } from '../components/StatusBar';
import { Controls } from '../components/Controls';
import { EndGameModal } from '../components/EndGameModal';
import { GameSetup } from '../components/GameSetup';
import { useTheme } from '../hooks/useTheme';
import { MessageType, GameStateResponse } from '../shared/message-types';
import type { SerializedGameState, GameConfig, GameStatus, Cell } from '../types/game';
import styles from './popup.module.css';

type LoadingState = 'loading' | 'ready' | 'error';

export function Popup() {
  const [loadingState, setLoadingState] = useState<LoadingState>('loading');
  const [gameState, setGameState] = useState<SerializedGameState | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showSetup, setShowSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boardScale, setBoardScale] = useState(1);
  
  // Initialize theme system
  useTheme();

  /**
   * Send message to background service worker
   */
  const sendMessage = useCallback(async <T,>(message: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { ...message, timestamp: Date.now() },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        }
      );
    });
  }, []);

  /**
   * Load game state from background
   */
  const loadGameState = useCallback(async () => {
    try {
      setLoadingState('loading');
      const response = await sendMessage<GameStateResponse>({
        type: MessageType.GET_GAME_STATE,
      });

      if (response.success && response.state) {
        setGameState(response.state);
        setElapsedTime(response.state.elapsedTime);
        setLoadingState('ready');
        
        // If no game exists, show setup
        if (response.state.status === 'idle') {
          setShowSetup(true);
        }
      } else {
        // No game state yet, show setup
        setShowSetup(true);
        setLoadingState('ready');
      }
    } catch (err) {
      console.error('Failed to load game state:', err);
      setError(err instanceof Error ? err.message : 'Failed to load game');
      setLoadingState('error');
    }
  }, [sendMessage]);

  /**
   * Calculate board scale based on grid size and popup constraints
   * Accounts for StatusBar, Controls, Header, and Footer space
   */
  const calculateBoardScale = useCallback((rows: number, cols: number) => {
    // Popup window size constraints (Chrome extension fixed size)
    const popupWidth = 400;
    const popupHeight = 600;
    
    // UI chrome space reservations (in pixels)
    const headerHeight = 50;
    const statusBarHeight = 80;
    const controlsHeight = 80;
    const footerHeight = 40;
    const padding = 20; // Horizontal padding
    
    // Available space for the board
    const maxWidth = popupWidth - (padding * 2);
    const maxHeight = popupHeight - headerHeight - statusBarHeight - controlsHeight - footerHeight;
    
    // Cell dimensions from CSS
    const cellSize = 44; // Minimum WCAG-compliant cell size
    const gap = 1; // Gap between cells
    const borderPadding = 4; // Board border
    
    // Calculate actual board dimensions
    const boardWidth = cols * cellSize + (cols - 1) * gap + borderPadding;
    const boardHeight = rows * cellSize + (rows - 1) * gap + borderPadding;
    
    // Calculate scale factors for width and height
    const widthScale = maxWidth / boardWidth;
    const heightScale = maxHeight / boardHeight;
    
    // Use the smaller scale to fit both dimensions, capped at 1.0 (no upscaling)
    // and minimum of 0.4 (40%) to maintain usability
    const scale = Math.max(0.4, Math.min(1, widthScale, heightScale));
    
    setBoardScale(scale);
  }, []);

  /**
   * Initial load on mount
   */
  useEffect(() => {
    loadGameState();
  }, [loadGameState]);

  /**
   * Listen for game state updates from background
   */
  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === MessageType.GAME_STATE_UPDATED && message.state) {
        setGameState(message.state);
        setElapsedTime(message.state.elapsedTime);
        
        // Calculate scale for new board size
        const { board } = message.state;
        calculateBoardScale(board.rows, board.cols);
      } else if (message.type === MessageType.TIMER_UPDATE) {
        setElapsedTime(message.elapsedTime);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [calculateBoardScale]);

  /**
   * Calculate scale when game state changes
   */
  useEffect(() => {
    if (gameState?.board) {
      calculateBoardScale(gameState.board.rows, gameState.board.cols);
    }
  }, [gameState?.board, calculateBoardScale]);

  /**
   * Game actions that communicate with background
   */
  const handleRevealCell = useCallback(async (row: number, col: number) => {
    try {
      await sendMessage({
        type: MessageType.REVEAL_CELL,
        row,
        col,
      });
    } catch (err) {
      console.error('Failed to reveal cell:', err);
    }
  }, [sendMessage]);

  const handleToggleFlag = useCallback(async (row: number, col: number) => {
    try {
      await sendMessage({
        type: MessageType.TOGGLE_FLAG,
        row,
        col,
      });
    } catch (err) {
      console.error('Failed to toggle flag:', err);
    }
  }, [sendMessage]);

  const handleChord = useCallback(async (row: number, col: number) => {
    try {
      await sendMessage({
        type: MessageType.CHORD,
        row,
        col,
      });
    } catch (err) {
      console.error('Failed to chord:', err);
    }
  }, [sendMessage]);

  const handleUndo = useCallback(async () => {
    try {
      await sendMessage({
        type: MessageType.UNDO,
      });
    } catch (err) {
      console.error('Failed to undo:', err);
    }
  }, [sendMessage]);

  const handleRedo = useCallback(async () => {
    try {
      await sendMessage({
        type: MessageType.REDO,
      });
    } catch (err) {
      console.error('Failed to redo:', err);
    }
  }, [sendMessage]);

  const handleReset = useCallback(async () => {
    try {
      await sendMessage({
        type: MessageType.RESET_GAME,
      });
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  }, [sendMessage]);

  const handleStartNewGame = useCallback(async (config: GameConfig) => {
    try {
      await sendMessage({
        type: MessageType.START_NEW_GAME,
        config,
      });
      setShowSetup(false);
    } catch (err) {
      console.error('Failed to start new game:', err);
    }
  }, [sendMessage]);

  const handleNewGame = useCallback(() => {
    setShowSetup(true);
  }, []);

  const handlePlayAgain = useCallback(async () => {
    await handleReset();
  }, [handleReset]);

  const handleOpenFullPage = useCallback(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  }, []);

  const handleOpenSettings = useCallback(() => {
    chrome.runtime.openOptionsPage();
  }, []);

  /**
   * Render loading state
   */
  if (loadingState === 'loading') {
    return (
      <div className={styles.popupContainer}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (loadingState === 'error') {
    return (
      <div className={styles.popupContainer}>
        <div className={styles.errorState}>
          <h2>Error</h2>
          <p>{error || 'Failed to connect to background service'}</p>
          <button onClick={loadGameState} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render setup screen
   */
  if (showSetup || !gameState) {
    return (
      <div className={styles.popupContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>MindSweeper</h1>
          <button
            className={styles.iconButton}
            onClick={handleOpenSettings}
            aria-label="Open settings"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
        <GameSetup onStartGame={handleStartNewGame} />
        <div className={styles.footer}>
          <button onClick={handleOpenFullPage} className={styles.linkButton}>
            <span>🔍</span>
            <span>Open Full Page</span>
          </button>
        </div>
      </div>
    );
  }

  /**
   * Render active game
   */
  const status: GameStatus = gameState.status;
  const cells: Cell[][] = gameState.board.cells;
  const totalMines = gameState.board.mines;
  const flaggedCount = totalMines - gameState.remainingFlags;
  
  // Determine if board needs scaling
  const needsScaling = boardScale < 1;
  const shouldShowFullPageButton = needsScaling || 
    gameState.board.rows > 16 || 
    gameState.board.cols > 16;

  return (
    <div className={styles.popupContainer}>
      {/* Header with title and settings */}
      <div className={styles.header}>
        <h1 className={styles.title}>MindSweeper</h1>
        <button
          className={styles.iconButton}
          onClick={handleOpenSettings}
          aria-label="Open settings"
          title="Settings"
        >
          ⚙️
        </button>
      </div>

      {/* Status Bar */}
      <StatusBar
        elapsedTime={elapsedTime}
        totalMines={totalMines}
        flaggedCount={flaggedCount}
      />

      {/* Game Board (scaled if necessary) */}
      <div 
        className={styles.boardContainer}
        style={needsScaling ? {
          transform: `scale(${boardScale})`,
          transformOrigin: 'top center',
        } : undefined}
      >
        <Board
          cells={cells}
          onReveal={handleRevealCell}
          onFlag={handleToggleFlag}
          onChord={handleChord}
          disabled={status === 'won' || status === 'lost'}
        />
      </div>

      {/* Controls */}
      <div className={styles.controlsSection}>
        <button onClick={handleNewGame} className={styles.actionButton}>
          New Game
        </button>
        <Controls
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={gameState.status === 'playing'}
          canRedo={false}
        />
      </div>

      {/* Full page link for large boards */}
      {shouldShowFullPageButton && (
        <div className={styles.footer}>
          <button onClick={handleOpenFullPage} className={styles.linkButton}>
            <span>🔍</span>
            <span>Open Full Page for Better Experience</span>
          </button>
        </div>
      )}

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
