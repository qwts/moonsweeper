/**
 * Game Manager for Background Service Worker
 * 
 * Manages the active GameState instance, handles game operations,
 * and coordinates state persistence with chrome.storage.
 * 
 * Key responsibilities:
 * - Maintain single source of truth for game state in background
 * - Handle all game operations (reveal, flag, chord, undo, redo)
 * - Auto-save game state on significant events
 * - Restore game state when service worker starts
 * - Broadcast state updates to connected UI components
 * 
 * @module game-manager
 */

import { GameState } from '../core/GameState';
import { GameConfig, SerializedGameState } from '../types/game';
import { saveGameState, loadGameState, saveGameToHistory, GameHistoryEntry } from '../core/storage';
import { TIMER_CONFIG } from '../shared/constants';

/**
 * Game manager singleton class
 */
export class GameManager {
  /** Current active game instance */
  private game: GameState | null = null;
  
  /** Auto-save alarm timeout reference */
  private autoSaveAlarmActive = false;
  
  /** Last saved state hash for change detection */
  private lastSavedStateHash: string | null = null;
  
  /** Singleton instance */
  private static instance: GameManager | null = null;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }
  
  /**
   * Initialize game manager and restore saved game if exists
   */
  async initialize(): Promise<void> {
    console.log('[GameManager] Initializing...');
    
    try {
      const savedState = await loadGameState();
      
      if (savedState) {
        console.log('[GameManager] Restoring saved game state');
        this.game = GameState.deserialize(savedState);
        this.lastSavedStateHash = this.getStateHash(savedState);
        
        // If game is in progress, resume auto-save
        if (this.game.getStatus() === 'playing') {
          await this.startAutoSave();
        }
      } else {
        console.log('[GameManager] No saved game found, will create on demand');
      }
    } catch (error) {
      console.error('[GameManager] Failed to initialize:', error);
      // Continue without saved state
      this.game = null;
    }
    
    console.log('[GameManager] Initialized successfully');
  }
  
  /**
   * Get current game state (serialized)
   */
  getGameState(): SerializedGameState | null {
    if (!this.game) {
      return null;
    }
    return this.game.serialize();
  }
  
  /**
   * Start a new game with given configuration
   */
  async startNewGame(config: GameConfig): Promise<SerializedGameState> {
    console.log('[GameManager] Starting new game:', config);
    
    // Save previous game to history if it exists and was completed
    if (this.game) {
      await this.saveCompletedGameToHistory();
    }
    
    // Create new game
    this.game = new GameState(config);
    
    // Save immediately
    await this.saveState();
    
    // Start auto-save for new game
    await this.startAutoSave();
    
    // Broadcast update
    this.broadcastGameStateUpdate();
    
    return this.game.serialize();
  }
  
  /**
   * Reveal a cell
   */
  async revealCell(row: number, col: number): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    const wasInProgress = this.game.getStatus() === 'playing';
    
    // Perform action
    this.game.revealCell(row, col);
    
    // If game just ended, save to history
    if (wasInProgress && this.game.getStatus() !== 'playing') {
      await this.handleGameEnd();
    } else {
      // Regular save for in-progress game
      await this.saveState();
    }
    
    // Broadcast update
    this.broadcastGameStateUpdate();
    
    return this.game.serialize();
  }
  
  /**
   * Toggle flag on a cell
   */
  async toggleFlag(row: number, col: number): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    // Perform action
    this.game.toggleFlag(row, col);
    
    // Save state
    await this.saveState();
    
    // Broadcast update
    this.broadcastGameStateUpdate();
    
    return this.game.serialize();
  }
  
  /**
   * Perform chord action on a cell
   */
  async chord(row: number, col: number): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    const wasInProgress = this.game.getStatus() === 'playing';
    
    // Perform action
    this.game.performChord(row, col);
    
    // If game just ended, save to history
    if (wasInProgress && this.game.getStatus() !== 'playing') {
      await this.handleGameEnd();
    } else {
      // Regular save for in-progress game
      await this.saveState();
    }
    
    // Broadcast update
    this.broadcastGameStateUpdate();
    
    return this.game.serialize();
  }
  
  /**
   * Undo last action
   */
  async undo(): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    // Perform action
    const success = this.game.undo();
    
    if (success) {
      // Save state after undo
      await this.saveState();
      
      // Broadcast update
      this.broadcastGameStateUpdate();
    }
    
    return this.game.serialize();
  }
  
  /**
   * Redo last undone action
   */
  async redo(): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    // Perform action
    const wasInProgress = this.game.getStatus() === 'playing';
    const success = this.game.redo();
    
    if (success) {
      // If game ended after redo, handle end
      if (wasInProgress && this.game.getStatus() !== 'playing') {
        await this.handleGameEnd();
      } else {
        // Regular save
        await this.saveState();
      }
      
      // Broadcast update
      this.broadcastGameStateUpdate();
    }
    
    return this.game.serialize();
  }
  
  /**
   * Reset current game
   */
  async resetGame(): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    // Get current config and start new game with same config
    const config = this.game.getConfig();
    return this.startNewGame(config);
  }
  
  /**
   * Pause current game
   */
  async pauseGame(): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    // Note: GameState doesn't have pause/resume methods
    // Timer is timestamp-based and calculated on demand
    // We just stop auto-save and timer broadcasts
    
    // Save state
    await this.saveState();
    
    // Stop auto-save while paused
    await this.stopAutoSave();
    
    // Broadcast update
    this.broadcastGameStateUpdate();
    
    return this.game.serialize();
  }
  
  /**
   * Resume current game
   */
  async resumeGame(): Promise<SerializedGameState> {
    if (!this.game) {
      throw new Error('No active game');
    }
    
    // Note: GameState doesn't have pause/resume methods
    // Timer is timestamp-based and calculated on demand
    // We just resume auto-save and timer broadcasts
    
    // Save state
    await this.saveState();
    
    // Resume auto-save
    await this.startAutoSave();
    
    // Broadcast update
    this.broadcastGameStateUpdate();
    
    return this.game.serialize();
  }
  
  /**
   * Get elapsed time for current game
   */
  getElapsedTime(): number {
    if (!this.game) {
      return 0;
    }
    return this.game.getElapsedTime();
  }
  
  /**
   * Save current game state to storage
   */
  private async saveState(): Promise<void> {
    if (!this.game) {
      return;
    }
    
    const state = this.game.serialize();
    const stateHash = this.getStateHash(state);
    
    // Only save if state has changed
    if (stateHash === this.lastSavedStateHash) {
      return;
    }
    
    try {
      await saveGameState(state);
      this.lastSavedStateHash = stateHash;
      console.log('[GameManager] Game state saved');
    } catch (error) {
      console.error('[GameManager] Failed to save state:', error);
    }
  }
  
  /**
   * Handle game end (win or loss)
   */
  private async handleGameEnd(): Promise<void> {
    if (!this.game) {
      return;
    }
    
    console.log('[GameManager] Game ended:', this.game.getStatus());
    
    // Stop auto-save
    await this.stopAutoSave();
    
    // Save final state
    await this.saveState();
    
    // Save to history
    await this.saveCompletedGameToHistory();
  }
  
  /**
   * Save completed game to history
   */
  private async saveCompletedGameToHistory(): Promise<void> {
    if (!this.game) {
      return;
    }
    
    const status = this.game.getStatus();
    
    // Only save completed games (won or lost)
    if (status !== 'won' && status !== 'lost') {
      return;
    }
    
    const state = this.game.serialize();
    
    const historyEntry: GameHistoryEntry = {
      timestamp: Date.now(),
      config: state.config,
      won: status === 'won',
      time: state.elapsedTime,
    };
    
    try {
      await saveGameToHistory(historyEntry);
      console.log('[GameManager] Game saved to history');
    } catch (error) {
      console.error('[GameManager] Failed to save game to history:', error);
    }
  }
  
  /**
   * Start auto-save alarm
   */
  private async startAutoSave(): Promise<void> {
    if (this.autoSaveAlarmActive) {
      return;
    }
    
    try {
      // Create alarm for periodic auto-save
      await chrome.alarms.create(TIMER_CONFIG.AUTO_SAVE_ALARM_NAME, {
        periodInMinutes: TIMER_CONFIG.AUTO_SAVE_INTERVAL_MINUTES,
      });
      
      this.autoSaveAlarmActive = true;
      console.log('[GameManager] Auto-save started');
    } catch (error) {
      console.error('[GameManager] Failed to start auto-save:', error);
    }
  }
  
  /**
   * Stop auto-save alarm
   */
  private async stopAutoSave(): Promise<void> {
    if (!this.autoSaveAlarmActive) {
      return;
    }
    
    try {
      await chrome.alarms.clear(TIMER_CONFIG.AUTO_SAVE_ALARM_NAME);
      this.autoSaveAlarmActive = false;
      console.log('[GameManager] Auto-save stopped');
    } catch (error) {
      console.error('[GameManager] Failed to stop auto-save:', error);
    }
  }
  
  /**
   * Handle auto-save alarm trigger
   */
  async handleAutoSave(): Promise<void> {
    console.log('[GameManager] Auto-save triggered');
    await this.saveState();
  }
  
  /**
   * Broadcast game state update to connected UI
   */
  private broadcastGameStateUpdate(): void {
    if (!this.game) {
      return;
    }
    
    const state = this.game.serialize();
    
    // Send message to all tabs/windows
    chrome.runtime.sendMessage({
      type: 'gameStateUpdated',
      timestamp: Date.now(),
      state,
    }).catch(() => {
      // Ignore errors if no listeners (popup closed)
    });
  }
  
  /**
   * Generate hash of game state for change detection
   */
  private getStateHash(state: SerializedGameState): string {
    // Simple hash using JSON stringification
    // In production, might use a more efficient hash function
    return JSON.stringify({
      status: state.status,
      remainingFlags: state.remainingFlags,
      elapsedTime: state.elapsedTime,
      boardHash: state.board.cells.length,
    });
  }
  
  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.stopAutoSave();
    
    // Save final state before cleanup
    if (this.game) {
      await this.saveState();
    }
  }
}

/**
 * Get game manager singleton instance
 */
export function getGameManager(): GameManager {
  return GameManager.getInstance();
}
