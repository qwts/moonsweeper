import React, { useState, useEffect, useRef } from 'react';
import type { Cell as CellType } from '../types/game';

interface CellProps {
  /** Row index */
  row: number;
  /** Column index */
  col: number;
  /** Cell data */
  cell: CellType;
  /** Click handler for reveal */
  onClick: (row: number, col: number) => void;
  /** Context menu handler for flag toggle */
  onContextMenu: (row: number, col: number) => void;
  /** Chord handler (middle-click or Ctrl+click) */
  onChord: (row: number, col: number) => void;
  /** Whether this cell is focused for keyboard navigation */
  isFocused: boolean;
  /** Whether interactions are disabled (game over) */
  disabled: boolean;
}

const LONG_PRESS_DURATION = 500; // 500ms for mobile long-press

export const Cell: React.FC<CellProps> = ({
  row,
  col,
  cell,
  onClick,
  onContextMenu,
  onChord,
  isFocused,
  disabled,
}) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);
  const [justFlagged, setJustFlagged] = useState(false);
  const prevFlaggedRef = useRef(cell.state === 'flagged');
  const chordTriggeredRef = useRef(false);

  // Cleanup long-press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Track flag state changes for animation
  useEffect(() => {
    const isFlagged = cell.state === 'flagged';
    const wasFlagged = prevFlaggedRef.current;
    
    // Only animate when transitioning from not-flagged to flagged
    if (isFlagged && !wasFlagged) {
      setJustFlagged(true);
      // Remove the animation class after animation completes
      const timer = setTimeout(() => setJustFlagged(false), 200);
      return () => clearTimeout(timer);
    }
    
    prevFlaggedRef.current = isFlagged;
  }, [cell.state]);

  // Handle click (reveal)
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    // Chord already handled in onMouseDown; ignore synthetic follow-up click
    if (chordTriggeredRef.current) {
      chordTriggeredRef.current = false;
      return;
    }

    // Left-click reveals
    if (e.button === 0) {
      onClick(row, col);
    }
  };

  // Handle context menu (right-click for flag)
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;

    // Chord already handled in onMouseDown; suppress context-menu flag toggle
    if (chordTriggeredRef.current) {
      chordTriggeredRef.current = false;
      return;
    }

    onContextMenu(row, col);
  };

  // Handle mouse down for chord detection (middle-click or Ctrl/Cmd+click)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;

    const isChordGesture = e.button === 1 || (e.button === 0 && (e.ctrlKey || e.metaKey));

    if (isChordGesture) {
      e.preventDefault();
      chordTriggeredRef.current = true;
      onChord(row, col);
    }
  };

  // Touch handlers for long-press detection (mobile flagging)
  const handleTouchStart = (_e: React.TouchEvent) => {
    if (disabled) return;
    
    setIsLongPressing(true);
    longPressTimerRef.current = window.setTimeout(() => {
      // Long-press detected - toggle flag
      onContextMenu(row, col);
      setIsLongPressing(false);
    }, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = (_e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If not a long-press, treat as click
    if (isLongPressing && !disabled) {
      onClick(row, col);
    }
    setIsLongPressing(false);
  };

  const handleTouchMove = () => {
    // Cancel long-press if finger moves
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      setIsLongPressing(false);
    }
  };

  // Generate CSS classes based on cell state
  const getClassName = () => {
    const classes = ['cell'];
    
    if (cell.state === 'hidden') {
      classes.push('cell-hidden');
    } else if (cell.state === 'revealed') {
      classes.push('cell-revealed');
      if (cell.isMine) {
        classes.push('cell-mine');
      } else if (cell.adjacentMines > 0) {
        classes.push(`cell-number-${cell.adjacentMines}`);
      }
    } else if (cell.state === 'flagged') {
      classes.push('cell-flagged');
      // Add animation class only when flag is just added
      if (justFlagged) {
        classes.push('flag-added');
      }
    }

    if (isFocused) {
      classes.push('cell-focused');
    }

    if (disabled) {
      classes.push('cell-disabled');
    }

    return classes.join(' ');
  };

  // Generate accessible label
  const getAriaLabel = () => {
    let label = `Cell at row ${row + 1}, column ${col + 1}. `;
    
    if (cell.state === 'flagged') {
      label += 'Flagged. ';
    } else if (cell.state === 'revealed') {
      if (cell.isMine) {
        label += 'Mine revealed. ';
      } else if (cell.adjacentMines > 0) {
        label += `${cell.adjacentMines} adjacent mine${cell.adjacentMines > 1 ? 's' : ''}. `;
      } else {
        label += 'No adjacent mines. ';
      }
    } else {
      label += 'Hidden. ';
    }

    return label;
  };

  // Get display content
  const getContent = () => {
    if (cell.state === 'flagged') {
      return '🚩';
    }
    if (cell.state === 'revealed') {
      if (cell.isMine) {
        return '💣';
      }
      if (cell.adjacentMines > 0) {
        return cell.adjacentMines;
      }
    }
    return '';
  };

  return (
    <button
      className={getClassName()}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      tabIndex={isFocused ? 0 : -1}
      aria-label={getAriaLabel()}
      disabled={disabled}
      type="button"
    >
      {getContent()}
    </button>
  );
};
