## Plan: Chrome Extension with Manifest v3

Section 2 transforms the React Minesweeper app into a proper Chrome extension. Core gameplay from Section 1 (grid, timer, undo/redo) is complete but lives entirely in React Context. This section migrates state management to a background service worker, implements chrome.storage persistence, creates a compact popup UI, and adds an options page. The extension will support both popup mode (quick 400×600px play) and full-page mode (new tab for larger boards), with timer and game state persisting across popup sessions.

**Architecture shift**: Game state moves from React Context to background service worker. Popup/options pages communicate via chrome.runtime message passing. Timer uses chrome.alarms API for efficiency. State auto-saves every 5s during play plus on significant events (game start/end, undo/redo).

**Steps**

### Phase 1: Foundation (02-05, 02-01)

1. **Create chrome.storage wrappers** for Issue 02-05
   - Create [src/shared/chrome-storage.ts](src/shared/chrome-storage.ts) with async wrappers for `chrome.storage.sync` (settings, max 100KB) and `chrome.storage.local` (game data, max 10MB)
   - Add error handling, quota checks, and fallback to localStorage for development
   - Create [src/shared/message-types.ts](src/shared/message-types.ts) with TypeScript types for runtime message passing between popup/background
   - Create [src/shared/constants.ts](src/shared/constants.ts) for storage keys, message types

2. **Migrate existing storage** in [src/core/storage.ts](src/core/storage.ts)
   - Replace localStorage calls with chrome.storage wrappers
   - Update `saveGameState`, `loadGameState`, `getGameHistory`, `clearHistory` functions to be async
   - Separate settings (sync) from game records (local)
   - Update callers in [src/contexts/GameContext.tsx](src/contexts/GameContext.tsx) to handle async storage

3. **Update manifest.json** for Issue 02-01
   - Add `background.service_worker` pointing to `src/background/service-worker.ts`
   - Add `options_page` or `options_ui` pointing to `src/options/options.html`
   - Update `action.default_popup` from `public/index.html` to `src/popup/popup.html`
   - Add `content_security_policy` if needed (test build for inline scripts)
   - Verify `permissions: ["storage"]` is sufficient (add `alarms` for timer)
   - Add `chrome_url_overrides` or keep index.html for full-page mode

4. **Update Vite configuration** in [vite.config.ts](vite.config.ts)
   - Add new entry points for popup (`src/popup/popup.html`), options (`src/options/options.html`), background (`src/background/service-worker.ts`)
   - Configure @crxjs/vite-plugin to bundle service worker separately
   - Ensure icons (icon16.png, icon48.png, icon128.png) are copied to dist/

### Phase 2: Background Service Worker (02-02)

5. **Create service worker infrastructure**
   - Create [src/background/service-worker.ts](src/background/service-worker.ts) as main entry with install/activate/message listeners
   - Create [src/background/game-manager.ts](src/background/game-manager.ts) that imports `GameState` from [src/core/GameState.ts](src/core/GameState.ts) and manages active game instance
   - Create [src/background/timer-manager.ts](src/background/timer-manager.ts) using chrome.alarms API with 1s interval, broadcasts elapsed time to popup
   - Create [src/background/message-handlers.ts](src/background/message-handlers.ts) with handlers for: `getGameState`, `startNewGame`, `revealCell`, `toggleFlag`, `chord`, `undo`, `redo`, `resetGame`

6. **Implement game state persistence**
   - In `game-manager.ts`, auto-save state to chrome.storage.local on: game start, game end, undo/redo operations
   - Add periodic save using chrome.alarms (every 5s during active play)
   - On service worker startup, restore game state from storage if exists
   - Implement state serialization using existing `GameState.serialize()` method

7. **Implement timer in background**
   - In `timer-manager.ts`, create alarm that fires every 1s when game is active
   - Track start timestamp in GameState (already supported via `startTime` field)
   - Calculate elapsed time on demand (timestamp-based, not counter-based)
   - Broadcast timer updates to open popup via `chrome.runtime.sendMessage` if connected
   - Pause timer on game pause/end, resume on unpause

### Phase 3: Popup UI (02-03)

8. **Create popup HTML structure**
   - Create [src/popup/popup.html](src/popup/popup.html) with viewport meta, links to popup CSS/JS
   - Create [src/popup/popup-main.tsx](src/popup/popup-main.tsx) as React entry point
   - Create [src/popup/popup.tsx](src/popup/popup.tsx) as root component (replaces current [src/components/Game.tsx](src/components/Game.tsx) for popup mode)

9. **Adapt UI for popup constraints**
   - In `popup.tsx`, set max dimensions 400×600px (Chrome popup limit is 800×600, but target smaller)
   - Scale board dynamically: for grids >16×16, reduce cell size or add scrolling
   - Modify [src/components/Board.tsx](src/components/Board.tsx) to accept scale prop for cell size
   - Keep [src/components/StatusBar.tsx](src/components/StatusBar.tsx), [src/components/Controls.tsx](src/components/Controls.tsx) compact (horizontal layout if needed)
   - Add "Open full page" button that opens index.html in new tab for large boards

10. **Implement message passing to background**
    - In `popup.tsx`, replace GameContext with background communication
    - On mount, send `getGameState` message to background, render when received
    - On user actions (click cell, flag, undo), send messages to background instead of local state updates
    - Listen for timer updates from background via `chrome.runtime.onMessage`
    - Handle background script not ready (show loading state)

11. **Add settings link to options page**
    - In popup UI, add gear icon or "Settings" link that opens `chrome.runtime.openOptionsPage()`
    - Ensure link is accessible via keyboard navigation

### Phase 4: Options Page (02-04)

12. **Create options page structure**
    - Create [src/options/options.html](src/options/options.html) with standard HTML page structure
    - Create [src/options/options-main.tsx](src/options/options-main.tsx) as React entry point
    - Create [src/options/options.tsx](src/options/options.tsx) as main options component

13. **Implement settings UI**
    - In `options.tsx`, reuse [src/components/GameSetup.tsx](src/components/GameSetup.tsx) logic for difficulty presets (Easy/Medium/Hard/Custom)
    - Add sections for future features with "Coming soon" placeholders:
      - Theme selection (Light/Dark/Color-blind modes) - defer to Section 3
      - Sound preferences (On/Off/Volume) - defer to Section 3
      - Statistics viewer (games played, win rate, best time) - placeholder for now
    - Load settings from chrome.storage.sync on mount
    - Save settings to chrome.storage.sync on change (debounced)
    - Show save confirmation feedback

14. **Wire options to background**
    - When difficulty preset changes, notify background via message to reset game with new config
    - Ensure background service worker reads default difficulty from storage on initialization

### Phase 5: Permissions & Testing (02-06)

15. **Review and minimize permissions**
    - Audit [manifest.json](manifest.json) permissions: keep `storage`, add `alarms` for timer
    - Add permission justifications as comments in manifest (not stored but documented in code)
    - Do NOT add `notifications` yet (defer to future version)
    - Verify no unnecessary host_permissions

16. **Test offline functionality**
    - Disable network in Chrome DevTools, verify game loads and plays normally
    - Confirm chrome.storage.local works offline (sync will queue until online)
    - Test service worker behavior when offline (no fetch dependencies)

17. **Validate manifest and extension**
    - Build extension with `npm run build`
    - Load in Chrome at chrome://extensions (Developer mode)
    - Run Chrome's built-in manifest validator
    - Test popup opens, options page opens, full-page mode works
    - Test game state persists when closing/reopening popup
    - Test timer continues in background

**Verification**

1. **Build and load extension**: `npm run build`, then load `dist/` folder in chrome://extensions
2. **Popup UI tests**:
   - Click extension icon, verify popup opens with game
   - Play a game, close popup, reopen → game state and timer should persist
   - Try different difficulty presets
   - Test undo/redo from popup
   - Verify "Open full page" button works for large grids
3. **Options page tests**:
   - Right-click extension icon → Options, or click settings link in popup
   - Change difficulty preset, verify saves to chrome.storage.sync
   - Check placeholder sections for themes/sound exist
4. **Background service worker tests**:
   - Open chrome://inspect/#service-workers, find MindSweeper worker
   - Check console for errors
   - Verify timer alarm fires every 1s during active game
   - Check chrome.storage.local for saved game state
5. **Offline test**:
   - DevTools → Network → Offline, reload extension
   - Verify game works fully offline
6. **Manifest validation**:
   - Check chrome://extensions for errors
   - Run `chrome.runtime.getManifest()` in popup console, verify schema
7. **Existing tests**:
   - Run `npm test` to ensure core game logic still passes (106 tests)

**Decisions**

- **State architecture**: Chose background service worker over React Context for persistence across popup sessions
- **UI modes**: Support both popup (quick play) and full-page mode (new tab) for flexibility with large boards
- **Timer strategy**: Use chrome.alarms API (1s interval) instead of setInterval for service worker compatibility and efficiency
- **Storage separation**: chrome.storage.sync for settings (themes, difficulty, cross-device sync), chrome.storage.local for game history (device-specific, larger quota)
- **Auto-save frequency**: Save on significant events (game start/end, undo/redo) + every 5s during play (balanced safety vs. performance)
- **Options scope**: Scaffold future features (themes, sound, stats) with placeholders to enable iterative UI development in Section 3
- **Notifications**: Deferred to future version (not in Section 2 scope)
- **Message passing**: Type-safe messages via TypeScript interfaces in shared/message-types.ts for popup ↔ background communication
