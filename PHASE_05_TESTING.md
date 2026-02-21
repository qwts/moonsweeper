000001 | # Phase 05 Testing Guide - Permissions & Validation
000002 | 
000003 | This guide provides comprehensive testing procedures for Phase 05 of the MindSweeper Chrome Extension (Section 2: Browser Extension Specifics).
000004 | 
000005 | **Phase 05 Objectives:**
000006 | 1. Verify minimal permissions (storage, alarms only)
000007 | 2. Test offline functionality (100% network independence)
000008 | 3. Validate manifest.json compliance with Chrome Extension requirements
000009 | 4. End-to-end extension validation before release
000010 | 
000011 | ---
000012 | 
000013 | <!-- <anchor:0x2001> -->
000014 | ## Pre-Testing Setup
000015 | 
000016 | ### 1. Build the Extension
000017 | ```bash
000018 | # Clean previous builds
000019 | rm -rf dist/
000020 | 
000021 | # Install dependencies (if not already done)
000022 | npm install
000023 | 
000024 | # Run tests to ensure core logic works
000025 | npm test
000026 | 
000027 | # Build extension for production
000028 | npm run build
000029 | ```
000030 | 
000031 | ### 2. Load Extension in Chrome
000032 | 1. Open Chrome browser
000033 | 2. Navigate to `chrome://extensions`
000034 | 3. Enable **Developer mode** (toggle in top-right)
000035 | 4. Click **Load unpacked**
000036 | 5. Select the `dist/` folder from your project
000037 | 6. Verify extension appears with name "MindSweeper" and version "0.2.0"
000038 | 
000039 | ### 3. Open Developer Tools
000040 | - **Service Worker Console**: `chrome://extensions` → Find MindSweeper → Click "service worker" link
000041 | - **Popup DevTools**: Right-click extension icon → Inspect popup
000042 | - **Options DevTools**: Right-click on options page → Inspect
000043 | <!-- </anchor:0x2001> -->
000044 | 
000045 | ---
000046 | 
000047 | <!-- <anchor:0x2002> -->
000048 | ## Test 1: Permission Review
000049 | 
000050 | **Objective:** Verify extension requests only necessary permissions.
000051 | 
000052 | ### Steps:
000053 | 1. In `chrome://extensions`, locate MindSweeper extension
000054 | 2. Click **Details** button
000055 | 3. Scroll to **Permissions** section
000056 | 4. Verify ONLY these permissions are listed:
000057 |    - ✅ **storage** - Store game state and settings
000058 |    - ✅ **alarms** - Run timer in background
000059 | 5. Verify NO other permissions requested (no host permissions, no tabs, no activeTab)
000060 | 
000061 | ### Verification:
000062 | ```javascript
000063 | // In popup console or service worker console
000064 | const manifest = chrome.runtime.getManifest();
000065 | console.log('Permissions:', manifest.permissions);
000066 | // Expected: ["storage", "alarms"]
000067 | 
000068 | console.log('Host permissions:', manifest.host_permissions);
000069 | // Expected: undefined
000070 | ```
000071 | 
000072 | ### ✅ Success Criteria:
000073 | - Only 2 permissions displayed in Chrome UI
000074 | - manifest.permissions array contains exactly ["storage", "alarms"]
000075 | - No host_permissions in manifest
000076 | - Extension description clearly states it works offline
000077 | <!-- </anchor:0x2002> -->
000078 | 
000079 | ---
000080 | 
000081 | <!-- <anchor:0x2003> -->
000082 | ## Test 2: Offline Functionality
000083 | 
000084 | **Objective:** Verify game works 100% offline with no network dependencies.
000085 | 
000086 | ### 2.1 Initial Offline Test
000087 | 
000088 | **Steps:**
000089 | 1. Open Chrome DevTools (F12)
000090 | 2. Go to **Network** tab
000091 | 3. Select **Offline** from throttling dropdown (or select "No throttling" → Change to "Offline")
000092 | 4. Click MindSweeper extension icon to open popup
000093 | 5. Verify popup loads successfully
000094 | 6. Check Network tab - should show NO network requests (or only chrome-extension:// URLs)
000095 | 
000096 | ### 2.2 Gameplay Offline Test
000097 | 
000098 | **With network still offline, test all game features:**
000099 | 
000100 | - [ ] Click cells to reveal (left-click)
000101 | - [ ] Toggle flags (right-click or long-press)
000102 | - [ ] Use chord operation (click revealed number with all adjacent mines flagged)
000103 | - [ ] Timer starts and updates every second
000104 | - [ ] Mine counter updates when flags placed/removed
000105 | - [ ] Undo button works (Ctrl+Z or button)
000106 | - [ ] Redo button works (Ctrl+Y or button)
000107 | - [ ] Start new game
000108 | - [ ] Win a game (reveal all non-mine cells)
000109 | - [ ] Lose a game (click mine)
000110 | - [ ] End game modal appears with correct message
000111 | 
000112 | ### 2.3 Options Page Offline Test
000113 | 
000114 | **Steps:**
000115 | 1. Right-click extension icon → **Options** (or use settings link in popup)
000116 | 2. Verify options page loads offline
000117 | 3. Change difficulty preset (Easy → Medium → Hard → Custom)
000118 | 4. Modify custom grid size and mine count
000119 | 5. Verify changes save to chrome.storage (check service worker console)
000120 | 6. Start new game with new settings
000121 | 
000122 | ### 2.4 Persistence Offline Test
000123 | 
000124 | **Steps:**
000125 | 1. Start a game (make a few moves)
000126 | 2. Close popup
000127 | 3. Wait 5 seconds
000128 | 4. Reopen popup
000129 | 5. Verify game state restored (board, timer, flags)
000130 | 6. Close browser entirely
000131 | 7. Reopen browser (still offline)
000132 | 8. Open popup
000133 | 9. Verify game state still persists
000134 | 
000135 | ### 2.5 Service Worker Offline Test
000136 | 
000137 | **Steps:**
000138 | 1. Open service worker console (`chrome://extensions` → service worker link)
000139 | 2. Check for errors related to network failures
000140 | 3. Verify no `fetch()` calls or network-dependent code
000141 | 4. Verify alarms are created and firing:
000142 |    ```javascript
000143 |    chrome.alarms.getAll((alarms) => {
000144 |      console.log('Active alarms:', alarms);
000145 |      // Should see MINDSWEEPER_TIMER and possibly MINDSWEEPER_AUTOSAVE
000146 |    });
000147 |    ```
000148 | 
000149 | ### ✅ Success Criteria:
000150 | - All game features work with network disabled
000151 | - No failed network requests in DevTools Network tab
000152 | - No console errors related to network
000153 | - Game state persists across popup close/reopen
000154 | - Timer continues in background (check elapsed time after closing/reopening)
000155 | - Settings save and load correctly
000156 | <!-- </anchor:0x2003> -->
000157 | 
000158 | ---
000159 | 
000160 | <!-- <anchor:0x2004> -->
000161 | ## Test 3: Online → Offline → Online Transition
000162 | 
000163 | **Objective:** Verify chrome.storage.sync handles network transitions gracefully.
000164 | 
000165 | ### Steps:
000166 | 1. **Online Phase:**
000167 |    - Open options page
000168 |    - Change difficulty to "Hard"
000169 |    - Verify save succeeds (check console for confirmation)
000170 |    - Start a new game with Hard difficulty
000171 | 
000172 | 2. **Go Offline:**
000173 |    - DevTools → Network → Offline
000174 |    - Change difficulty to "Easy" in options
000175 |    - Save should still work (chrome.storage.sync queues changes)
000176 |    - Settings should apply immediately (local copy updated)
000177 | 
000178 | 3. **Go Back Online:**
000179 |    - DevTools → Network → Online
000180 |    - Wait 5-10 seconds
000181 |    - Open options on another Chrome profile or device (if available)
000182 |    - Verify settings synced to "Easy"
000183 | 
000184 | ### ✅ Success Criteria:
000185 | - Settings save locally when offline
000186 | - Settings apply immediately (no waiting for network)
000187 | - Settings sync in background when online
000188 | - No errors or warnings about sync failures
000189 | <!-- </anchor:0x2004> -->
000190 | 
000191 | ---
000192 | 
000193 | <!-- <anchor:0x2005> -->
000194 | ## Test 4: Manifest Validation
000195 | 
000196 | **Objective:** Ensure manifest.json complies with Chrome Extension Manifest v3 requirements.
000197 | 
000198 | ### 4.1 Chrome Built-in Validation
000199 | 
000200 | **Steps:**
000201 | 1. In `chrome://extensions`, check for any errors or warnings on MindSweeper extension card
000202 | 2. If any warnings appear, investigate and resolve
000203 | 3. Common issues to check:
000204 |    - manifest_version must be 3
000205 |    - background.service_worker must point to valid file
000206 |    - Icons must exist and be valid PNG files (16, 48, 128)
000207 |    - CSP (Content Security Policy) compliance if specified
000208 | 
000209 | ### 4.2 Manual Manifest Review
000210 | 
000211 | **Read manifest.json and verify:**
000212 | 
000213 | ```json
000214 | {
000215 |   "manifest_version": 3,  // ✅ Must be 3
000216 |   "name": "MindSweeper",  // ✅ Clear, descriptive
000217 |   "version": "0.2.0",     // ✅ Follows semver
000218 |   "description": "...",   // ✅ Under 132 characters
000219 |   "permissions": [...],   // ✅ Only storage, alarms
000220 |   "action": {             // ✅ Popup configured
000221 |     "default_popup": "src/popup/popup.html"
000222 |   },
000223 |   "background": {         // ✅ Service worker configured
000224 |     "service_worker": "src/background/service-worker.ts",
000225 |     "type": "module"
000226 |   },
000227 |   "options_ui": {         // ✅ Options page configured
000228 |     "page": "src/options/options.html"
000229 |   },
000230 |   "icons": {...}          // ✅ All sizes present
000231 | }
000232 | ```
000233 | 
000234 | ### 4.3 Runtime Manifest Check
000235 | 
000236 | **In popup or service worker console:**
000237 | ```javascript
000238 | const manifest = chrome.runtime.getManifest();
000239 | console.log('Manifest:', manifest);
000240 | 
000241 | // Verify key fields
000242 | console.assert(manifest.manifest_version === 3, 'Must be Manifest v3');
000243 | console.assert(manifest.permissions.length === 2, 'Should have exactly 2 permissions');
000244 | console.assert(manifest.permissions.includes('storage'), 'storage required');
000245 | console.assert(manifest.permissions.includes('alarms'), 'alarms required');
000246 | console.assert(!manifest.host_permissions, 'No host permissions needed');
000247 | ```
000248 | 
000249 | ### 4.4 Icon Validation
000250 | 
000251 | **Steps:**
000252 | 1. Check `dist/public/` folder contains:
000253 |    - icon16.png (16×16)
000254 |    - icon48.png (48×48)
000255 |    - icon128.png (128×128)
000256 | 2. Verify icons display correctly in:
000257 |    - Chrome toolbar (16px or 32px depending on DPI)
000258 |    - Extension management page (48px)
000259 |    - Chrome Web Store listing (128px)
000260 | 
000261 | ### ✅ Success Criteria:
000262 | - No errors or warnings in chrome://extensions
000263 | - Manifest follows Manifest v3 schema
000264 | - All referenced files exist in dist/
000265 | - Icons render properly at all sizes
000266 | - Runtime manifest checks pass without assertions failing
000267 | <!-- </anchor:0x2005> -->
000268 | 
000269 | ---
000270 | 
000271 | <!-- <anchor:0x2006> -->
000272 | ## Test 5: End-to-End Extension Validation
000273 | 
000274 | **Objective:** Comprehensive test of all extension features from user perspective.
000275 | 
000276 | ### 5.1 Popup UI Tests
000277 | 
000278 | **Steps:**
000279 | 1. **Initial Load:**
000280 |    - Click extension icon
000281 |    - Verify popup opens (~400×600px window)
000282 |    - Check UI elements present: board, timer, mine counter, controls
000283 | 
000284 | 2. **Play Complete Game:**
000285 |    - Start new game (Easy difficulty)
000286 |    - Make some moves
000287 |    - Use undo/redo
000288 |    - Flag some mines
000289 |    - Complete game (win or lose)
000290 |    - Verify end game modal appears
000291 |    - Click "New Game" in modal
000292 | 
000293 | 3. **State Persistence:**
000294 |    - Start new game (make 5+ moves)
000295 |    - Close popup (click outside or press Escape)
000296 |    - Wait 5 seconds
000297 |    - Reopen popup
000298 |    - Verify exact game state restored (all cells, flags, timer)
000299 | 
000300 | 4. **Timer Background Continuity:**
000301 |    - Start new game
000302 |    - Wait 10 seconds (note timer value, e.g., "0:10")
000303 |    - Close popup
000304 |    - Wait 15 seconds (outside popup)
000305 |    - Reopen popup
000306 |    - Verify timer shows ~25 seconds (10 + 15)
000307 | 
000308 | 5. **Large Board Handling:**
000309 |    - Open options, set Custom: 30×30, 200 mines
000310 |    - Start new game
000311 |    - Verify popup either:
000312 |      - Scales board down with smaller cells, OR
000313 |      - Shows "Open full page" button
000314 | 
000315 | ### 5.2 Options Page Tests
000316 | 
000317 | **Steps:**
000318 | 1. **Open Options:**
000319 |    - Right-click extension icon → Options
000320 |    - Verify opens in new tab
000321 |    - Check UI loads correctly
000322 | 
000323 | 2. **Change Settings:**
000324 |    - Select "Easy" preset
000325 |    - Verify grid/mine values update (9×9, 10 mines)
000326 |    - Select "Medium" preset
000327 |    - Select "Hard" preset
000328 |    - Select "Custom"
000329 |    - Enter custom values (15×15, 30 mines)
000330 | 
000331 | 3. **Settings Persistence:**
000332 |    - Set difficulty to "Hard"
000333 |    - Close options tab
000334 |    - Reopen options
000335 |    - Verify "Hard" is still selected
000336 | 
000337 | 4. **Settings Apply to Game:**
000338 |    - In options, set to "Easy"
000339 |    - Go to popup
000340 |    - Start new game
000341 |    - Verify board is 9×9 with 10 mines
000342 | 
000343 | ### 5.3 Background Service Worker Tests
000344 | 
000345 | **Steps:**
000346 | 1. **Open Service Worker DevTools:**
000347 |    - Go to `chrome://extensions`
000348 |    - Find MindSweeper extension
000349 |    - Click "service worker" link (opens DevTools)
000350 | 
000351 | 2. **Check Console for Errors:**
000352 |    - Look for any red error messages
000353 |    - Check for initialization logs: "[ServiceWorker] MindSweeper service worker starting..."
000354 |    - Verify no unhandled promise rejections
000355 | 
000356 | 3. **Verify Alarms:**
000357 |    - In service worker console, run:
000358 |      ```javascript
000359 |      chrome.alarms.getAll((alarms) => {
000360 |        console.log('Active alarms:', alarms.map(a => ({
000361 |          name: a.name,
000362 |          scheduledTime: new Date(a.scheduledTime)
000363 |        })));
000364 |      });
000365 |      ```
000366 |    - Start a game in popup
000367 |    - Re-run command, verify "MINDSWEEPER_TIMER" alarm present
000368 |    - Complete/pause game
000369 |    - Re-run command, verify alarm cleared
000370 | 
000371 | 4. **Check Storage:**
000372 |    - In service worker console:
000373 |      ```javascript
000374 |      chrome.storage.local.get(null, (data) => {
000375 |        console.log('Local storage:', Object.keys(data));
000376 |        // Should include 'currentGame', possibly 'gameHistory'
000377 |      });
000378 | 
000379 |      chrome.storage.sync.get(null, (data) => {
000380 |        console.log('Sync storage:', data);
000381 |        // Should include settings like 'difficulty', 'gridSize', etc.
000382 |      });
000383 |      ```
000384 | 
000385 | 5. **Test Message Passing:**
000386 |    - In popup console, send test message:
000387 |      ```javascript
000388 |      chrome.runtime.sendMessage({
000389 |        type: 'GET_GAME_STATE'
000390 |      }, (response) => {
000391 |        console.log('Game state:', response);
000392 |      });
000393 |      ```
000394 |    - Verify response contains valid game state
000395 | 
000396 | ### 5.4 Existing Unit Tests
000397 | 
000398 | **Steps:**
000399 | 1. Run test suite:
000400 |    ```bash
000401 |    npm test
000402 |    ```
000403 | 2. Verify all tests pass (target: 106+ tests)
000404 | 3. Check coverage report:
000405 |    ```bash
000406 |    npm run test:coverage
000407 |    ```
000408 | 4. Open `coverage/index.html` in browser
000409 | 5. Verify core game logic has >80% coverage
000410 | 
000411 | ### ✅ Success Criteria:
000412 | - Popup loads and all game features work
000413 | - Game state persists across popup sessions
000414 | - Timer continues in background accurately
000415 | - Options page loads and settings persist
000416 | - Settings apply to game correctly
000417 | - Service worker has no console errors
000418 | - Alarms created/cleared appropriately
000419 | - Storage contains expected game data
000420 | - Message passing works between popup/background
000421 | - All unit tests pass
000422 | <!-- </anchor:0x2006> -->
000423 | 
000424 | ---
000425 | 
000426 | <!-- <anchor:0x2007> -->
000427 | ## Test 6: Cross-Browser Session Testing
000428 | 
000429 | **Objective:** Verify extension survives various browser lifecycle events.
000430 | 
000431 | ### 6.1 Browser Restart Test
000432 | 
000433 | **Steps:**
000434 | 1. Start a game (make several moves)
000435 | 2. Close popup
000436 | 3. Close all Chrome windows (completely quit Chrome)
000437 | 4. Reopen Chrome
000438 | 5. Click extension icon
000439 | 6. Verify game state restored
000440 | 
000441 | ### 6.2 Service Worker Restart Test
000442 | 
000443 | **Steps:**
000444 | 1. Open service worker DevTools
000445 | 2. Note current service worker ID
000446 | 3. Wait for service worker to go inactive (may take 30s - 5min of inactivity)
000447 | 4. Or manually stop: In `chrome://serviceworker-internals`, find MindSweeper, click "Stop"
000448 | 5. Open popup (triggers service worker restart)
000449 | 6. Verify game state loads correctly
000450 | 7. Check service worker console for clean initialization
000451 | 
000452 | ### 6.3 Extension Reload Test
000453 | 
000454 | **Steps:**
000455 | 1. Start a game (make moves)
000456 | 2. Go to `chrome://extensions`
000457 | 3. Click reload button (circular arrow) on MindSweeper extension
000458 | 4. Open popup
000459 | 5. Verify game state restored (extension reload preserves storage)
000460 | 
000461 | ### 6.4 Multiple Popup Instances Test
000462 | 
000463 | **Steps:**
000464 | 1. Open popup by clicking extension icon
000465 | 2. While popup is open, open options page
000466 | 3. Change settings in options
000467 | 4. Verify popup reflects changes (if real-time sync implemented)
000468 | 5. Make moves in popup
000469 | 6. Close popup
000470 | 7. Open full-page mode (index.html in new tab)
000471 | 8. Verify same game state
000472 | 
000473 | ### ✅ Success Criteria:
000474 | - Game state persists through browser restart
000475 | - Service worker reinitializes correctly after stop/timeout
000476 | - Extension reload preserves game data
000477 | - Multiple instances can coexist and stay in sync
000478 | <!-- </anchor:0x2007> -->
000479 | 
000480 | ---
000481 | 
000482 | <!-- <anchor:0x2008> -->
000483 | ## Test 7: Error Handling & Edge Cases
000484 | 
000485 | **Objective:** Verify extension handles errors gracefully.
000486 | 
000487 | ### 7.1 Storage Quota Exceeded
000488 | 
000489 | **Steps:**
000490 | 1. Open service worker console
000491 | 2. Attempt to write large data:
000492 |    ```javascript
000493 |    const largeData = { huge: 'x'.repeat(10 * 1024 * 1024) }; // 10MB
000494 |    chrome.storage.local.set(largeData, () => {
000495 |      if (chrome.runtime.lastError) {
000496 |        console.log('Expected error:', chrome.runtime.lastError);
000497 |      }
000498 |    });
000499 |    ```
000500 | 3. Verify error is caught and logged
000501 | 4. Verify game still functions after error
000502 | 
000503 | ### 7.2 Corrupted Storage Data
000504 | 
000505 | **Steps:**
000506 | 1. Open service worker console
000507 | 2. Corrupt game state:
000508 |    ```javascript
000509 |    chrome.storage.local.set({ currentGame: 'invalid json' });
000510 |    ```
000511 | 3. Reload extension
000512 | 4. Open popup
000513 | 5. Verify extension handles gracefully (shows new game or error message)
000514 | 
000515 | ### 7.3 Service Worker Unavailable
000516 | 
000517 | **Steps:**
000518 | 1. In `chrome://serviceworker-internals`, stop MindSweeper service worker
000519 | 2. Immediately open popup
000520 | 3. Verify popup shows loading state or "Starting..." message
000521 | 4. Wait for service worker to restart
000522 | 5. Verify popup loads correctly once worker is ready
000523 | 
000524 | ### 7.4 Invalid User Input in Options
000525 | 
000526 | **Steps:**
000527 | 1. Open options page
000528 | 2. Select "Custom" difficulty
000529 | 3. Try invalid inputs:
000530 |    - Grid size: 0, -5, 1000
000531 |    - Mine count: -1, 0, more than grid cells
000532 | 4. Verify validation errors shown
000533 | 5. Verify settings don't save with invalid values
000534 | 
000535 | ### ✅ Success Criteria:
000536 | - Storage errors caught and don't crash extension
000537 | - Corrupted data handled with fallback to new game
000538 | - Popup handles service worker not ready state
000539 | - Options page validates input and prevents invalid settings
000540 | <!-- </anchor:0x2008> -->
000541 | 
000542 | ---
000543 | 
000544 | <!-- <anchor:0x2009> -->
000545 | ## Test Summary Checklist
000546 | 
000547 | Use this checklist to verify all Phase 05 objectives are met:
000548 | 
000549 | ### Permissions (Test 1)
000550 | - [ ] Only "storage" and "alarms" permissions requested
000551 | - [ ] No host permissions or unnecessary permissions
000552 | - [ ] Permissions documented in PERMISSIONS.md
000553 | 
000554 | ### Offline Functionality (Tests 2-3)
000555 | - [ ] All game features work with network disabled
000556 | - [ ] No failed network requests
000557 | - [ ] Game state persists offline
000558 | - [ ] Settings save offline (sync queues)
000559 | - [ ] Graceful online/offline transitions
000560 | 
000561 | ### Manifest Validation (Test 4)
000562 | - [ ] No errors in chrome://extensions
000563 | - [ ] Manifest v3 compliant
000564 | - [ ] All icons present and valid
000565 | - [ ] Runtime manifest checks pass
000566 | 
000567 | ### Extension Functionality (Tests 5-6)
000568 | - [ ] Popup loads and game works
000569 | - [ ] State persists across popup close/reopen
000570 | - [ ] Timer continues in background
000571 | - [ ] Options page works and settings persist
000572 | - [ ] Service worker initializes without errors
000573 | - [ ] Alarms created/cleared correctly
000574 | - [ ] Storage contains correct data
000575 | - [ ] Message passing works
000576 | - [ ] All unit tests pass
000577 | - [ ] Extension survives browser restart
000578 | - [ ] Service worker recovers from stop/restart
000579 | 
000580 | ### Error Handling (Test 7)
000581 | - [ ] Storage quota errors handled
000582 | - [ ] Corrupted data handled gracefully
000583 | - [ ] Service worker unavailable handled
000584 | - [ ] Invalid user input validated
000585 | 
000586 | ### Documentation
000587 | - [ ] PERMISSIONS.md exists and complete
000588 | - [ ] PHASE_05_TESTING.md exists (this file)
000589 | - [ ] All test results documented or logged
000590 | 
000591 | ### Final Sign-Off
000592 | - [ ] All critical tests passed
000593 | - [ ] No blocking bugs found
000594 | - [ ] Extension ready for Phase 06 or user testing
000595 | - [ ] Test Date: _______________
000596 | - [ ] Tested By: _______________
000597 | <!-- </anchor:0x2009> -->
000598 | 
000599 | ---
000600 | 
000601 | <!-- <anchor:0x200A> -->
000602 | ## Automated Test Script
000603 | 
000604 | For developers, use this script to automate common checks:
000605 | 
000606 | ```bash
000607 | #!/bin/bash
000608 | # phase05-test.sh - Automated testing script for Phase 05
000609 | 
000610 | set -e  # Exit on error
000611 | 
000612 | echo "=== Phase 05: MindSweeper Extension Testing ==="
000613 | echo ""
000614 | 
000615 | echo "Step 1: Clean and rebuild..."
000616 | rm -rf dist/
000617 | npm run build
000618 | echo "✅ Build complete"
000619 | echo ""
000620 | 
000621 | echo "Step 2: Run unit tests..."
000622 | npm test
000623 | echo "✅ Unit tests passed"
000624 | echo ""
000625 | 
000626 | echo "Step 3: Verify build artifacts..."
000627 | if [ ! -d "dist/" ]; then
000628 |   echo "❌ dist/ folder missing"
000629 |   exit 1
000630 | fi
000631 | 
000632 | if [ ! -f "dist/manifest.json" ]; then
000633 |   echo "❌ manifest.json not found in dist/"
000634 |   exit 1
000635 | fi
000636 | 
000637 | echo "✅ Build artifacts present"
000638 | echo ""
000639 | 
000640 | echo "Step 4: Validate manifest permissions..."
000641 | if grep -q '"permissions"' dist/manifest.json; then
000642 |   echo "Permissions found in manifest"
000643 |   grep '"permissions"' -A 5 dist/manifest.json
000644 | else
000645 |   echo "❌ Permissions not found in manifest"
000646 |   exit 1
000647 | fi
000648 | echo ""
000649 | 
000650 | echo "Step 5: Check icon files..."
000651 | for size in 16 48 128; do
000652 |   if [ -f "public/icon${size}.png" ]; then
000653 |     echo "✅ icon${size}.png found"
000654 |   else
000655 |     echo "❌ icon${size}.png missing"
000656 |     exit 1
000657 |   fi
000658 | done
000659 | echo ""
000660 | 
000661 | echo "=== Automated checks complete! ==="
000662 | echo ""
000663 | echo "Next steps:"
000664 | echo "1. Load dist/ folder in chrome://extensions"
000665 | echo "2. Run manual tests from PHASE_05_TESTING.md"
000666 | echo "3. Test offline functionality"
000667 | echo "4. Verify all features work in popup and options page"
000668 | ```
000669 | 
000670 | Save as `scripts/phase05-test.sh` and run:
000671 | ```bash
000672 | chmod +x scripts/phase05-test.sh
000673 | ./scripts/phase05-test.sh
000674 | ```
000675 | <!-- </anchor:0x200A> -->
000676 | 
000677 | ---
000678 | 
000679 | ## Notes
000680 | 
000681 | - **Test Environment:** Chrome version 120+ recommended (Manifest v3 stable support)
000682 | - **Test Duration:** Allow ~30-45 minutes for comprehensive manual testing
000683 | - **Automation:** Most tests are manual due to Chrome extension APIs limitations
000684 | - **Known Limitations:** 
000685 |   - Service worker DevTools may disconnect when worker goes inactive
000686 |   - Popup closes when clicking outside (by design)
000687 |   - chrome.storage.sync requires Chrome sign-in for cross-device sync
000688 | 
000689 | ---
000690 | 
000691 | **Document Version:** 1.0
000692 | **Phase:** 05 - Permissions & Testing
000693 | **Plan Reference:** `/tmp/02 - plan.md` Phase 5
000694 | **Date:** 2026-02-20
