
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
 * 
 * Only renders when status is 'won' or 'lost'.
 */
export function EndGameModal({ status, elapsedTime, onPlayAgain, onNewGame }: EndGameModalProps) {
  // Only show modal when game has ended
  if (status !== 'won' && status !== 'lost') {
    return null;
  }

  const isWin = status === 'won';
  const title = isWin ? 'You Win! 🎉' : 'Game Over 💣';
  
  // Format time as MM:SS
  const minutes = Math.floor(elapsedTime / 60);
  const seconds = elapsedTime % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <p className={styles.modalTime}>Time: {timeFormatted}</p>
        <div className={styles.modalButtons}>
          <button 
            className={styles.modalButton}
            onClick={onPlayAgain}
          >
            Play Again
          </button>
          <button 
            className={styles.modalButton}
            onClick={onNewGame}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
