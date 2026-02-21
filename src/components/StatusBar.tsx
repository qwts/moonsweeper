import React from 'react';
import styles from '../styles/Board.module.css';

interface StatusBarProps {
  /** Elapsed time in seconds */
  elapsedTime: number;
  /** Total number of mines on the board */
  totalMines: number;
  /** Number of cells currently flagged */
  flaggedCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  elapsedTime,
  totalMines,
  flaggedCount,
}) => {
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining mines (can be negative if over-flagged)
  const remainingMines = totalMines - flaggedCount;

  return (
    <div className={styles.statusBar} role="status" aria-live="polite">
      <div className={styles.statusItem}>
        <span className={styles.statusLabel}>Mines:</span>
        <span 
          className={styles.statusValue}
          aria-label={`${remainingMines} mines remaining`}
        >
          {remainingMines}
        </span>
      </div>
      
      <div className={styles.statusItem}>
        <span className={styles.statusLabel}>Time:</span>
        <span 
          className={styles.statusValue}
          aria-label={`${elapsedTime} seconds elapsed`}
        >
          {formatTime(elapsedTime)}
        </span>
      </div>
    </div>
  );
};
