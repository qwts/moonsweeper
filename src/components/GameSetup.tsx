import React, { useState, useEffect } from 'react';
import { DIFFICULTY_PRESETS, validateCustomConfig, DifficultyLevel } from '../core/presets';
import { GameConfig } from '../types/game';

interface GameSetupProps {
  onStartGame: (config: GameConfig) => void;
  isGameActive?: boolean;
  currentConfig?: GameConfig;
  onNewGame?: () => void;
}

const STORAGE_KEY = 'mindsweeper_custom_config';

export const GameSetup: React.FC<GameSetupProps> = ({
  onStartGame,
  isGameActive = false,
  currentConfig,
  onNewGame,
}) => {
  const [mode, setMode] = useState<'preset' | 'custom'>('preset');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('medium');
  const [customRows, setCustomRows] = useState<number>(16);
  const [customCols, setCustomCols] = useState<number>(16);
  const [customMines, setCustomMines] = useState<number>(40);

  // Load saved custom config from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as {
          mode?: 'preset' | 'custom';
          selectedDifficulty?: DifficultyLevel;
          rows?: number;
          cols?: number;
          mines?: number;
        };

        if (parsed.mode === 'preset' || parsed.mode === 'custom') {
          setMode(parsed.mode);
        }

        if (
          parsed.selectedDifficulty === 'easy' ||
          parsed.selectedDifficulty === 'medium' ||
          parsed.selectedDifficulty === 'hard' ||
          parsed.selectedDifficulty === 'custom'
        ) {
          setSelectedDifficulty(parsed.selectedDifficulty);
        }

        if (typeof parsed.rows === 'number') {
          setCustomRows(parsed.rows);
        }
        if (typeof parsed.cols === 'number') {
          setCustomCols(parsed.cols);
        }
        if (typeof parsed.mines === 'number') {
          setCustomMines(parsed.mines);
        }
      }
    } catch (error) {
      console.error('Failed to load saved custom config:', error);
    }
  }, []);

  // Save setup selections to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode,
          selectedDifficulty,
          rows: customRows,
          cols: customCols,
          mines: customMines,
        })
      );
    } catch (error) {
      console.error('Failed to save custom config:', error);
    }
  }, [mode, selectedDifficulty, customRows, customCols, customMines]);

  const validation = mode === 'custom' 
    ? validateCustomConfig(customRows, customCols, customMines)
    : { valid: true };

  const handleStartGame = () => {
    const config: GameConfig = mode === 'preset'
      ? { ...DIFFICULTY_PRESETS[selectedDifficulty] }
      : { rows: customRows, cols: customCols, mines: customMines };
    
    onStartGame(config);
  };

  // If game is active, show current config with New Game button
  if (isGameActive && currentConfig) {
    return (
      <div className="game-setup active">
        <div className="current-config">
          <h3>Current Game</h3>
          <p>
            Grid: {currentConfig.rows} × {currentConfig.cols} | Mines: {currentConfig.mines}
          </p>
        </div>
        {onNewGame && (
          <button onClick={onNewGame} className="new-game-button">
            New Game
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="game-setup">
      <h2>Game Setup</h2>
      
      {/* Mode Selection */}
      <div className="mode-selector">
        <label>
          <input
            type="radio"
            name="mode"
            value="preset"
            checked={mode === 'preset'}
            onChange={() => setMode('preset')}
          />
          Preset Difficulty
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            value="custom"
            checked={mode === 'custom'}
            onChange={() => setMode('custom')}
          />
          Custom
        </label>
      </div>

      {/* Preset Difficulty Selection */}
      {mode === 'preset' && (
        <div className="preset-selector">
          <label>
            <input
              type="radio"
              name="difficulty"
              value="easy"
              checked={selectedDifficulty === 'easy'}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
            />
            Easy (9×9, 10 mines)
          </label>
          <label>
            <input
              type="radio"
              name="difficulty"
              value="medium"
              checked={selectedDifficulty === 'medium'}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
            />
            Medium (16×16, 40 mines)
          </label>
          <label>
            <input
              type="radio"
              name="difficulty"
              value="hard"
              checked={selectedDifficulty === 'hard'}
              onChange={(e) => setSelectedDifficulty(e.target.value as DifficultyLevel)}
            />
            Hard (30×16, 99 mines)
          </label>
        </div>
      )}

      {/* Custom Configuration */}
      {mode === 'custom' && (
        <div className="custom-config">
          <div className="input-group">
            <label htmlFor="rows">Rows (5-50):</label>
            <input
              id="rows"
              type="number"
              min="5"
              max="50"
              value={customRows}
              onChange={(e) => setCustomRows(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label htmlFor="cols">Columns (5-50):</label>
            <input
              id="cols"
              type="number"
              min="5"
              max="50"
              value={customCols}
              onChange={(e) => setCustomCols(Number(e.target.value))}
            />
          </div>
          <div className="input-group">
            <label htmlFor="mines">Mines:</label>
            <input
              id="mines"
              type="number"
              min="1"
              value={customMines}
              onChange={(e) => setCustomMines(Number(e.target.value))}
            />
          </div>
          
          {/* Validation Error Message */}
          {!validation.valid && (
            <div className="validation-error" role="alert">
              {validation.error}
            </div>
          )}
        </div>
      )}

      {/* Start Game Button */}
      <button
        className="start-game-button"
        onClick={handleStartGame}
        disabled={!validation.valid}
      >
        Start Game
      </button>

      <style>{`
        .game-setup {
          padding: 20px;
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          border-radius: 8px;
          max-width: 400px;
          margin: 0 auto;
        }

        .game-setup.active {
          text-align: center;
        }

        .game-setup h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 24px;
          color: var(--color-text-primary);
        }

        .current-config h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: var(--color-text-primary);
        }

        .current-config p {
          margin: 0 0 15px 0;
          font-size: 14px;
          color: var(--color-text-secondary);
        }

        .mode-selector {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .mode-selector label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          color: var(--color-text-primary);
        }

        .preset-selector {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }

        .preset-selector label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 8px;
          border-radius: 4px;
          color: var(--color-text-primary);
          transition: background-color 0.2s;
        }

        .preset-selector label:hover {
          background-color: var(--color-bg-tertiary);
        }

        .custom-config {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .input-group label {
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .input-group input[type="number"] {
          width: 100px;
          padding: 10px 12px;
          border: 1px solid var(--color-border-secondary);
          background-color: var(--color-bg-primary);
          color: var(--color-text-primary);
          border-radius: 4px;
          font-size: 14px;
          min-height: 44px;
          box-sizing: border-box;
        }

        .input-group input[type="number"]:focus {
          outline: none;
          border-color: var(--color-border-focus);
        }

        .validation-error {
          color: var(--color-text-primary);
          font-size: 14px;
          padding: 10px;
          background-color: var(--color-bg-secondary);
          border-radius: 4px;
          border-left: 3px solid var(--color-cell-mine);
        }

        .start-game-button,
        .new-game-button {
          width: 100%;
          padding: 12px 24px;
          background-color: var(--color-button-primary);
          color: var(--color-text-on-dark);
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
          min-height: 48px;
        }

        .start-game-button:hover:not(:disabled),
        .new-game-button:hover {
          background-color: var(--color-button-primary-hover);
        }

        .start-game-button:disabled {
          background-color: var(--color-button-disabled);
          color: var(--color-button-text-disabled);
          cursor: not-allowed;
          opacity: 0.6;
        }

        .new-game-button {
          background-color: var(--color-button-secondary);
        }

        .new-game-button:hover {
          background-color: var(--color-button-secondary-hover);
        }

        /* Responsive design for mobile */
        @media (max-width: 480px) {
          .game-setup {
            padding: 16px;
            max-width: 100%;
          }

          .game-setup h2 {
            font-size: 20px;
            margin-bottom: 16px;
          }

          .mode-selector {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .preset-selector {
            gap: 12px;
          }

          .preset-selector label,
          .mode-selector label {
            padding: 12px 14px;
            font-size: 15px;
            min-height: 48px;
            display: flex;
            align-items: center;
            width: 100%;
            box-sizing: border-box;
          }

          .input-group {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .input-group label {
            font-size: 14px;
          }

          .input-group input[type="number"] {
            width: 100%;
            font-size: 16px;
            padding: 12px;
          }

          .start-game-button,
          .new-game-button {
            font-size: 17px;
            min-height: 52px;
          }
        }

        /* Compact mode for popup context */
        @media (max-width: 400px) {
          .game-setup {
            padding: 12px;
          }

          .game-setup h2 {
            font-size: 18px;
            margin-bottom: 14px;
          }

          .mode-selector,
          .preset-selector,
          .custom-config {
            gap: 10px;
            margin-bottom: 14px;
          }

          .preset-selector label,
          .mode-selector label {
            font-size: 14px;
            padding: 10px 12px;
          }
        }

        /* Extra mobile breakpoints for better touch targets */
        @media (max-width: 375px) {
          .game-setup {
            padding: 10px;
          }

          .preset-selector label,
          .mode-selector label {
            min-height: 44px;
            font-size: 13px;
          }
        }

        @media (max-width: 320px) {
          .game-setup {
            padding: 8px;
          }

          .game-setup h2 {
            font-size: 16px;
          }

          .preset-selector label,
          .mode-selector label {
            padding: 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};
