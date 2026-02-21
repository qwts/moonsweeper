/**
 * Shared constants for storage keys, message types, and configuration values
 * 
 * Centralized location for all magic strings and configuration values
 * used across the extension (popup, options, background).
 * 
 * @module constants
 */

/**
 * Storage keys for chrome.storage.local (game data)
 */
export const STORAGE_KEYS = {
  // Current active game state
  CURRENT_GAME: 'currentGame',
  
  // Game history (recent games played)
  GAME_HISTORY: 'gameHistory',
  
  // Statistics (wins, losses, times, etc.)
  STATISTICS: 'statistics',
  
  // Legacy key for migration from localStorage
  LEGACY_GAME_STATE: 'mindsweeper_game_state',
} as const;

/**
 * Storage keys for chrome.storage.sync (settings)
 */
export const SETTINGS_KEYS = {
  // Current difficulty preset
  DIFFICULTY: 'difficulty',
  
  // Custom game configuration
  CUSTOM_CONFIG: 'customConfig',
  
  // UI theme
  THEME: 'theme',
  
  // Sound preferences
  SOUND_ENABLED: 'soundEnabled',
  SOUND_VOLUME: 'soundVolume',
} as const;

/**
 * Difficulty presets
 */
export const DIFFICULTY_PRESETS = {
  easy: {
    rows: 9,
    cols: 9,
    mines: 10,
    label: 'Easy',
    description: '9×9 grid, 10 mines',
  },
  medium: {
    rows: 16,
    cols: 16,
    mines: 40,
    label: 'Medium',
    description: '16×16 grid, 40 mines',
  },
  hard: {
    rows: 16,
    cols: 30,
    mines: 99,
    label: 'Hard',
    description: '16×30 grid, 99 mines',
  },
} as const;

/**
 * Grid constraints
 */
export const GRID_CONSTRAINTS = {
  MIN_ROWS: 5,
  MAX_ROWS: 50,
  MIN_COLS: 5,
  MAX_COLS: 50,
  MIN_MINES: 1,
  // Max mines is rows * cols - 1 (at least one safe cell must exist)
} as const;

/**
 * Timer configuration
 */
export const TIMER_CONFIG = {
  // Interval for chrome.alarms (in minutes, minimum 1)
  ALARM_INTERVAL_MINUTES: 1 / 60, // 1 second
  
  // Alarm name for timer
  TIMER_ALARM_NAME: 'gameTimer',
  
  // Auto-save alarm name
  AUTO_SAVE_ALARM_NAME: 'autoSave',
  
  // Auto-save interval (in minutes)
  AUTO_SAVE_INTERVAL_MINUTES: 5 / 60, // 5 seconds
} as const;

/**
 * Popup UI constraints
 */
export const POPUP_CONSTRAINTS = {
  // Maximum popup dimensions (Chrome limit is 800×600)
  MAX_WIDTH: 400,
  MAX_HEIGHT: 600,
  
  // Cell size for different grid sizes
  LARGE_CELL_SIZE: 30,
  MEDIUM_CELL_SIZE: 20,
  SMALL_CELL_SIZE: 15,
  
  // Threshold for switching to smaller cells
  MEDIUM_GRID_THRESHOLD: 16,
  SMALL_GRID_THRESHOLD: 24,
} as const;

/**
 * Storage quota limits (in bytes)
 */
export const STORAGE_LIMITS = {
  // chrome.storage.sync limit
  SYNC_QUOTA: 100 * 1024, // 100KB
  
  // chrome.storage.local limit
  LOCAL_QUOTA: 10 * 1024 * 1024, // 10MB
  
  // Warning threshold (80% of quota)
  WARNING_THRESHOLD: 0.8,
} as const;

/**
 * Game history limits
 */
export const HISTORY_CONFIG = {
  // Maximum number of games to keep in history
  MAX_HISTORY_GAMES: 100,
  
  // Maximum age of history entries (in days)
  MAX_HISTORY_AGE_DAYS: 90,
} as const;

/**
 * Extension pages
 */
export const EXTENSION_PAGES = {
  POPUP: 'src/popup/popup.html',
  OPTIONS: 'src/options/options.html',
  FULL_PAGE: 'index.html',
} as const;

/**
 * Default settings values
 */
export const DEFAULT_SETTINGS = {
  difficulty: 'medium' as const,
  theme: 'light' as const,
  soundEnabled: false,
  soundVolume: 0.5,
  animationsEnabled: true,
} as const;

/**
 * Animation durations (in milliseconds)
 */
export const ANIMATION_DURATIONS = {
  CELL_REVEAL: 100,
  FLAG_TOGGLE: 150,
  EXPLOSION: 300,
  WIN_CELEBRATION: 500,
} as const;

/**
 * Keyboard shortcuts
 */
export const KEYBOARD_SHORTCUTS = {
  UNDO: ['z', 'cmd+z', 'ctrl+z'],
  REDO: ['y', 'cmd+shift+z', 'ctrl+y'],
  NEW_GAME: ['n'],
  RESET: ['r'],
  TOGGLE_FLAG: ['f', 'space'],
} as const;

/**
 * Accessibility settings
 */
export const A11Y_CONFIG = {
  // Minimum touch target size (in pixels)
  MIN_TOUCH_TARGET: 44,
  
  // Focus visible outline width
  FOCUS_OUTLINE_WIDTH: 2,
  
  // Screen reader announcement debounce (ms)
  ANNOUNCEMENT_DEBOUNCE: 300,
} as const;
