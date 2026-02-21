/**
 * Message Handlers for Background Service Worker
 * 
 * Handles all chrome.runtime.sendMessage communications between
 * popup/options pages and the background service worker.
 * 
 * Key responsibilities:
 * - Route incoming messages to appropriate handlers
 * - Validate message payloads
 * - Execute game operations via GameManager
 * - Return properly formatted responses
 * - Handle errors gracefully
 * 
 * @module message-handlers
 */

import {
  Message,
  MessageType,
  MessageResponse,
  GameStateResponse,
  StartNewGameMessage,
  RevealCellMessage,
  ToggleFlagMessage,
  ChordMessage,
  UpdateSettingsMessage,
} from '../shared/message-types';
import { getGameManager } from './game-manager';
import { getTimerManager } from './timer-manager';
import { SerializedGameState } from '../types/game';
import { getSettings, saveSettings } from '../core/storage';
import { clearGameHistory } from '../core/storage';

/**
 * Main message router
 * Routes incoming messages to appropriate handlers
 * 
 * @param message - Incoming message from popup/options
 * @param sender - Message sender information
 * @param sendResponse - Callback to send response
 * @returns true to indicate async response
 */
export function handleMessage(
  message: Message,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: MessageResponse) => void
): boolean {
  console.log('[MessageHandler] Received message:', message.type, 'from:', sender.tab?.id || 'popup/options');
  
  // Route to appropriate handler
  switch (message.type) {
    case MessageType.GET_GAME_STATE:
      handleGetGameState(sendResponse);
      break;
      
    case MessageType.START_NEW_GAME:
      handleStartNewGame(message as StartNewGameMessage, sendResponse);
      break;
      
    case MessageType.REVEAL_CELL:
      handleRevealCell(message as RevealCellMessage, sendResponse);
      break;
      
    case MessageType.TOGGLE_FLAG:
      handleToggleFlag(message as ToggleFlagMessage, sendResponse);
      break;
      
    case MessageType.CHORD:
      handleChord(message as ChordMessage, sendResponse);
      break;
      
    case MessageType.UNDO:
      handleUndo(sendResponse);
      break;
      
    case MessageType.REDO:
      handleRedo(sendResponse);
      break;
      
    case MessageType.RESET_GAME:
      handleResetGame(sendResponse);
      break;
      
    case MessageType.PAUSE_GAME:
      handlePauseGame(sendResponse);
      break;
      
    case MessageType.RESUME_GAME:
      handleResumeGame(sendResponse);
      break;
      
    case MessageType.GET_SETTINGS:
      handleGetSettings(sendResponse);
      break;
      
    case MessageType.UPDATE_SETTINGS:
      handleUpdateSettings(message as UpdateSettingsMessage, sendResponse);
      break;
      
    case MessageType.CLEAR_HISTORY:
      handleClearHistory(sendResponse);
      break;
      
    default:
      console.warn('[MessageHandler] Unknown message type:', (message as any).type);
      sendResponse({
        success: false,
        error: `Unknown message type: ${(message as any).type}`,
      });
  }
  
  // Return true to indicate we'll send response asynchronously
  return true;
}

/**
 * Handle GET_GAME_STATE message
 */
function handleGetGameState(sendResponse: (response: GameStateResponse) => void): void {
  try {
    const gameManager = getGameManager();
    const state = gameManager.getGameState();
    
    sendResponse({
      success: true,
      state: state || undefined,
    });
  } catch (error) {
    console.error('[MessageHandler] Error getting game state:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get game state',
    });
  }
}

/**
 * Handle START_NEW_GAME message
 */
async function handleStartNewGame(
  message: StartNewGameMessage,
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.startNewGame(message.config);
    
    // Start timer if game is in progress
    const timerManager = getTimerManager();
    await timerManager.start();
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error starting new game:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start new game',
    });
  }
}

/**
 * Handle REVEAL_CELL message
 */
async function handleRevealCell(
  message: RevealCellMessage,
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.revealCell(message.row, message.col);
    
    // Check if game ended, stop timer if so
    if (state.status !== 'playing') {
      const timerManager = getTimerManager();
      await timerManager.stop();
    }
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error revealing cell:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reveal cell',
    });
  }
}

/**
 * Handle TOGGLE_FLAG message
 */
async function handleToggleFlag(
  message: ToggleFlagMessage,
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.toggleFlag(message.row, message.col);
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error toggling flag:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to toggle flag',
    });
  }
}

/**
 * Handle CHORD message
 */
async function handleChord(
  message: ChordMessage,
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.chord(message.row, message.col);
    
    // Check if game ended, stop timer if so
    if (state.status !== 'playing') {
      const timerManager = getTimerManager();
      await timerManager.stop();
    }
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error performing chord:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to perform chord',
    });
  }
}

/**
 * Handle UNDO message
 */
async function handleUndo(
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.undo();
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error undoing:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to undo',
    });
  }
}

/**
 * Handle REDO message
 */
async function handleRedo(
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.redo();
    
    // Check if game ended after redo, stop timer if so
    if (state.status !== 'playing') {
      const timerManager = getTimerManager();
      await timerManager.stop();
    }
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error redoing:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to redo',
    });
  }
}

/**
 * Handle RESET_GAME message
 */
async function handleResetGame(
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.resetGame();
    
    // Reset and start timer for new game
    const timerManager = getTimerManager();
    timerManager.reset();
    await timerManager.start();
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error resetting game:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reset game',
    });
  }
}

/**
 * Handle PAUSE_GAME message
 */
async function handlePauseGame(
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.pauseGame();
    
    // Pause timer
    const timerManager = getTimerManager();
    await timerManager.pause();
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error pausing game:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pause game',
    });
  }
}

/**
 * Handle RESUME_GAME message
 */
async function handleResumeGame(
  sendResponse: (response: MessageResponse<SerializedGameState>) => void
): Promise<void> {
  try {
    const gameManager = getGameManager();
    const state = await gameManager.resumeGame();
    
    // Resume timer
    const timerManager = getTimerManager();
    await timerManager.resume();
    
    sendResponse({
      success: true,
      data: state,
    });
  } catch (error) {
    console.error('[MessageHandler] Error resuming game:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resume game',
    });
  }
}

/**
 * Handle GET_SETTINGS message
 */
async function handleGetSettings(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    const settings = await getSettings();
    
    sendResponse({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error('[MessageHandler] Error getting settings:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get settings',
    });
  }
}

/**
 * Handle UPDATE_SETTINGS message
 */
async function handleUpdateSettings(
  message: UpdateSettingsMessage,
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    // Get current settings
    const currentSettings = await getSettings();
    
    // Merge with updates
    const updatedSettings = {
      ...currentSettings,
      ...message.settings,
    };
    
    // Save updated settings
    await saveSettings(updatedSettings);
    
    // Broadcast settings update
    chrome.runtime.sendMessage({
      type: MessageType.SETTINGS_UPDATED,
      timestamp: Date.now(),
    }).catch(() => {
      // Ignore if no listeners
    });
    
    sendResponse({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    console.error('[MessageHandler] Error updating settings:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings',
    });
  }
}

/**
 * Handle CLEAR_HISTORY message
 */
async function handleClearHistory(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    await clearGameHistory();
    
    sendResponse({
      success: true,
    });
  } catch (error) {
    console.error('[MessageHandler] Error clearing history:', error);
    sendResponse({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to clear history',
    });
  }
}
