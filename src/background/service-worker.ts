/**
 * Background service worker for MindSweeper Chrome extension
 * 
 * Manages game state, timer, and message passing between popup/options pages.
 * Uses chrome.alarms API for timer and chrome.storage for persistence.
 * 
 * Architecture:
 * - GameManager: Manages GameState instance and operations
 * - TimerManager: Handles timer via chrome.alarms
 * - MessageHandlers: Routes messages from popup/options
 * 
 * Key features:
 * - Persistent game state across popup sessions
 * - Timer continues in background
 * - Auto-save every 5s during active play
 * - Support for pause/resume, undo/redo
 * 
 * @module service-worker
 */

import { getGameManager } from './game-manager';
import { getTimerManager } from './timer-manager';
import { handleMessage } from './message-handlers';
import { TIMER_CONFIG, DEFAULT_SETTINGS } from '../shared/constants';

console.log('[ServiceWorker] MindSweeper service worker starting...');

/**
 * Initialize managers on service worker startup
 */
async function initialize(): Promise<void> {
  try {
    console.log('[ServiceWorker] Initializing managers...');
    
    // Initialize game manager (restores saved game if exists)
    const gameManager = getGameManager();
    await gameManager.initialize();
    
    // Initialize timer manager (starts timer if game in progress)
    const timerManager = getTimerManager();
    await timerManager.initialize();
    
    console.log('[ServiceWorker] Initialization complete');
  } catch (error) {
    console.error('[ServiceWorker] Initialization failed:', error);
  }
}

/**
 * Install event - first time extension is installed
 */
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[ServiceWorker] Extension installed:', details.reason);
  
  if (details.reason === 'install') {
    // First install - set up default settings
    try {
      await chrome.storage.sync.set(DEFAULT_SETTINGS);
      console.log('[ServiceWorker] Default settings initialized');
    } catch (error) {
      console.error('[ServiceWorker] Failed to set default settings:', error);
    }
  } else if (details.reason === 'update') {
    // Extension updated - reinitialize managers
    await initialize();
  }
  
  // Always initialize on install/update
  await initialize();
});

/**
 * Service worker startup - restore state
 */
chrome.runtime.onStartup.addListener(async () => {
  console.log('[ServiceWorker] Chrome startup detected');
  await initialize();
});

/**
 * Message handler - route messages from popup/options
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Route to message handler
  return handleMessage(message, sender, sendResponse);
});

/**
 * Alarm handler - for timer and auto-save
 */
chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('[ServiceWorker] Alarm triggered:', alarm.name);
  
  const gameManager = getGameManager();
  const timerManager = getTimerManager();
  
  if (alarm.name === TIMER_CONFIG.TIMER_ALARM_NAME) {
    // Timer tick - update UI
    timerManager.handleTick();
  } else if (alarm.name === TIMER_CONFIG.AUTO_SAVE_ALARM_NAME) {
    // Auto-save tick - save game state
    await gameManager.handleAutoSave();
  }
});

/**
 * Service worker suspension - cleanup
 */
self.addEventListener('beforeunload', async () => {
  console.log('[ServiceWorker] Service worker suspending, cleaning up...');
  
  try {
    const gameManager = getGameManager();
    const timerManager = getTimerManager();
    
    await gameManager.cleanup();
    await timerManager.cleanup();
  } catch (error) {
    console.error('[ServiceWorker] Cleanup failed:', error);
  }
});

// Initialize on service worker load
initialize();

console.log('[ServiceWorker] MindSweeper service worker ready');
