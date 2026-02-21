000001 | # MindSweeper Extension Permissions
000002 | 
000003 | This document provides justifications for all Chrome extension permissions requested in `manifest.json`.
000004 | 
000005 | <!-- <anchor:0x1001> -->
000006 | ## Permission: `storage`
000007 | 
000008 | **Purpose:** Persist game state, settings, and game history across browser sessions.
000009 | 
000010 | **Usage:**
000011 | - `chrome.storage.local`: Store active game state, move history, and game records (up to 10MB)
000012 |   - Current game board state and timer
000013 |   - Undo/redo history (command pattern)
000014 |   - Historical game results for statistics
000015 | - `chrome.storage.sync`: Store user preferences and settings (up to 100KB, syncs across devices)
000016 |   - Difficulty preset selection (Easy/Medium/Hard/Custom)
000017 |   - Theme preferences (Light/Dark/Color-blind modes)
000018 |   - Sound and notification preferences
000019 | 
000020 | **Why Required:**
000021 | - Core feature: Game must persist when closing/reopening popup
000022 | - Core feature: Timer continues in background between sessions
000023 | - Core feature: Undo/redo requires persistent command history
000024 | - User experience: Settings sync across devices
000025 | 
000026 | **Alternative Considered:** localStorage - Not available in service workers (Manifest v3 requirement)
000027 | 
000028 | **Data Privacy:**
000029 | - All data stays local or syncs via Chrome Sync (user-controlled)
000030 | - No external servers or third-party data sharing
000031 | - User can clear all data via chrome://extensions or options page
000032 | <!-- </anchor:0x1001> -->
000033 | 
000034 | <!-- <anchor:0x1002> -->
000035 | ## Permission: `alarms`
000036 | 
000037 | **Purpose:** Run timer in background service worker efficiently.
000038 | 
000039 | **Usage:**
000040 | - `chrome.alarms.create()`: Create 1-second interval alarm for game timer
000041 | - `chrome.alarms.create()`: Create 5-second interval alarm for auto-save during active play
000042 | - `chrome.alarms.onAlarm`: Listen for timer ticks and trigger periodic saves
000043 | 
000044 | **Why Required:**
000045 | - Core feature: Game timer must continue when popup is closed
000046 | - Technical: `setInterval` not recommended in service workers (Manifest v3)
000047 | - Efficiency: chrome.alarms is optimized for battery life (batches wake-ups)
000048 | - Reliability: Alarms persist across service worker restarts
000049 | 
000050 | **Alternative Considered:**
000051 | - `setInterval`: Not reliable in service workers (can be terminated)
000052 | - Performance API: Requires active context (popup must stay open)
000053 | 
000054 | **Resource Usage:**
000055 | - Timer alarm: 1 wake-up per second (only while game is active)
000056 | - Auto-save alarm: 1 wake-up per 5 seconds (only while game is active)
000057 | - Both alarms cleared when game is paused or completed
000058 | <!-- </anchor:0x1002> -->
000059 | 
000060 | <!-- <anchor:0x1003> -->
000061 | ## Permissions NOT Requested
000062 | 
000063 | ### `notifications` - Deferred to future version
000064 | - Feature: Notify user when game timer reaches milestones
000065 | - Status: Not implemented in Phase 2 (Section 2)
000066 | - Reason: Not essential for core gameplay
000067 | - Plan: Add in Section 4 (Polish features)
000068 | 
000069 | ### `tabs` - Not needed
000070 | - Can open full-page mode using `chrome.tabs.create()` without permission
000071 | - Only tab query/modification requires permission
000072 | 
000073 | ### `activeTab` - Not needed
000074 | - Extension doesn't inject content scripts
000075 | - Popup and options pages don't need page access
000076 | 
000077 | ### `<all_urls>` or host permissions - Not needed
000078 | - Game runs entirely offline
000079 | - No external API calls or resources
000080 | - All assets bundled in extension package
000081 | 
000082 | ### `webRequest` - Not needed
000083 | - No need to intercept or modify web requests
000084 | 
000085 | ### `clipboardWrite` - Not needed
000086 | - No export/share functionality in Phase 2
000087 | - Plan: Consider for social sharing features (Section 4)
000088 | <!-- </anchor:0x1003> -->
000089 | 
000090 | <!-- <anchor:0x1004> -->
000091 | ## Offline Support
000092 | 
000093 | MindSweeper is designed to work **100% offline** with no network dependencies:
000094 | 
000095 | **No Network Requirements:**
000096 | - All game logic runs locally in browser
000097 | - All assets (HTML, CSS, JS, icons) bundled in extension
000098 | - chrome.storage.local works offline (sync queues until online)
000099 | - Service worker has no fetch() calls to external resources
000100 | 
000101 | **Online Features (Optional):**
000102 | - chrome.storage.sync: Settings sync across devices when online
000103 | - Automatic: Syncs in background, no user action required
000104 | - Graceful degradation: Works offline, syncs when connection restored
000105 | 
000106 | **Testing Offline:**
000107 | 1. Load extension in chrome://extensions
000108 | 2. Open DevTools → Network tab → Set "Offline"
000109 | 3. Verify all features work: popup, options, game play, timer, undo/redo
000110 | 4. Re-enable network → Verify settings sync kicks in
000111 | <!-- </anchor:0x1004> -->
000112 | 
000113 | <!-- <anchor:0x1005> -->
000114 | ## Permission Review Checklist
000115 | 
000116 | ✅ **Minimalist Approach** - Only 2 permissions requested (storage, alarms)
000117 | ✅ **Justification Required** - Each permission documented above
000118 | ✅ **User Privacy** - No data leaves user's control
000119 | ✅ **Offline First** - Works without network access
000120 | ✅ **Manifest v3 Compliant** - Service worker compatible
000121 | ✅ **No Host Permissions** - No access to user's browsing data
000122 | ✅ **Graceful Degradation** - Sync is optional enhancement
000123 | 
000124 | **Audit Date:** 2026-02-20
000125 | **Reviewed By:** GitHub Copilot (Phase 05 Implementation)
000126 | **Next Review:** Before each major version release
000127 | <!-- </anchor:0x1005> -->
