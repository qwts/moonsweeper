import React, { useState, useRef, useEffect } from 'react';
import type { Cell as CellType } from '../types/game';
import { Cell } from './Cell';
import styles from '../styles/Board.module.css';

interface BoardProps {
  /** 2D array of cells [row][col] */
  cells: CellType[][];
  /** Callback when a cell is revealed */
  onReveal: (row: number, col: number) => void;
  /** Callback when a cell is flagged/unflagged */
  onFlag: (row: number, col: number) => void;
  /** Callback when chord operation is triggered */
  onChord: (row: number, col: number) => void;
  /** Whether the game is over (won/lost) */
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({
  cells,
  onReveal,
  onFlag,
  onChord,
  disabled,
}) => {
  const [focusedPosition, setFocusedPosition] = useState<{ row: number; col: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const rows = cells.length;
  const cols = rows > 0 ? cells[0].length : 0;

  // Set initial focus on mount or when cells change
  useEffect(() => {
    if (rows > 0 && cols > 0 && !focusedPosition) {
      setFocusedPosition({ row: 0, col: 0 });
    }
  }, [rows, cols, focusedPosition]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!focusedPosition || disabled) return;

    const { row, col } = focusedPosition;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (row > 0) {
          setFocusedPosition({ row: row - 1, col });
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (row < rows - 1) {
          setFocusedPosition({ row: row + 1, col });
        }
        break;

      case 'ArrowLeft':
        e.preventDefault();
        if (col > 0) {
          setFocusedPosition({ row, col: col - 1 });
        }
        break;

      case 'ArrowRight':
        e.preventDefault();
        if (col < cols - 1) {
          setFocusedPosition({ row, col: col + 1 });
        }
        break;

      case ' ':
      case 'Enter':
        e.preventDefault();
        onReveal(row, col);
        break;

      case 'f':
      case 'F':
        e.preventDefault();
        onFlag(row, col);
        break;

      case 'c':
      case 'C':
        e.preventDefault();
        onChord(row, col);
        break;

      default:
        break;
    }
  };

  // Handle click on board to set focus
  const handleBoardClick = () => {
    if (boardRef.current) {
      boardRef.current.focus();
    }
  };

  return (
    <div
      ref={boardRef}
      className={styles.board}
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
      onKeyDown={handleKeyDown}
      onClick={handleBoardClick}
      tabIndex={0}
      role="application"
      aria-label={`Minesweeper board with ${rows} rows and ${cols} columns`}
    >
      {cells.map((rowCells, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {rowCells.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              cell={cell}
              onClick={onReveal}
              onContextMenu={onFlag}
              onChord={onChord}
              isFocused={
                focusedPosition !== null &&
                focusedPosition.row === rowIndex &&
                focusedPosition.col === colIndex
              }
              disabled={disabled}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};
