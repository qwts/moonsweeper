/**
 * Timer Manager for Background Service Worker
 * 
 * Manages the game timer using chrome.alarms API for efficiency and
 * service worker compatibility. Broadcasts timer updates to connected UI.
 * 
 * Key responsibilities:
 * - Maintain timer using chrome.alarms (1s interval)
 * - Track elapsed time via GameManager
 * - Broadcast timer updates to popup/options pages
 * - Handle start/stop/pause/resume timer lifecycle
 * - Coordinate with GameManager for game state
 * 
 * Why chrome.alarms?
 * - Service workers can be suspended, setInterval unreliable
 * - chrome.alarms wake up service worker when needed
 * - More battery efficient than constant JavaScript timers
 * 
 * @module timer-manager
 */

import { TIMER_CONFIG } from '../shared/constants';
import { MessageType } from '../shared/message-types';
import { getGameManager } from './game-manager';

/**
 * Timer manager singleton class
 */
export class TimerManager {
  /** Whether timer is currently active */
  private isActive = false;
  
  /** Last broadcast elapsed time (for change detection) */
  private lastBroadcastTime = -1;
  
  /** Singleton instance */
  private static instance: TimerManager | null = null;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  static getInstance(): TimerManager {
    if (!TimerManager.instance) {
      TimerManager.instance = new TimerManager();
    }
    return TimerManager.instance;
  }
  
  /**
   * Initialize timer manager
   */
  async initialize(): Promise<void> {
    console.log('[TimerManager] Initializing...');
    
    // Check if there's an active game that needs timer
    const gameManager = getGameManager();
    const state = gameManager.getGameState();
    
    if (state && state.status === 'playing') {
      console.log('[TimerManager] Active game found, starting timer');
      await this.start();
    }
    
    console.log('[TimerManager] Initialized successfully');
  }
  
  /**
   * Start the timer alarm
   */
  async start(): Promise<void> {
    if (this.isActive) {
      console.log('[TimerManager] Timer already active');
      return;
    }
    
    try {
      // Create periodic alarm that fires every second
      await chrome.alarms.create(TIMER_CONFIG.TIMER_ALARM_NAME, {
        periodInMinutes: TIMER_CONFIG.ALARM_INTERVAL_MINUTES,
      });
      
      this.isActive = true;
      console.log('[TimerManager] Timer started');
      
      // Broadcast initial time immediately
      this.broadcastTimerUpdate();
    } catch (error) {
      console.error('[TimerManager] Failed to start timer:', error);
    }
  }
  
  /**
   * Stop the timer alarm
   */
  async stop(): Promise<void> {
    if (!this.isActive) {
      return;
    }
    
    try {
      await chrome.alarms.clear(TIMER_CONFIG.TIMER_ALARM_NAME);
      this.isActive = false;
      this.lastBroadcastTime = -1;
      console.log('[TimerManager] Timer stopped');
    } catch (error) {
      console.error('[TimerManager] Failed to stop timer:', error);
    }
  }
  
  /**
   * Handle timer alarm tick
   * Called every second when timer is active
   */
  handleTick(): void {
    const gameManager = getGameManager();
    const state = gameManager.getGameState();
    
    // Stop timer if no game or game not in progress
    if (!state || state.status !== 'playing') {
      this.stop();
      return;
    }
    
    // Broadcast timer update
    this.broadcastTimerUpdate();
  }
  
  /**
   * Broadcast timer update to connected UI
   */
  private broadcastTimerUpdate(): void {
    const gameManager = getGameManager();
    const elapsedTime = gameManager.getElapsedTime();
    
    // Only broadcast if time has changed (to reduce message overhead)
    if (elapsedTime === this.lastBroadcastTime) {
      return;
    }
    
    this.lastBroadcastTime = elapsedTime;
    
    // Send message to all tabs/windows with open popup/options
    chrome.runtime.sendMessage({
      type: MessageType.TIMER_UPDATE,
      timestamp: Date.now(),
      elapsedTime,
    }).catch(() => {
      // Ignore errors if no listeners (popup/options closed)
      // This is expected and normal behavior
    });
  }
  
  /**
   * Pause timer (game paused)
   */
  async pause(): Promise<void> {
    await this.stop();
  }
  
  /**
   * Resume timer (game resumed)
   */
  async resume(): Promise<void> {
    await this.start();
  }
  
  /**
   * Reset timer state
   */
  reset(): void {
    this.lastBroadcastTime = -1;
  }
  
  /**
   * Check if timer is currently active
   */
  isTimerActive(): boolean {
    return this.isActive;
  }
  
  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stop();
  }
}

/**
 * Get timer manager singleton instance
 */
export function getTimerManager(): TimerManager {
  return TimerManager.getInstance();
}
