import { useEffect, useRef } from 'react';
import { GameStatus } from '../types/game';
import styles from '../styles/Game.module.css';

/**
 * Props for EndGameModal component
 */
interface EndGameModalProps {
  /** Current game status */
  status: GameStatus;
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Callback when "Play Again" is clicked */
  onPlayAgain: () => void;
  /** Callback when "New Game" is clicked */
  onNewGame: () => void;
}

/**
 * Modal overlay displayed when the game ends (win or loss).
 * 
 * Features:
 * - Shows win/loss message with emoji
 * - Displays elapsed time formatted as MM:SS
 * - Provides "Play Again" button (same config)
 * - Provides "New Game" button (return to setup)
 * - Backdrop prevents background interactions
 * - Focus trap keeps keyboard navigation within modal
 * - ARIA attributes for screen reader support
 * 
 * Only renders when status is 'won' or 'lost'.
 */
export function EndGameModal({ status, elapsedTime, onPlayAgain, onNewGame }: EndGameModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const playAgainButtonRef = useRef<HTMLButtonElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const isVisible = status === 'won' || status === 'lost';

  // Store the trigger element and set initial focus
  useEffect(() => {
    if (isVisible) {
      // Store the currently focused element to restore later
      triggerElementRef.current = document.activeElement as HTMLElement;
      
      // Focus the "Play Again" button when modal opens
      setTimeout(() => {
        playAgainButtonRef.current?.focus();
      }, 0);

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = '';
      
      // Restore focus to trigger element (if it still exists)
      if (triggerElementRef.current && document.body.contains(triggerElementRef.current)) {
        triggerElementRef.current.focus();
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Handle Escape key to close modal (triggers Play Again)
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onPlayAgain();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isVisible, onPlayAgain]);

  // Focus trap: cycle Tab/Shift+Tab within modal
  useEffect(() => {
    if (!isVisible || !modalRef.current) return;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: wrap from first to last
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: wrap from last to first
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isVisible]);

  // Only show modal when game has ended
  if (!isVisible) {
    return null;
  }

  const isWin = status === 'won';
  const title = isWin ? 'You Win! 🎉' : 'Game Over 💣';
  
  // Format time as MM:SS
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={styles.modalBackdrop} role="presentation">
      <div
        ref={modalRef}
        className={`${styles.modal} ${isWin ? styles.modalWin : styles.modalLoss}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="endgame-title"
        aria-describedby="endgame-time"
      >
        <h2 id="endgame-title" className={styles.modalTitle}>{title}</h2>
        <p id="endgame-time" className={styles.modalTime}>Time: {timeFormatted}</p>
        <div className={styles.modalButtons}>
          <button
            ref={playAgainButtonRef}
            className={styles.modalButton}
            onClick={onPlayAgain}
            aria-label="Play again with same settings"
          >
            Play Again
          </button>
          <button 
            className={styles.modalButton}
            onClick={onNewGame}
            aria-label="Start a new game with different settings"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
