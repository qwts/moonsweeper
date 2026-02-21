/**
 * Options page component for MindSweeper extension
 * 
 * Provides settings UI for:
 * - Difficulty presets (Easy, Medium, Hard, Custom)
 * - Custom game configuration
 * - Theme selection (Light, Dark, Colorblind, System)
 * - Sound preferences (placeholder for Section 3)
 * - Statistics viewer (placeholder for future)
 */
import React, { useState, useEffect } from 'react';
import { MessageType, UpdateSettingsMessage } from '../shared/message-types';
import { SyncSettings } from '../shared/chrome-storage';
import { DIFFICULTY_PRESETS, GRID_CONSTRAINTS } from '../shared/constants';
import { validateCustomConfig } from '../core/presets';
import { useTheme, type ThemeSetting } from '../hooks/useTheme';
import styles from './options.module.css';

type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'custom';

export const Options: React.FC = () => {
  const [settings, setSettings] = useState<SyncSettings>({
    difficulty: 'medium',
    theme: 'light',
    soundEnabled: false,
    soundVolume: 0.5,
  });
  const [customConfig, setCustomConfig] = useState({
    rows: 16,
    cols: 16,
    mines: 40,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Initialize theme system with live preview
  const { themeSetting, setTheme } = useTheme();

  // Load settings from background on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: MessageType.GET_SETTINGS,
          timestamp: Date.now(),
        });

        if (response.success && response.settings) {
          setSettings(response.settings);
          if (response.settings.customConfig) {
            setCustomConfig(response.settings.customConfig);
          }
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to background with debouncing
  const saveSettings = async (newSettings: Partial<SyncSettings>) => {
    setIsSaving(true);
    setSaveStatus('saving');
    setError(null);

    try {
      const message: UpdateSettingsMessage = {
        type: MessageType.UPDATE_SETTINGS,
        timestamp: Date.now(),
        settings: newSettings,
      };

      const response = await chrome.runtime.sendMessage(message);

      if (response.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error(response.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings');
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle difficulty preset change
  const handleDifficultyChange = async (difficulty: DifficultyLevel) => {
    const newSettings = { ...settings, difficulty };
    setSettings(newSettings);
    await saveSettings({ difficulty });
  };

  // Handle custom config change
  const handleCustomConfigChange = (field: 'rows' | 'cols' | 'mines', value: number) => {
    const newConfig = { ...customConfig, [field]: value };
    setCustomConfig(newConfig);

    // Auto-switch to custom difficulty if not already
    if (settings.difficulty !== 'custom') {
      setSettings({ ...settings, difficulty: 'custom' });
    }
  };

  // Apply custom config
  const handleApplyCustomConfig = async () => {
    const validation = validateCustomConfig(customConfig.rows, customConfig.cols, customConfig.mines);
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid configuration');
      return;
    }

    const newSettings = {
      difficulty: 'custom' as DifficultyLevel,
      customConfig,
    };
    
    setSettings({ ...settings, ...newSettings });
    await saveSettings(newSettings);
  };

  // Handle theme change (placeholder for Section 3)
  const handleThemeChange = async (newTheme: ThemeSetting) => {
    // Update theme immediately for live preview
    await setTheme(newTheme);
    
    // Optionally persist to general settings (theme is already persisted by setTheme)
    const newSettings = { ...settings, theme: newTheme === 'system' ? 'light' : newTheme };
    setSettings(newSettings);
  };

  // Handle sound settings change (placeholder for Section 3)
  const handleSoundEnabledChange = async (enabled: boolean) => {
    const newSettings = { ...settings, soundEnabled: enabled };
    setSettings(newSettings);
    await saveSettings({ soundEnabled: enabled });
  };

  const handleSoundVolumeChange = async (volume: number) => {
    const newSettings = { ...settings, soundVolume: volume };
    setSettings(newSettings);
    await saveSettings({ soundVolume: volume });
  };

  // Validate custom config
  const customValidation = validateCustomConfig(customConfig.rows, customConfig.cols, customConfig.mines);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>MindSweeper Settings</h1>
        {saveStatus === 'saved' && (
          <div className={styles.saveIndicator}>✓ Saved</div>
        )}
        {saveStatus === 'saving' && (
          <div className={styles.saveIndicator}>Saving...</div>
        )}
      </header>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className={styles.closeError}>×</button>
        </div>
      )}

      <main className={styles.main}>
        {/* Difficulty Settings */}
        <section className={styles.section}>
          <h2>Difficulty</h2>
          <p className={styles.description}>
            Choose a preset difficulty or customize your own game settings.
          </p>

          <div className={styles.presets}>
            {Object.entries(DIFFICULTY_PRESETS).map(([key, preset]) => (
              <label key={key} className={styles.presetCard}>
                <input
                  type="radio"
                  name="difficulty"
                  value={key}
                  checked={settings.difficulty === key}
                  onChange={() => handleDifficultyChange(key as DifficultyLevel)}
                  className={styles.radio}
                />
                <div className={styles.presetContent}>
                  <h3>{preset.label}</h3>
                  <p>{preset.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Custom Configuration */}
          <div className={styles.customConfig}>
            <label className={styles.presetCard}>
              <input
                type="radio"
                name="difficulty"
                value="custom"
                checked={settings.difficulty === 'custom'}
                onChange={() => handleDifficultyChange('custom')}
                className={styles.radio}
              />
              <div className={styles.presetContent}>
                <h3>Custom</h3>
                <p>Set your own grid size and mine count</p>
              </div>
            </label>

            {settings.difficulty === 'custom' && (
              <div className={styles.customControls}>
                <div className={styles.inputGroup}>
                  <label htmlFor="rows">
                    Rows ({GRID_CONSTRAINTS.MIN_ROWS}–{GRID_CONSTRAINTS.MAX_ROWS})
                  </label>
                  <input
                    id="rows"
                    type="number"
                    min={GRID_CONSTRAINTS.MIN_ROWS}
                    max={GRID_CONSTRAINTS.MAX_ROWS}
                    value={customConfig.rows}
                    onChange={(e) => handleCustomConfigChange('rows', parseInt(e.target.value, 10))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="cols">
                    Columns ({GRID_CONSTRAINTS.MIN_COLS}–{GRID_CONSTRAINTS.MAX_COLS})
                  </label>
                  <input
                    id="cols"
                    type="number"
                    min={GRID_CONSTRAINTS.MIN_COLS}
                    max={GRID_CONSTRAINTS.MAX_COLS}
                    value={customConfig.cols}
                    onChange={(e) => handleCustomConfigChange('cols', parseInt(e.target.value, 10))}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="mines">
                    Mines ({GRID_CONSTRAINTS.MIN_MINES}–{customConfig.rows * customConfig.cols - 1})
                  </label>
                  <input
                    id="mines"
                    type="number"
                    min={GRID_CONSTRAINTS.MIN_MINES}
                    max={customConfig.rows * customConfig.cols - 1}
                    value={customConfig.mines}
                    onChange={(e) => handleCustomConfigChange('mines', parseInt(e.target.value, 10))}
                    className={styles.input}
                  />
                </div>

                {!customValidation.valid && customValidation.error && (
                  <div className={styles.validationError}>{customValidation.error}</div>
                )}

                <button
                  onClick={handleApplyCustomConfig}
                  disabled={!customValidation.valid || isSaving}
                  className={styles.applyButton}
                >
                  Apply Custom Settings
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Theme Settings */}
        <section className={styles.section}>
          <h2>Theme</h2>
          <p className={styles.description}>
            Choose your preferred visual theme. Changes apply immediately.
          </p>

          <div className={styles.themeOptions}>
            <label className={styles.themeCard}>
              <input
                type="radio"
                name="theme"
                value="system"
                checked={themeSetting === 'system'}
                onChange={() => handleThemeChange('system')}
                className={styles.radio}
              />
              <div className={styles.themeContent}>
                <h3>System Default</h3>
                <p>Follow your system preference</p>
              </div>
            </label>

            <label className={styles.themeCard}>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={themeSetting === 'light'}
                onChange={() => handleThemeChange('light')}
                className={styles.radio}
              />
              <div className={styles.themeContent}>
                <h3>Light</h3>
                <p>Default light theme</p>
              </div>
            </label>

            <label className={styles.themeCard}>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={themeSetting === 'dark'}
                onChange={() => handleThemeChange('dark')}
                className={styles.radio}
              />
              <div className={styles.themeContent}>
                <h3>Dark</h3>
                <p>Easy on the eyes</p>
              </div>
            </label>

            <label className={styles.themeCard}>
              <input
                type="radio"
                name="theme"
                value="colorblind"
                checked={themeSetting === 'colorblind'}
                onChange={() => handleThemeChange('colorblind')}
                className={styles.radio}
              />
              <div className={styles.themeContent}>
                <h3>Color-Blind Friendly</h3>
                <p>Optimized for color vision deficiency</p>
              </div>
            </label>
          </div>
        </section>

        {/* Sound Settings (Placeholder for Section 3) */}
        <section className={styles.section}>
          <h2>Sound</h2>
          <p className={styles.description}>
            Configure sound effects and volume.
            <span className={styles.comingSoon}>Coming soon in Section 3</span>
          </p>

          <div className={styles.soundControls}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={settings.soundEnabled || false}
                onChange={(e) => handleSoundEnabledChange(e.target.checked)}
                disabled
              />
              <span>Enable sound effects</span>
            </label>

            <div className={styles.inputGroup}>
              <label htmlFor="volume">
                Volume
              </label>
              <input
                id="volume"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={settings.soundVolume || 0.5}
                onChange={(e) => handleSoundVolumeChange(parseFloat(e.target.value))}
                disabled={!settings.soundEnabled}
                className={styles.slider}
              />
              <span className={styles.volumeDisplay}>
                {Math.round((settings.soundVolume || 0.5) * 100)}%
              </span>
            </div>
          </div>
        </section>

        {/* Statistics (Placeholder for future) */}
        <section className={styles.section}>
          <h2>Statistics</h2>
          <p className={styles.description}>
            View your game statistics and performance.
            <span className={styles.comingSoon}>Coming in a future update</span>
          </p>

          <div className={styles.statsPlaceholder}>
            <p>📊 Game statistics tracking will be available soon, including:</p>
            <ul>
              <li>Total games played</li>
              <li>Win rate by difficulty</li>
              <li>Best times</li>
              <li>Current streak</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>MindSweeper v1.0 - A modern Minesweeper clone</p>
        <p>
          <a href="/index.html" target="_blank" rel="noopener noreferrer">
            Open full page
          </a>
        </p>
      </footer>
    </div>
  );
};
