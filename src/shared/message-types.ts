/**
 * TypeScript types for runtime message passing between popup/options and background
 * 
 * Defines the message protocol for chrome.runtime.sendMessage communication
 * between the extension UI (popup/options pages) and the background service worker.
 * 
 * @module message-types
 */

import { GameConfig, SerializedGameState } from '../types/game';

/**
 * Message types for background communication
 */
export enum MessageType {
  // Game state queries
  GET_GAME_STATE = 'getGameState',
  GET_SETTINGS = 'getSettings',
  
  // Game actions
  START_NEW_GAME = 'startNewGame',
  REVEAL_CELL = 'revealCell',
  TOGGLE_FLAG = 'toggleFlag',
  CHORD = 'chord',
  UNDO = 'undo',
  REDO = 'redo',
  RESET_GAME = 'resetGame',
  PAUSE_GAME = 'pauseGame',
  RESUME_GAME = 'resumeGame',
  
  // Settings actions
  UPDATE_SETTINGS = 'updateSettings',
  CLEAR_HISTORY = 'clearHistory',
  
  // Background -> Popup broadcasts
  GAME_STATE_UPDATED = 'gameStateUpdated',
  TIMER_UPDATE = 'timerUpdate',
  SETTINGS_UPDATED = 'settingsUpdated',
}

/**
 * Base message structure
 */
export interface BaseMessage {
  type: MessageType;
  timestamp: number;
}

/**
 * Message to get current game state
 */
export interface GetGameStateMessage extends BaseMessage {
  type: MessageType.GET_GAME_STATE;
}

/**
 * Response with current game state
 */
export interface GameStateResponse {
  success: boolean;
  state?: SerializedGameState;
  error?: string;
}

/**
 * Message to start a new game
 */
export interface StartNewGameMessage extends BaseMessage {
  type: MessageType.START_NEW_GAME;
  config: GameConfig;
}

/**
 * Message to reveal a cell
 */
export interface RevealCellMessage extends BaseMessage {
  type: MessageType.REVEAL_CELL;
  row: number;
  col: number;
}

/**
 * Message to toggle a flag on a cell
 */
export interface ToggleFlagMessage extends BaseMessage {
  type: MessageType.TOGGLE_FLAG;
  row: number;
  col: number;
}

/**
 * Message to perform chord action
 */
export interface ChordMessage extends BaseMessage {
  type: MessageType.CHORD;
  row: number;
  col: number;
}

/**
 * Message to undo last action
 */
export interface UndoMessage extends BaseMessage {
  type: MessageType.UNDO;
}

/**
 * Message to redo last undone action
 */
export interface RedoMessage extends BaseMessage {
  type: MessageType.REDO;
}

/**
 * Message to reset the current game
 */
export interface ResetGameMessage extends BaseMessage {
  type: MessageType.RESET_GAME;
}

/**
 * Message to pause the game
 */
export interface PauseGameMessage extends BaseMessage {
  type: MessageType.PAUSE_GAME;
}

/**
 * Message to resume the game
 */
export interface ResumeGameMessage extends BaseMessage {
  type: MessageType.RESUME_GAME;
}

/**
 * Message to get settings
 */
export interface GetSettingsMessage extends BaseMessage {
  type: MessageType.GET_SETTINGS;
}

/**
 * Message to update settings
 */
export interface UpdateSettingsMessage extends BaseMessage {
  type: MessageType.UPDATE_SETTINGS;
  settings: {
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
  };
}

/**
 * Message to clear game history
 */
export interface ClearHistoryMessage extends BaseMessage {
  type: MessageType.CLEAR_HISTORY;
}

/**
 * Broadcast message when game state updates
 */
export interface GameStateUpdatedMessage extends BaseMessage {
  type: MessageType.GAME_STATE_UPDATED;
  state: SerializedGameState;
}

/**
 * Broadcast message for timer updates
 */
export interface TimerUpdateMessage extends BaseMessage {
  type: MessageType.TIMER_UPDATE;
  elapsedTime: number;
}

/**
 * Broadcast message when settings are updated
 */
export interface SettingsUpdatedMessage extends BaseMessage {
  type: MessageType.SETTINGS_UPDATED;
}

/**
 * Union type of all possible messages
 */
export type Message =
  | GetGameStateMessage
  | StartNewGameMessage
  | RevealCellMessage
  | ToggleFlagMessage
  | ChordMessage
  | UndoMessage
  | RedoMessage
  | ResetGameMessage
  | PauseGameMessage
  | ResumeGameMessage
  | GetSettingsMessage
  | UpdateSettingsMessage
  | ClearHistoryMessage
  | GameStateUpdatedMessage
  | TimerUpdateMessage
  | SettingsUpdatedMessage;

/**
 * Generic response structure
 */
export interface MessageResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Helper to create a message with timestamp
 */
export function createMessage<T extends Message>(
  type: T['type'],
  payload: Omit<T, 'type' | 'timestamp'>
): T {
  return {
    type,
    timestamp: Date.now(),
    ...payload,
  } as T;
}

/**
 * Type guard to check if a message is of a specific type
 */
export function isMessageType<T extends Message>(
  message: Message,
  type: T['type']
): message is T {
  return message.type === type;
}
