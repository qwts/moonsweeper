import React, { useEffect, useRef, useState } from 'react';
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
  const [announcement, setAnnouncement] = useState<string>('');
  const announcementTimeoutRef = useRef<number | null>(null);
  const debounceTimeoutRef = useRef<number | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate remaining mines (can be negative if over-flagged)
  const remainingMines = totalMines - flaggedCount;

  /**
   * Announce a message to screen readers with debouncing.
   * Clears previous announcement after 3 seconds.
   */
  const announce = (message: string, debounce = 300) => {
    // Clear existing timeouts
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    if (announcementTimeoutRef.current) {
      clearTimeout(announcementTimeoutRef.current);
    }

    // Debounce rapid announcements
    debounceTimeoutRef.current = window.setTimeout(() => {
      setAnnouncement(message);
      
      // Clear announcement after 3 seconds to prevent stale reads
      announcementTimeoutRef.current = window.setTimeout(() => {
        setAnnouncement('');
      }, 3000);
    }, debounce);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (announcementTimeoutRef.current) {
        clearTimeout(announcementTimeoutRef.current);
      }
    };
  }, []);

  // Expose announce function to parent components via callback ref pattern
  // This allows Game.tsx to trigger announcements for multi-cell reveals
  useEffect(() => {
    // Store announce function globally for access from other components
    (window as any).__statusBarAnnounce = announce;
    
    return () => {
      delete (window as any).__statusBarAnnounce;
    };
  }, []);

  return (
    <>
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

      {/* Hidden live region for dynamic announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0'
        }}
      >
        {announcement}
      </div>

      {/* Hidden live region for urgent announcements (win/loss) */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0'
        }}
      >
        {/* Will be used for critical game state changes */}
      </div>
    </>
  );
};
