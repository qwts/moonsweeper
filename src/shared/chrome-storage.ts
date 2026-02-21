/**
 * Chrome storage wrappers with fallback to localStorage for development
 * 
 * Provides async wrappers for chrome.storage.sync (settings, max 100KB) 
 * and chrome.storage.local (game data, max 10MB) with error handling,
 * quota checks, and localStorage fallback for non-extension environments.
 * 
 * @module chrome-storage
 */

import { SerializedGameState } from '../types/game';

/**
 * Check if we're running in a Chrome extension environment
 */
const isExtension = (): boolean => {
  return typeof chrome !== 'undefined' && 
         chrome.storage !== undefined;
};

/**
 * Settings stored in chrome.storage.sync (cross-device, 100KB limit)
 */
export interface SyncSettings {
  difficulty?: 'easy' | 'medium' | 'hard' | 'custom';
  customConfig?: {
    rows: number;
    cols: number;
    mines: number;
  };
  theme?: 'light' | 'dark' | 'colorblind' | 'system';
  soundEnabled?: boolean;
  soundVolume?: number;
  animationsEnabled?: boolean;
}

/**
 * Game data stored in chrome.storage.local (device-specific, 10MB limit)
 */
export interface LocalGameData {
  currentGame?: SerializedGameState;
  gameHistory?: Array<{
    timestamp: number;
    config: SerializedGameState['config'];
    won: boolean;
    time: number;
  }>;
  statistics?: {
    gamesPlayed: number;
    gamesWon: number;
    totalTime: number;
    bestTimes: Record<string, number>; // difficulty -> best time
  };
}

/**
 * Chrome.storage.sync wrapper for settings
 */
export const syncStorage = {
  /**
   * Get settings from chrome.storage.sync with fallback to localStorage
   */
  async get<K extends keyof SyncSettings>(
    key: K
  ): Promise<SyncSettings[K] | undefined> {
    if (isExtension()) {
      try {
        const result = await chrome.storage.sync.get(key);
        return result[key] as SyncSettings[K];
      } catch (error) {
        console.error(`Failed to get ${key} from chrome.storage.sync:`, error);
        return undefined;
      }
    } else {
      // Fallback to localStorage for development
      try {
        const value = localStorage.getItem(`sync_${key}`);
        return value ? JSON.parse(value) : undefined;
      } catch (error) {
        console.error(`Failed to get ${key} from localStorage:`, error);
        return undefined;
      }
    }
  },

  /**
   * Get all settings from chrome.storage.sync
   */
  async getAll(): Promise<SyncSettings> {
    if (isExtension()) {
      try {
        const result = await chrome.storage.sync.get(null);
        return result as SyncSettings;
      } catch (error) {
        console.error('Failed to get all from chrome.storage.sync:', error);
        return {};
      }
    } else {
      // Fallback to localStorage for development
      const settings: SyncSettings = {};
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('sync_'));
        for (const key of keys) {
          const realKey = key.replace('sync_', '') as keyof SyncSettings;
          const value = localStorage.getItem(key);
          if (value) {
            settings[realKey] = JSON.parse(value) as any;
          }
        }
      } catch (error) {
        console.error('Failed to get all from localStorage:', error);
      }
      return settings;
    }
  },

  /**
   * Set a setting in chrome.storage.sync with quota check
   */
  async set<K extends keyof SyncSettings>(
    key: K,
    value: SyncSettings[K]
  ): Promise<void> {
    if (isExtension()) {
      try {
        // Check quota before setting (100KB limit for sync)
        const data = { [key]: value };
        const size = new Blob([JSON.stringify(data)]).size;
        
        if (size > 100 * 1024) {
          throw new Error(`Data size (${size} bytes) exceeds chrome.storage.sync quota (100KB)`);
        }

        await chrome.storage.sync.set(data);
      } catch (error) {
        console.error(`Failed to set ${key} in chrome.storage.sync:`, error);
        throw error;
      }
    } else {
      // Fallback to localStorage for development
      try {
        localStorage.setItem(`sync_${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to set ${key} in localStorage:`, error);
        throw error;
      }
    }
  },

  /**
   * Remove a setting from chrome.storage.sync
   */
  async remove<K extends keyof SyncSettings>(key: K): Promise<void> {
    if (isExtension()) {
      try {
        await chrome.storage.sync.remove(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from chrome.storage.sync:`, error);
        throw error;
      }
    } else {
      // Fallback to localStorage for development
      try {
        localStorage.removeItem(`sync_${key}`);
      } catch (error) {
        console.error(`Failed to remove ${key} from localStorage:`, error);
        throw error;
      }
    }
  },

  /**
   * Clear all settings from chrome.storage.sync
   */
  async clear(): Promise<void> {
    if (isExtension()) {
      try {
        await chrome.storage.sync.clear();
      } catch (error) {
        console.error('Failed to clear chrome.storage.sync:', error);
        throw error;
      }
    } else {
      // Fallback to localStorage for development
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('sync_'));
        for (const key of keys) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Failed to clear localStorage sync items:', error);
        throw error;
      }
    }
  }
};

/**
 * Chrome.storage.local wrapper for game data
 */
export const localStorage_ = {
  /**
   * Get game data from chrome.storage.local with fallback to localStorage
   */
  async get<K extends keyof LocalGameData>(
    key: K
  ): Promise<LocalGameData[K] | undefined> {
    if (isExtension()) {
      try {
        const result = await chrome.storage.local.get(key);
        return result[key] as LocalGameData[K];
      } catch (error) {
        console.error(`Failed to get ${key} from chrome.storage.local:`, error);
        return undefined;
      }
    } else {
      // Fallback to localStorage for development
      try {
        const value = localStorage.getItem(`local_${key}`);
        return value ? JSON.parse(value) : undefined;
      } catch (error) {
        console.error(`Failed to get ${key} from localStorage:`, error);
        return undefined;
      }
    }
  },

  /**
   * Get all game data from chrome.storage.local
   */
  async getAll(): Promise<LocalGameData> {
    if (isExtension()) {
      try {
        const result = await chrome.storage.local.get(null);
        return result as LocalGameData;
      } catch (error) {
        console.error('Failed to get all from chrome.storage.local:', error);
        return {};
      }
    } else {
      // Fallback to localStorage for development
      const gameData: LocalGameData = {};
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('local_'));
        for (const key of keys) {
          const realKey = key.replace('local_', '') as keyof LocalGameData;
          const value = localStorage.getItem(key);
          if (value) {
            gameData[realKey] = JSON.parse(value) as any;
          }
        }
      } catch (error) {
        console.error('Failed to get all from localStorage:', error);
      }
      return gameData;
    }
  },

  /**
   * Set game data in chrome.storage.local with quota check
   */
  async set<K extends keyof LocalGameData>(
    key: K,
    value: LocalGameData[K]
  ): Promise<void> {
    if (isExtension()) {
      try {
        // Check quota before setting (10MB limit for local)
        const data = { [key]: value };
        const size = new Blob([JSON.stringify(data)]).size;
        
        if (size > 10 * 1024 * 1024) {
          throw new Error(`Data size (${size} bytes) exceeds chrome.storage.local quota (10MB)`);
        }

        await chrome.storage.local.set(data);
      } catch (error) {
        console.error(`Failed to set ${key} in chrome.storage.local:`, error);
        throw error;
      }
    } else {
      // Fallback to localStorage for development
      try {
        localStorage.setItem(`local_${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Failed to set ${key} in localStorage:`, error);
        throw error;
      }
    }
  },

  /**
   * Remove game data from chrome.storage.local
   */
  async remove<K extends keyof LocalGameData>(key: K): Promise<void> {
    if (isExtension()) {
      try {
        await chrome.storage.local.remove(key);
      } catch (error) {
        console.error(`Failed to remove ${key} from chrome.storage.local:`, error);
        throw error;
      }
    } else {
      // Fallback to localStorage for development
      try {
        localStorage.removeItem(`local_${key}`);
      } catch (error) {
        console.error(`Failed to remove ${key} from localStorage:`, error);
        throw error;
      }
    }
  },

  /**
   * Clear all game data from chrome.storage.local
   */
  async clear(): Promise<void> {
    if (isExtension()) {
      try {
        await chrome.storage.local.clear();
      } catch (error) {
        console.error('Failed to clear chrome.storage.local:', error);
        throw error;
      }
    } else {
      // Fallback to localStorage for development
      try {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('local_'));
        for (const key of keys) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        console.error('Failed to clear localStorage local items:', error);
        throw error;
      }
    }
  },

  /**
   * Get current storage usage information (Chrome extension only)
   */
  async getBytesInUse(): Promise<number> {
    if (isExtension() && chrome.storage.local.getBytesInUse) {
      try {
        return await chrome.storage.local.getBytesInUse(null);
      } catch (error) {
        console.error('Failed to get bytes in use:', error);
        return 0;
      }
    }
    return 0;
  }
};
