000001 | # Phase 01: Responsive Foundation Testing Checklist
000002 | 
000003 | **Section**: 3 - UI/UX and Accessibility  
000004 | **Phase**: 01 - Responsive Foundation (Issue 03-01)  
000005 | **Date**: February 20, 2026
000006 | 
000007 | // <anchor:0xR001>
000008 | ## Overview
000009 | 
000010 | This checklist validates responsive design implementation across mobile to desktop viewports.
000011 | Testing ensures WCAG 2.1 Level AAA compliance (44×44px touch targets) and responsive 
000012 | breakpoints at 320px, 375px, 480px, 768px, and 1024px+ screen widths.
000013 | // </anchor:0xR001>
000014 | 
000015 | // <anchor:0xR002>
000016 | ## Test Environment Setup
000017 | 
000018 | ### Required Tools
000019 | 
000020 | - **Chrome DevTools**: Device Toolbar (Cmd+Shift+M on Mac)
000021 | - **Device Emulation**: iPhone SE, iPhone 12, iPad, Desktop
000022 | - **Touch Emulation**: Enable in DevTools Settings
000023 | - **Measurement Tool**: Rulers & Guides in Inspect Mode
000024 | 
000025 | ### Extension Contexts to Test
000026 | 
000027 | 1. **Popup Mode**: 400×600px Chrome extension popup
000028 | 2. **Full Page Mode**: Opened via chrome.tabs.create
000029 | 3. **Options Page**: Chrome extension settings page
000030 | 
000031 | ### Test Board Configurations
000032 | 
000033 | - **Easy**: 8×8 grid, 10 mines
000034 | - **Medium**: 16×16 grid, 40 mines
000035 | - **Hard**: 30×16 grid, 99 mines
000036 | - **Custom Small**: 5×5 grid
000037 | - **Custom Large**: 50×50 grid (stress test)
000038 | // </anchor:0xR002>
000039 | 
000040 | // <anchor:0xR003>
000041 | ## Breakpoint Testing Matrix
000042 | 
000043 | ### 320px Width (iPhone SE Portrait)
000044 | 
000045 | **Expected Behavior:**
000046 | - [ ] Cells render at 28×28px (visual size)
000047 | - [ ] Touch target padding maintains 44×44px minimum
000048 | - [ ] Board gap: 1px between cells
000049 | - [ ] Font size: 12px for cell numbers
000050 | - [ ] StatusBar stacks vertically
000051 | - [ ] StatusBar font: 12px labels, 14px values
000052 | - [ ] No horizontal scrolling
000053 | - [ ] All text remains readable
000054 | - [ ] Controls buttons maintain 48×48px minimum
000055 | - [ ] GameSetup mode selectors stack vertically
000056 | 
000057 | **Test Steps:**
000058 | 1. Open DevTools, set viewport to 320×568px
000059 | 2. Load popup in new tab (index.html)
000060 | 3. Start Easy game (8×8)
000061 | 4. Verify board fits without horizontal scroll
000062 | 5. Use Measure tool to verify cell touch targets ≥44px
000063 | 6. Tap cells with touch emulation enabled
000064 | 7. Verify StatusBar displays correctly
000065 | 8. Test Controls (Undo/Redo) buttons - minimum 48px height
000066 | 9. Open GameSetup, verify inputs are 44px minimum height
000067 | 10. Check all interactive elements for WCAG compliance
000068 | 
000069 | ### 375px Width (iPhone 12 Portrait)
000070 | 
000071 | **Expected Behavior:**
000072 | - [ ] Cells render at 32×32px (visual size)
000073 | - [ ] Touch target padding maintains 44×44px
000074 | - [ ] Board gap: 1px
000075 | - [ ] Font size: 13px for cell numbers
000076 | - [ ] StatusBar stacks vertically, font 13px
000077 | - [ ] Controls retain full button text (Undo/Redo)
000078 | - [ ] Medium game (16×16) should scale appropriately
000079 | - [ ] No horizontal scrolling
000080 | 
000081 | **Test Steps:**
000082 | 1. Set viewport to 375×667px
000083 | 2. Test Easy, Medium board sizes
000084 | 3. Verify scaling calculation in popup mode
000085 | 4. Measure touch targets with DevTools
000086 | 5. Test long-press flag action on touch
000087 | 6. Navigate GameSetup with touch
000088 | 
000089 | ### 480px Width (Large Phone Landscape)
000090 | 
000091 | **Expected Behavior:**
000092 | - [ ] Cells render at 36×36px
000093 | - [ ] Touch targets maintain 44×44px minimum
000094 | - [ ] Font size: 14px for cells
000095 | - [ ] StatusBar may remain horizontal or stack
000096 | - [ ] Controls buttons: 48×48px minimum
000097 | - [ ] Hard game (30×16) should be accessible
000098 | 
000099 | **Test Steps:**
000100 | 1. Set viewport to 480×320px (landscape)
000101 | 2. Test all difficulty presets
000102 | 3. Verify horizontal layout stability
000103 | 4. Check StatusBar orientation
000104 | 5. Test keyboard navigation (if available)
000105 | 
000106 | ### 768px Width (iPad Portrait)
000107 | 
000108 | **Expected Behavior:**
000109 | - [ ] Cells render at 36×36px
000110 | - [ ] Touch targets: 44×44px
000111 | - [ ] Font size: 16px
000112 | - [ ] StatusBar horizontal layout
000113 | - [ ] Controls show full button labels
000114 | - [ ] Large boards (30×16) render well
000115 | - [ ] GameSetup in horizontal layout
000116 | 
000117 | **Test Steps:**
000118 | 1. Set viewport to 768×1024px
000119 | 2. Test Hard game board
000120 | 3. Verify no scaling artifacts
000121 | 4. Test both portrait and landscape
000122 | 5. Verify touch interactions
000123 | 
000124 | ### 1024px+ Width (Desktop)
000125 | 
000126 | **Expected Behavior:**
000127 | - [ ] Cells render at full 44×44px
000128 | - [ ] No scaling applied
000129 | - [ ] Font size: 18px
000130 | - [ ] StatusBar full horizontal layout
000131 | - [ ] Controls buttons: 44×44px (default)
000132 | - [ ] Custom 50×50 boards should render (with scroll)
000133 | - [ ] Optimal user experience
000134 | 
000135 | **Test Steps:**
000136 | 1. Set viewport to 1920×1080px
000137 | 2. Test all board sizes including custom large
000138 | 3. Verify layout centering
000139 | 4. Check StatusBar symmetry
000140 | 5. Verify no unnecessary scrolling
000141 | // </anchor:0xR003>
000142 | 
000143 | // <anchor:0xR004>
000144 | ## Touch Target Audit
000145 | 
000146 | ### WCAG 2.1 Level AAA Compliance (44×44px minimum)
000147 | 
000148 | **Elements to Measure:**
000149 | 
000150 | #### Board Cells
000151 | - [ ] Hidden cells: ≥44×44px touch area (may use padding)
000152 | - [ ] Revealed cells: ≥44×44px maintained
000153 | - [ ] Flagged cells: ≥44×44px maintained
000154 | - [ ] Focused cells: ≥44×44px with visible outline
000155 | 
000156 | #### Controls Component
000157 | - [ ] Undo button: ≥48×48px on mobile, ≥44×44px desktop
000158 | - [ ] Redo button: ≥48×48px on mobile, ≥44×44px desktop
000159 | - [ ] Buttons maintain size when disabled
000160 | - [ ] Gap between buttons ≥8px
000161 | 
000162 | #### GameSetup Component
000163 | - [ ] Preset radio buttons: ≥44×44px hit area
000164 | - [ ] Custom config inputs: ≥44px height
000165 | - [ ] Start Game button: ≥48×48px
000166 | - [ ] Mode selector radio buttons: ≥44×44px
000167 | 
000168 | #### Popup UI Elements
000169 | - [ ] Settings button (⚙️): ≥44×44px
000170 | - [ ] New Game button: ≥44×44px
000171 | - [ ] "Open Full Page" button: ≥36×36px (secondary action)
000172 | - [ ] End Game Modal buttons: ≥44×44px
000173 | 
000174 | #### StatusBar
000175 | - [ ] Overall height: ≥60px for finger-friendly spacing
000176 | - [ ] Padding provides adequate touch spacing
000177 | - [ ] Values are not interactive but readable
000178 | 
000179 | **Measurement Method:**
000180 | 1. Enable DevTools Inspect Mode
000181 | 2. Hover over element
000182 | 3. Check computed dimensions in overlay
000183 | 4. Verify `min-width` and `min-height` in Styles panel
000184 | 5. Test actual touch interaction with emulation
000185 | // </anchor:0xR004>
000186 | 
000187 | // <anchor:0xR005>
000188 | ## Popup Scaling Logic Testing
000189 | 
000190 | ### Scenario 1: Easy Game (8×8) in 400×600px Popup
000191 | 
000192 | - [ ] Board scale = 1.0 (no scaling needed)
000193 | - [ ] Board centered horizontally
000194 | - [ ] No "Open Full Page" button shown (unless scale < 1)
000195 | - [ ] All UI chrome visible (Header, StatusBar, Controls)
000196 | - [ ] No vertical scrolling required
000197 | 
000198 | ### Scenario 2: Medium Game (16×16) in 400×600px Popup
000199 | 
000200 | - [ ] Board scale calculated to fit (likely 0.6-0.8)
000201 | - [ ] Board scaled down proportionally
000202 | - [ ] "Open Full Page" button appears
000203 | - [ ] StatusBar remains unscaled
000204 | - [ ] Controls remain unscaled
000205 | - [ ] Board transform-origin: top center
000206 | 
000207 | ### Scenario 3: Hard Game (30×16) in 400×600px Popup
000208 | 
000209 | - [ ] Board scale ≥0.4 (minimum usability)
000210 | - [ ] Horizontal fit maintained
000211 | - [ ] "Open Full Page" button prominently shown
000212 | - [ ] Button has icon and clear text
000213 | - [ ] Clicking opens full page in new tab
000214 | - [ ] Game state persists after opening full page
000215 | 
000216 | ### Scenario 4: Custom Large (50×50) in Popup
000217 | 
000218 | - [ ] Board scales to minimum 0.4
000219 | - [ ] Warning about better experience in full page
000220 | - [ ] All interactions still functional despite small size
000221 | - [ ] StatusBar and Controls remain accessible
000222 | 
000223 | **Test Calculation Accuracy:**
000224 | ```javascript
000225 | // Expected formula verification
000226 | const popupWidth = 400;
000227 | const popupHeight = 600;
000228 | const headerHeight = 50;
000229 | const statusBarHeight = 80;
000230 | const controlsHeight = 80;
000231 | const footerHeight = 40;
000232 | const padding = 20;
000233 | 
000234 | const availableWidth = popupWidth - (padding * 2); // 360px
000235 | const availableHeight = popupHeight - headerHeight - statusBarHeight 
000236 |                         - controlsHeight - footerHeight; // 350px
000237 | 
000238 | const cellSize = 44;
000239 | const gap = 1;
000240 | const boardPadding = 4;
000241 | 
000242 | // For 16×16 board:
000243 | const boardWidth = 16 * 44 + 15 * 1 + 4 = 723px
000244 | const scale = Math.min(1, 360 / 723) = 0.498 ≈ 0.5
000245 | ```
000246 | // </anchor:0xR005>
000247 | 
000248 | // <anchor:0xR006>
000249 | ## No Horizontal Scroll Verification
000250 | 
000251 | ### Test Procedure
000252 | 
000253 | For each breakpoint (320px, 375px, 480px, 768px, 1024px):
000254 | 
000255 | 1. **Visual Check:**
000256 |    - [ ] Set viewport width exactly
000257 |    - [ ] Load game in full-page mode
000258 |    - [ ] Scroll horizontally - should not move
000259 |    - [ ] Load popup mode - should not scroll
000260 | 
000261 | 2. **Computed Style Check:**
000262 |    - [ ] Open DevTools Console
000263 |    - [ ] Run: `document.body.scrollWidth <= window.innerWidth`
000264 |    - [ ] Should return `true`
000265 |    - [ ] Check for `overflow-x: hidden` not masking issues
000266 | 
000267 | 3. **Edge Case Testing:**
000268 |    - [ ] Test with longest status bar text (999 seconds, 99 mines)
000269 |    - [ ] Test with GameSetup showing validation error (long message)
000270 |    - [ ] Test EndGameModal with long time display
000271 |    - [ ] All should remain within viewport width
000272 | 
000273 | 4. **Dynamic Width Test:**
000274 |    - [ ] Slowly resize browser from 1920px down to 320px
000275 |    - [ ] Watch for any breakpoint where horizontal scroll appears
000276 |    - [ ] Note any layout shifts or jumps
000277 |    - [ ] Verify smooth responsive transitions
000278 | // </anchor:0xR006>
000279 | 
000280 | // <anchor:0xR007>
000281 | ## Text Readability Check
000282 | 
000283 | ### Font Size Verification
000284 | 
000285 | **Minimum Legible Sizes:**
000286 | - Body text: ≥12px (acceptable for small screens)
000287 | - Interactive labels: ≥14px
000288 | - Primary headings: ≥18px
000289 | 
000290 | **Breakpoint Font Sizes:**
000291 | 
000292 | | Viewport | Cell Numbers | StatusBar | Controls | Headings |
000293 | |----------|--------------|-----------|----------|----------|
000294 | | 320px    | 12px         | 12px      | 12px     | 18px     |
000295 | | 375px    | 13px         | 13px      | 12px     | 18px     |
000296 | | 480px    | 14px         | 14px      | 14px     | 20px     |
000297 | | 768px    | 16px         | 16px      | 14px     | 20px     |
000298 | | 1024px+  | 18px         | 18px      | 16px     | 24px     |
000299 | 
000300 | ### Contrast & Clarity
000301 | 
000302 | - [ ] Cell numbers (1-8) readable at all sizes
000303 | - [ ] StatusBar values readable on dark background
000304 | - [ ] Button labels readable on all backgrounds
000305 | - [ ] Error messages readable in GameSetup
000306 | - [ ] End Game Modal text readable
000307 | - [ ] No text truncation at any breakpoint
000308 | - [ ] Line-height provides adequate spacing
000309 | 
000310 | ### Accessibility Testing
000311 | 
000312 | - [ ] Test with Chrome's "Render all text in Device Font" (increases legibility)
000313 | - [ ] Zoom to 200% - text should remain readable, not overlap
000314 | - [ ] Enable large text OS setting - UI should adapt
000315 | - [ ] Test with inverted colors (accessibility setting)
000316 | // </anchor:0xR007>
000317 | 
000318 | // <anchor:0xR008>
000319 | ## Cross-Context Testing
000320 | 
000321 | ### Popup Mode (400×600px)
000322 | 
000323 | - [ ] Extension popup opens correctly
000324 | - [ ] Scaling applies to large boards
000325 | - [ ] "Open Full Page" button functional
000326 | - [ ] Game state persists when reopening popup
000327 | - [ ] Touch targets meet WCAG minimum
000328 | - [ ] StatusBar displays correctly in compact mode
000329 | 
000330 | ### Full Page Mode
000331 | 
000332 | - [ ] Opens via popup button click
000333 | - [ ] Opens via browser action (clicking extension icon → full page)
000334 | - [ ] Responsive at all breakpoints (320px to 1920px+)
000335 | - [ ] Large boards (30×16, custom 50×50) render well
000336 | - [ ] No scaling applied (full native size)
000337 | - [ ] Game state synchronized from popup
000338 | 
000339 | ### Options Page
000340 | 
000341 | - [ ] Opens via settings button in popup
000342 | - [ ] Opens via chrome://extensions (Options link)
000343 | - [ ] Responsive down to 320px width
000344 | - [ ] Form inputs meet 44px minimum height
000345 | - [ ] Theme controls accessible
000346 | - [ ] Sound controls accessible
000347 | - [ ] Changes persist correctly
000348 | // </anchor:0xR008>
000349 | 
000350 | // <anchor:0xR009>
000351 | ## Device Testing Matrix
000352 | 
000353 | ### Physical Device Testing (Recommended)
000354 | 
000355 | If possible, test on real devices to validate touch interactions:
000356 | 
000357 | #### Mobile Phones
000358 | - [ ] iPhone SE (320×568px) - Portrait & Landscape
000359 | - [ ] iPhone 12/13 (375×667px) - Portrait & Landscape  
000360 | - [ ] Samsung Galaxy S21 (360×800px) - Portrait only
000361 | - [ ] Pixel 5 (393×851px) - Portrait only
000362 | 
000363 | #### Tablets
000364 | - [ ] iPad (768×1024px) - Portrait & Landscape
000365 | - [ ] iPad Pro 11" (834×1194px) - Portrait & Landscape
000366 | - [ ] Samsung Galaxy Tab (800×1280px) - Portrait & Landscape
000367 | 
000368 | #### Desktop Browsers
000369 | - [ ] Chrome (latest) - 1920×1080px, 1440×900px
000370 | - [ ] Edge (latest) - 1920×1080px
000371 | - [ ] Safari (if available) - 1440×900px
000372 | 
000373 | ### Emulation Testing (DevTools)
000374 | 
000375 | - [ ] Chrome DevTools → Enable all device profiles
000376 | - [ ] Test with touch emulation ON
000377 | - [ ] Test with touch emulation OFF (mouse interactions)
000378 | - [ ] Toggle device orientation (portrait ↔ landscape)
000379 | - [ ] Verify media queries trigger at correct breakpoints
000380 | 
000381 | ### Real-World Scenarios
000382 | 
000383 | - [ ] "Fat finger" test - tap near cells, not center
000384 | - [ ] Rapid tapping - verify no missed inputs
000385 | - [ ] Long-press for flag - should work consistently
000386 | - [ ] Two-finger zoom - should be disabled on game board
000387 | - [ ] Orientation change during game - state persists
000388 | // </anchor:0xR009>
000389 | 
000390 | // <anchor:0xR010>
000391 | ## Screenshot Documentation
000392 | 
000393 | ### Required Screenshots for QA
000394 | 
000395 | Capture screenshots of the following for documentation:
000396 | 
000397 | 1. **320px - Easy Game**
000398 |    - Popup mode (if applicable)
000399 |    - Full page mode
000400 |    - GameSetup screen
000401 | 
000402 | 2. **375px - Medium Game**
000403 |    - Board playing state
000404 |    - StatusBar close-up
000405 |    - Controls section
000406 | 
000407 | 3. **480px - Hard Game**
000408 |    - Full layout
000409 |    - Scaled board in popup
000410 |    - Full page comparison
000411 | 
000412 | 4. **768px - Custom Large Board**
000413 |    - Full game view
000414 |    - Touch target measurement overlay
000415 | 
000416 | 5. **1024px+ - Desktop View**
000417 |    - Optimal experience
000418 |    - All UI elements visible
000419 | 
000420 | ### Screenshot Naming Convention
000421 | 
000422 | ```
000423 | phase01_responsive_[viewport]_[context]_[element].png
000424 | 
000425 | Examples:
000426 | - phase01_responsive_320px_popup_easy_game.png
000427 | - phase01_responsive_375px_fullpage_medium_board.png
000428 | - phase01_responsive_768px_popup_statusbar.png
000429 | ```
000430 | 
000431 | ### Storage Location
000432 | 
000433 | Save all screenshots to: `tmp/testing/phase01_screenshots/`
000434 | // </anchor:0xR010>
000435 | 
000436 | // <anchor:0xR011>
000437 | ## Sign-Off Checklist
000438 | 
000439 | ### Acceptance Criteria Met
000440 | 
000441 | - [ ] All 5 breakpoints (320px, 375px, 480px, 768px, 1024px+) tested
000442 | - [ ] Touch targets ≥44×44px verified with DevTools measurement
000443 | - [ ] No horizontal scrolling at any tested viewport width
000444 | - [ ] Popup scaling logic correctly calculates board fit
000445 | - [ ] "Open Full Page" button visible and functional for large boards
000446 | - [ ] GameSetup inputs meet 44px minimum height
000447 | - [ ] Controls buttons maintain 48×48px on mobile
000448 | - [ ] StatusBar provides finger-friendly spacing
000449 | - [ ] All text remains readable at smallest viewport
000450 | - [ ] Font sizes scale appropriately per breakpoint
000451 | 
000452 | ### Performance & Polish
000453 | 
000454 | - [ ] No layout shifts during resize
000455 | - [ ] Smooth CSS transitions (if not reduced-motion)
000456 | - [ ] No console errors related to responsive issues
000457 | - [ ] Game state persists across context switches
000458 | - [ ] Touch interactions feel natural (real device)
000459 | 
000460 | ### Documentation
000461 | 
000462 | - [ ] Screenshots captured for all major breakpoints
000463 | - [ ] Issues logged in GitHub/tracking system
000464 | - [ ] This checklist completed and saved
000465 | - [ ] Ready for Phase 02 (Theming System)
000466 | // </anchor:0xR011>
000467 | 
000468 | // <anchor:0xR012>
000469 | ## Known Issues & Limitations
000470 | 
000471 | Document any discovered issues here:
000472 | 
000473 | ### Issue Template
000474 | 
000475 | ```markdown
000476 | **Issue**: [Brief description]
000477 | **Viewport**: [Where observed]
000478 | **Severity**: [Critical/High/Medium/Low]
000479 | **Steps to Reproduce**:
000480 | 1. [Step one]
000481 | 2. [Step two]
000482 | **Expected**: [What should happen]
000483 | **Actual**: [What actually happens]
000484 | **Workaround**: [If applicable]
000485 | **Fix Required**: [Yes/No/Future]
000486 | ```
000487 | 
000488 | ### Known Limitations
000489 | 
000490 | - Cells below 28px (320px viewport) may be challenging for users with motor impairments
000491 |   - Mitigation: Touch target padding extends to 44px minimum
000492 |   - Recommendation: "Open Full Page" button for better experience
000493 | 
000494 | - Popup context (400×600px) constrains large boards significantly
000495 |   - Mitigation: Prominent "Open Full Page" button with icon
000496 |   - Board scales no smaller than 40% (0.4) for minimum usability
000497 | 
000498 | - Very long game times (e.g., 99:59) may wrap on 320px viewports
000499 |   - Acceptable: Game sessions rarely exceed 20 minutes
000500 |   - StatusBar stacks vertically to accommodate
000501 | // </anchor:0xR012>
000502 | 
000503 | ---
000504 | 
000505 | **Phase 01 Complete**: ✅  
000506 | **Next Phase**: [02 - Theming System](03-02-theming.md)  
000507 | **Section 3 Progress**: 1/6 issues complete
