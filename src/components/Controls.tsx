import React, { useEffect } from 'react';
import styles from '../styles/Controls.module.css';

interface ControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+Z (or Cmd+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault();
        if (canUndo) {
          onUndo();
        }
      }
      
      // Check for Ctrl+Shift+Z or Ctrl+Y (or Cmd equivalents on Mac)
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        if (canRedo) {
          onRedo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, canUndo, canRedo]);

  return (
    <div className={styles.controls}>
      <button
        className={styles.controlButton}
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo last move (Ctrl+Z)"
        title="Undo (Ctrl+Z)"
      >
        <span className={styles.icon}>↶</span>
        <span className={styles.label}>Undo</span>
      </button>
      
      <button
        className={styles.controlButton}
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo last undone move (Ctrl+Shift+Z or Ctrl+Y)"
        title="Redo (Ctrl+Shift+Z or Ctrl+Y)"
      >
        <span className={styles.icon}>↷</span>
        <span className={styles.label}>Redo</span>
      </button>
    </div>
  );
};
