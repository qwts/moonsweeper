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
        const { rows, cols, mines } = JSON.parse(saved);
        setCustomRows(rows);
        setCustomCols(cols);
        setCustomMines(mines);
      }
    } catch (error) {
      console.error('Failed to load saved custom config:', error);
    }
  }, []);

  // Save custom config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ rows: customRows, cols: customCols, mines: customMines })
      );
    } catch (error) {
      console.error('Failed to save custom config:', error);
    }
  }, [customRows, customCols, customMines]);

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
          background: #f5f5f5;
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
          color: #333;
        }

        .current-config h3 {
          margin: 0 0 10px 0;
          font-size: 18px;
          color: #333;
        }

        .current-config p {
          margin: 0 0 15px 0;
          font-size: 14px;
          color: #666;
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
          transition: background-color 0.2s;
        }

        .preset-selector label:hover {
          background-color: #e0e0e0;
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
          color: #333;
        }

        .input-group input[type="number"] {
          width: 100px;
          padding: 6px 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
        }

        .input-group input[type="number"]:focus {
          outline: none;
          border-color: #4CAF50;
        }

        .validation-error {
          color: #d32f2f;
          font-size: 14px;
          padding: 10px;
          background-color: #ffebee;
          border-radius: 4px;
          border-left: 3px solid #d32f2f;
        }

        .start-game-button,
        .new-game-button {
          width: 100%;
          padding: 12px 24px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .start-game-button:hover:not(:disabled),
        .new-game-button:hover {
          background-color: #45a049;
        }

        .start-game-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .new-game-button {
          background-color: #2196F3;
        }

        .new-game-button:hover {
          background-color: #1976D2;
        }
      `}</style>
    </div>
  );
};
