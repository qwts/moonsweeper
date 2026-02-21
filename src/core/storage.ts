import { SerializedGameState } from '../types/game';
import { localStorage_, syncStorage, SyncSettings } from '../shared/chrome-storage';
import { HISTORY_CONFIG } from '../shared/constants';

/**
 * Storage wrapper for persisting game state.
 * 
 * Migrated to chrome.storage.local for Chrome extension integration with:
 * - Better performance (async I/O)
 * - Larger storage quota (10MB local)
 * - Settings sync across devices (100KB sync storage)
 * - Better extension lifecycle integration
 * 
 * @module storage
 */

/**
 * Saves the current game state to chrome.storage.local.
 * 
 * @param state - The serialized game state to save
 * @returns Promise that resolves when save is complete
 */
export async function saveGameState(state: SerializedGameState): Promise<void> {
  try {
    await localStorage_.set('currentGame', state);
  } catch (error) {
    console.error('Failed to save game state:', error);
    throw new Error('Failed to save game state to storage');
  }
}

/**
 * Loads the saved game state from chrome.storage.local.
 * 
 * @returns Promise that resolves with the saved game state, or null if none exists
 */
export async function loadGameState(): Promise<SerializedGameState | null> {
  try {
    const state = await localStorage_.get('currentGame');
    return state || null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

/**
 * Clears the saved game state from chrome.storage.local.
 * 
 * @returns Promise that resolves when clear is complete
 */
export async function clearGameState(): Promise<void> {
  try {
    await localStorage_.remove('currentGame');
  } catch (error) {
    console.error('Failed to clear game state:', error);
    throw new Error('Failed to clear game state from storage');
  }
}

/**
 * Game history entry
 */
export interface GameHistoryEntry {
  timestamp: number;
  config: SerializedGameState['config'];
  won: boolean;
  time: number;
}

/**
 * Saves a completed game to history.
 * 
 * @param entry - The game history entry to save
 */
export async function saveGameToHistory(entry: GameHistoryEntry): Promise<void> {
  try {
    const history = (await localStorage_.get('gameHistory')) || [];
    
    // Add new entry
    history.unshift(entry);
    
    // Trim history to max size
    const trimmedHistory = history.slice(0, HISTORY_CONFIG.MAX_HISTORY_GAMES);
    
    // Remove old entries (older than MAX_HISTORY_AGE_DAYS)
    const cutoffTime = Date.now() - (HISTORY_CONFIG.MAX_HISTORY_AGE_DAYS * 24 * 60 * 60 * 1000);
    const filteredHistory = trimmedHistory.filter(e => e.timestamp >= cutoffTime);
    
    await localStorage_.set('gameHistory', filteredHistory);
  } catch (error) {
    console.error('Failed to save game to history:', error);
    throw new Error('Failed to save game to history');
  }
}

/**
 * Gets the game history.
 * 
 * @returns Promise that resolves with the game history
 */
export async function getGameHistory(): Promise<GameHistoryEntry[]> {
  try {
    const history = await localStorage_.get('gameHistory');
    return history || [];
  } catch (error) {
    console.error('Failed to get game history:', error);
    return [];
  }
}

/**
 * Clears the game history.
 * 
 * @returns Promise that resolves when clear is complete
 */
export async function clearGameHistory(): Promise<void> {
  try {
    await localStorage_.remove('gameHistory');
  } catch (error) {
    console.error('Failed to clear game history:', error);
    throw new Error('Failed to clear game history');
  }
}

/**
 * Game statistics
 */
export interface GameStatistics {
  gamesPlayed: number;
  gamesWon: number;
  totalTime: number;
  bestTimes: Record<string, number>; // difficulty -> best time in seconds
}

/**
 * Gets the game statistics.
 * 
 * @returns Promise that resolves with the game statistics
 */
export async function getStatistics(): Promise<GameStatistics> {
  try {
    const stats = await localStorage_.get('statistics');
    return stats || {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTimes: {},
    };
  } catch (error) {
    console.error('Failed to get statistics:', error);
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      totalTime: 0,
      bestTimes: {},
    };
  }
}

/**
 * Updates game statistics after a game ends.
 * 
 * @param won - Whether the game was won
 * @param time - Time taken in seconds
 * @param difficulty - Difficulty level
 */
export async function updateStatistics(
  won: boolean,
  time: number,
  difficulty: string
): Promise<void> {
  try {
    const stats = await getStatistics();
    
    stats.gamesPlayed++;
    if (won) {
      stats.gamesWon++;
    }
    stats.totalTime += time;
    
    // Update best time for this difficulty if won
    if (won) {
      const currentBest = stats.bestTimes[difficulty];
      if (!currentBest || time < currentBest) {
        stats.bestTimes[difficulty] = time;
      }
    }
    
    await localStorage_.set('statistics', stats);
  } catch (error) {
    console.error('Failed to update statistics:', error);
    throw new Error('Failed to update statistics');
  }
}

/**
 * Clears all game statistics.
 * 
 * @returns Promise that resolves when clear is complete
 */
export async function clearStatistics(): Promise<void> {
  try {
    await localStorage_.remove('statistics');
  } catch (error) {
    console.error('Failed to clear statistics:', error);
    throw new Error('Failed to clear statistics');
  }
}

/**
 * Gets user settings from chrome.storage.sync.
 * 
 * @returns Promise that resolves with the settings
 */
export async function getSettings(): Promise<SyncSettings> {
  try {
    return await syncStorage.getAll();
  } catch (error) {
    console.error('Failed to get settings:', error);
    return {};
  }
}

/**
 * Saves user settings to chrome.storage.sync.
 * 
 * @param settings - The settings to save
 */
export async function saveSettings(settings: Partial<SyncSettings>): Promise<void> {
  try {
    // Save each setting individually
    for (const [key, value] of Object.entries(settings)) {
      await syncStorage.set(key as keyof SyncSettings, value);
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    throw new Error('Failed to save settings');
  }
}

/**
 * Gets storage usage information.
 * 
 * @returns Promise that resolves with bytes used and available
 */
export async function getStorageUsage(): Promise<{
  bytesInUse: number;
  percentUsed: number;
}> {
  try {
    const bytesInUse = await localStorage_.getBytesInUse();
    const quota = 10 * 1024 * 1024; // 10MB
    const percentUsed = (bytesInUse / quota) * 100;
    
    return { bytesInUse, percentUsed };
  } catch (error) {
    console.error('Failed to get storage usage:', error);
    return { bytesInUse: 0, percentUsed: 0 };
  }
}
