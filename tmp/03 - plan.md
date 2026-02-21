000001 | # Section 3 Implementation Plan: UI/UX and Accessibility
000002 | 
000003 | **Project**: MindSweeper Browser Extension  
000004 | **Section**: 3 - UI/UX and Accessibility (6 issues, 21 story points)  
000005 | **Tech Stack**: TypeScript, React, CSS Modules, Chrome Extension APIs  
000006 | **Date**: February 20, 2026
000007 | 
000008 | // <anchor:0xA001>
000009 | ## Overview
000010 | 
000011 | Section 3 refines the Chrome extension's user experience with responsive design, theming, full accessibility, smooth animations, and optional audio. Core gameplay (Section 1) and extension infrastructure (Section 2) are complete. Current codebase has strong accessibility foundations—keyboard navigation and ARIA labels already work—but lacks theming infrastructure, mobile-optimized touch targets, enhanced animations, and any audio system. This section makes the extension production-ready for diverse users and contexts.
000012 | 
000013 | **Architecture approach**: CSS Variables for theming with system preference detection, enhanced responsive breakpoints for 320px-1024px, keyboard trap for modals, polished CSS animations respecting `prefers-reduced-motion`, and lightweight audio manager with graceful fallbacks. Theme and sound preferences persist via existing chrome.storage.sync infrastructure.
000014 | // </anchor:0xA001>
000015 | 
000016 | // <anchor:0xA002>
000017 | ## Current State Assessment
000018 | 
000019 | ### ✅ Strengths
000020 | 
000021 | - **Responsive foundation exists**: Breakpoints at 480px, 768px with cell scaling (44px → 32px)
000022 | - **Keyboard navigation complete**: Arrow keys, Space/Enter, F for flag, C for chord all working
000023 | - **ARIA labels implemented**: Cells have descriptive labels, live region for status updates
000024 | - **Storage infrastructure ready**: chrome.storage.sync supports theme/sound preferences
000025 | - **Options page scaffolded**: Theme and sound controls present but disabled
000026 | - **Basic animations exist**: Button transitions, modal slide-in, respects `prefers-reduced-motion`
000027 | - **Popup scaling working**: Dynamic scale calculation for large grids in 400×600px popup
000028 | 
000029 | ### ⚠️ Gaps to Address
000030 | 
000031 | - **Missing mobile breakpoints**: No 320px or 375px support required by acceptance criteria
000032 | - **Touch target non-compliance**: Cells reduce to 32px on mobile (below WCAG 44px minimum)
000033 | - **No theming system**: Colors hardcoded, no CSS variables or theme switching logic
000034 | - **Limited animations**: No reveal/flag animations, basic win/loss effects
000035 | - **No audio infrastructure**: Zero sound effects or audio management code
000036 | - **Keyboard help missing**: Shortcuts not discoverable in UI
000037 | - **Modal focus traps needed**: EndGameModal doesn't trap focus for accessibility
000038 | // </anchor:0xA002>
000039 | 
000040 | // <anchor:0xA003>
000041 | ## Architecture Decisions
000042 | 
000043 | - **CSS Variables over CSS-in-JS**: CSS Modules + custom properties are sufficient, performant, and easier to debug than runtime styling
000044 | - **Theming scope**: Three themes (light/dark/colorblind) to keep scope manageable and ensure quality
000045 | - **Keyboard/ARIA together**: Issues 03-03 and 03-04 have circular dependency—implement in same phase
000046 | - **Animation approach**: Pure CSS with @keyframes, no JavaScript libraries to minimize bundle size
000047 | - **Audio implementation**: Native HTMLAudioElement without libraries, lightweight assets for offline capability
000048 | - **Reduced motion priority**: Respect user preferences by default; optional override in settings
000049 | - **No confetti library**: CSS-only celebration animation to avoid dependencies and keep bundle lean
000050 | // </anchor:0xA003>
000051 | 
000052 | // <anchor:0xA101>
000053 | ## Phase 1: Responsive Foundation (03-01)
000054 | 
000055 | **Goal**: Ensure UI works seamlessly from 320px mobile to 1024+ desktop, meet WCAG touch target minimums
000056 | 
000057 | ### Step 1: Add missing mobile breakpoints
000058 | 
000059 | **File**: [src/styles/Board.module.css](src/styles/Board.module.css)
000060 | 
000061 | - Add 320px breakpoint with 28px cells (minimum for usability)
000062 | - Add 375px breakpoint with 32px cells  
000063 | - Ensure 1px gaps scale proportionally
000064 | - Verify no horizontal scroll at any tested width
000065 | - Test with Chrome DevTools device emulation
000066 | 
000067 | **Rationale**: Acceptance criteria require explicit testing at 320px and 375px. Current smallest breakpoint is 480px.
000068 | 
000069 | ### Step 2: Touch target compliance
000070 | 
000071 | **Files**: 
000072 | - [src/components/Cell.tsx](src/components/Cell.tsx)
000073 | - [src/components/Controls.tsx](src/components/Controls.tsx)
000074 | - [src/components/StatusBar.tsx](src/components/StatusBar.tsx)
000075 | 
000076 | **Actions**:
000077 | - Enforce minimum 44×44px touch targets for all interactive elements at all breakpoints
000078 | - Increase Controls button size from current 40px to 48px minimum on mobile
000079 | - Add responsive padding to StatusBar for finger-friendly spacing
000080 | - Use padding vs changing actual cell size to maintain grid integrity
000081 | - Test with Chrome DevTools touch emulation and real devices
000082 | 
000083 | **Rationale**: WCAG 2.1 Level AAA requires 44×44px minimum. Current implementation drops to 32px on mobile.
000084 | 
000085 | ### Step 3: Enhance popup scaling logic
000086 | 
000087 | **File**: [src/popup/popup.tsx](src/popup/popup.tsx)
000088 | 
000089 | **Actions**:
000090 | - Refine scale calculation to account for StatusBar and Controls height (currently only board considered)
000091 | - Add max-width constraint to prevent over-scaling on large boards
000092 | - Improve "Open Full Page" link visibility and accessibility with clear icon/text
000093 | - Test with 8×8 (easy), 16×16 (medium), 30×16 (hard) grids in 400×600px popup
000094 | 
000095 | **Current logic**: Calculates board dimensions only. Doesn't reserve space for UI chrome.
000096 | 
000097 | ### Step 4: GameSetup responsive layout
000098 | 
000099 | **File**: [src/components/GameSetup.tsx](src/components/GameSetup.tsx)
000100 | 
000101 | **Actions**:
000102 | - Stack preset buttons vertically on <480px viewports
000103 | - Ensure custom config inputs are touch-friendly (minimum height 44px)
000104 | - Add responsive font sizing for labels (clamp or media queries)
000105 | - Test in both popup (400px) and full-page contexts
000106 | 
000107 | **Current state**: Horizontal button layout may overflow on narrow screens.
000108 | 
000109 | ### Step 5: Create responsive testing checklist
000110 | 
000111 | **Deliverable**: Manual test plan document
000112 | 
000113 | **Content**:
000114 | - Test matrix: 320px, 375px, 768px, 1024px viewports × portrait/landscape
000115 | - Touch target audit with DevTools measurement overlay
000116 | - Screenshot comparison across breakpoints
000117 | - No horizontal scroll verification
000118 | - Text readability check at all sizes
000119 | // </anchor:0xA101>
000120 | 
000121 | // <anchor:0xA102>
000122 | ## Phase 2: Theming System (03-02)
000123 | 
000124 | **Goal**: Implement light/dark/colorblind themes with system preference detection and persistence
000125 | 
000126 | ### Step 6: Define CSS custom properties architecture
000127 | 
000128 | **File**: [src/styles/index.css](src/styles/index.css)
000129 | 
000130 | **Actions**:
000131 | - Create `:root` with light theme variables (30-40 semantic tokens):
000132 |   - `--color-bg-primary`, `--color-bg-secondary`
000133 |   - `--color-cell-hidden`, `--color-cell-revealed`, `--color-cell-mine`
000134 |   - `--color-text-primary`, `--color-text-secondary`
000135 |   - `--color-number-1` through `--color-number-8`
000136 |   - `--color-border`, `--color-focus-ring`
000137 |   - `--color-button-primary`, `--color-button-hover`, `--color-button-disabled`
000138 | - Create `[data-theme="dark"]` selector with dark variants
000139 | - Create `[data-theme="colorblind"]` with WCAG-compliant number colors
000140 |   - Avoid red-green combinations (deuteranopia/protanopia)
000141 |   - Use blue-yellow-brown-purple palette
000142 | - Document color contrast ratios in comments
000143 | 
000144 | **Example structure**:
000145 | ```css
000146 | :root {
000147 |   --color-number-1: #0000ff; /* Blue - WCAG 4.5:1 */
000148 |   --color-number-2: #008000; /* Green */
000149 |   /* ... */
000150 | }
000151 | 
000152 | [data-theme="dark"] {
000153 |   --color-bg-primary: #1e1e1e;
000154 |   --color-text-primary: #ffffff;
000155 |   /* ... */
000156 | }
000157 | 
000158 | [data-theme="colorblind"] {
000159 |   --color-number-1: #0077bb; /* Blue */
000160 |   --color-number-2: #ee7733; /* Orange */
000161 |   --color-number-3: #cc3311; /* Red-brown */
000162 |   /* ... */
000163 | }
000164 | ```
000165 | 
000166 | ### Step 7: Refactor hardcoded colors
000167 | 
000168 | **Files**: All CSS modules in [src/styles/](src/styles/) and component folders
000169 | 
000170 | **Actions**:
000171 | - Replace hex colors in [Board.module.css](src/styles/Board.module.css) with `var(--color-*)` tokens
000172 | - Update [Game.module.css](src/styles/Game.module.css) background gradient to use theme variables
000173 | - Refactor [Controls.module.css](src/styles/Controls.module.css) button colors
000174 | - Update [popup.module.css](src/popup/popup.module.css) and [options.module.css](src/options/options.module.css)
000175 | - Refactor number colors (1-8) in Board.module.css `.cell-number-*` classes
000176 | - Ensure focus indicators and borders use `--color-focus-ring`
000177 | 
000178 | **Critical replacements**:
000179 | - Cell backgrounds: `#ccc` → `var(--color-cell-hidden)`
000180 | - Text colors: hardcoded hex → `var(--color-text-primary)`
000181 | - Button states: multiple hex values → semantic button variables
000182 | 
000183 | ### Step 8: Create theme provider logic
000184 | 
000185 | **New file**: [src/hooks/useTheme.ts](src/hooks/useTheme.ts)
000186 | 
000187 | **Implementation**:
000188 | - Export `useTheme()` hook returning `{ theme, setTheme, systemTheme }`
000189 | - Detect system preference: `window.matchMedia('(prefers-color-scheme: dark)')`
000190 | - Listen for system preference changes with `addEventListener('change')`
000191 | - Apply theme by setting `data-theme` attribute on `document.documentElement`
000192 | - Load theme from chrome.storage.sync on mount
000193 | - Listen for storage changes to sync theme across extension pages (popup/options/background)
000194 | - Handle three values: 'light', 'dark', 'colorblind', or 'system' (auto-detect)
000195 | 
000196 | **Integration points**:
000197 | - Call in [Game.tsx](src/components/Game.tsx) for full-page mode
000198 | - Call in [popup.tsx](src/popup/popup.tsx) for popup mode  
000199 | - Call in [options.tsx](src/options/options.tsx) for settings page
000200 | 
000201 | ### Step 9: Enable theme controls
000202 | 
000203 | **File**: [src/options/options.tsx](src/options/options.tsx)
000204 | 
000205 | **Actions**:
000206 | - Remove "Coming soon in Section 3" message and `disabled` attribute from theme dropdown
000207 | - Wire dropdown `onChange` to `UPDATE_SETTINGS` message with theme field
000208 | - Add options: "System Default", "Light", "Dark", "Color-Blind Friendly"
000209 | - Add live preview: theme changes apply immediately without save button
000210 | - Ensure theme persists and applies on popup/options reload
000211 | - Test theme switching across all extension contexts
000212 | 
000213 | ### Step 10: Validate WCAG contrast ratios
000214 | 
000215 | **Tools**: Chrome DevTools Contrast Checker, WebAIM Contrast Checker
000216 | 
000217 | **Actions**:
000218 | - Test all color combinations in each theme
000219 | - Ensure 4.5:1 minimum for normal text (Level AA)
000220 | - Ensure 3:1 minimum for large text and UI components
000221 | - Document ratios in CSS comments for future reference
000222 | - Test color-blind palette with color blindness simulator (Chrome extension or online tool)
000223 | - Verify number colors distinguishable in deuteranopia/protanopia/tritanopia simulations
000224 | // </anchor:0xA102>
000225 | 
000226 | // <anchor:0xA103>
000227 | ## Phase 3: Keyboard & ARIA Polish (03-03 + 03-04)
000228 | 
000229 | **Goal**: Make extension fully keyboard-navigable with excellent screen reader support
000230 | 
000231 | **Note**: These issues have circular dependency—implement together for coherent accessibility experience.
000232 | 
000233 | ### Step 11: Add keyboard shortcuts help UI
000234 | 
000235 | **New file**: [src/components/ShortcutsHelp.tsx](src/components/ShortcutsHelp.tsx)
000236 | 
000237 | **Implementation**:
000238 | - Create modal component showing keyboard shortcut reference
000239 | - Display mappings:
000240 |   - **Arrow keys**: Navigate cells
000241 |   - **Space / Enter**: Reveal cell
000242 |   - **F**: Toggle flag
000243 |   - **C**: Chord (reveal adjacent)
000244 |   - **Ctrl+Z**: Undo
000245 |   - **Ctrl+Shift+Z / Ctrl+Y**: Redo
000246 |   - **M**: Toggle mute (audio)
000247 |   - **H / ?**: Show this help
000248 |   - **Escape**: Close dialogs
000249 | - Trigger with `?` or `H` key (add global listener)
000250 | - Style as modal overlay with centered card
000251 | - Include close button and Escape key handler
000252 | 
000253 | **Integration**:
000254 | - Add "Keyboard Shortcuts" button to [StatusBar.tsx](src/components/StatusBar.tsx) or [Controls.tsx](src/components/Controls.tsx)
000255 | - Import and conditionally render in [Game.tsx](src/components/Game.tsx)
000256 | 
000257 | ### Step 12: Implement focus trap for modals
000258 | 
000259 | **Files**: 
000260 | - [src/components/EndGameModal.tsx](src/components/EndGameModal.tsx)
000261 | - [src/components/ShortcutsHelp.tsx](src/components/ShortcutsHelp.tsx)
000262 | 
000263 | **Actions**:
000264 | - Add `role="dialog"`, `aria-modal="true"`, `aria-labelledby` attributes
000265 | - Focus first interactive element (button) on modal mount using `useEffect` + `ref.current.focus()`
000266 | - Trap Tab/Shift+Tab within modal (cycle between focusable elements)
000267 | - Handle Escape key to close modal
000268 | - Restore focus to trigger element on close
000269 | - Prevent body scroll when modal open (add `overflow: hidden` to body)
000270 | 
000271 | **Implementation pattern**:
000272 | ```tsx
000273 | useEffect(() => {
000274 |   if (isOpen) {
000275 |     const focusable = modal.current.querySelectorAll('button, [tabindex]');
000276 |     focusable[0]?.focus();
000277 |     // Add keydown listener for Tab trap
000278 |   }
000279 | }, [isOpen]);
000280 | ```
000281 | 
000282 | ### Step 13: Add landmark roles
000283 | 
000284 | **Files**:
000285 | - [src/components/Game.tsx](src/components/Game.tsx)
000286 | - [src/popup/popup.tsx](src/popup/popup.tsx)
000287 | - [src/options/options.tsx](src/options/options.tsx)
000288 | 
000289 | **Actions**:
000290 | - Wrap StatusBar + Board + Controls in `<main role="main" aria-label="Game board">` in Game.tsx
000291 | - Add `<nav aria-label="Game controls">` around Controls or shortcuts button
000292 | - Add `<aside aria-label="Status information">` around StatusBar if semantically separate
000293 | - Ensure options page has `<main>`, `<form>` with proper labels
000294 | - Popup should have `<main>` wrapping primary content
000295 | 
000296 | **Rationale**: Screen reader users can jump between landmarks for faster navigation.
000297 | 
000298 | ### Step 14: Enhance live regions
000299 | 
000300 | **File**: [src/components/StatusBar.tsx](src/components/StatusBar.tsx)
000301 | 
000302 | **Actions**:
000303 | - Current live region announces mine count and timer changes
000304 | - Add announcement for multi-cell reveals: "Revealed 15 cells" after flood-fill
000305 | - Add announcement for chording results: "Chorded, revealed 3 cells"
000306 | - Debounce rapid announcements (300ms) to avoid screen reader overload
000307 | - Use `aria-live="polite"` for non-critical updates, `aria-live="assertive"` for win/loss
000308 | 
000309 | **Implementation**:
000310 | - Add hidden `<div role="status" aria-live="polite" aria-atomic="true">` for dynamic announcements
000311 | - Update content via state when significant events occur
000312 | - Clear announcement after 3 seconds to prevent stale reads
000313 | 
000314 | ### Step 15: Screen reader testing validation
000315 | 
000316 | **Manual testing protocol**:
000317 | 
000318 | 1. **VoiceOver (macOS)**:
000319 |    - Enable: Cmd+F5
000320 |    - Navigate board with VO+Arrow keys
000321 |    - Verify cell descriptions: "Row 1, Column 1, Hidden cell" or "Row 2, Column 3, Revealed, 2 adjacent mines"
000322 |    - Test modal announcements: "You won! Time: 45 seconds"
000323 |    - Verify focus tracking and announcement on focus change
000324 | 
000325 | 2. **NVDA (Windows)** - if available:
000326 |    - Similar navigation tests
000327 |    - Verify live region announcements heard
000328 | 
000329 | 3. **Document findings**:
000330 |    - Create checklist of tested scenarios
000331 |    - Note any unclear or verbose announcements
000332 |    - Log any non-critical improvements for future iteration
000333 | // </anchor:0xA103>
000334 | 
000335 | // <anchor:0xA104>
000336 | ## Phase 4: Animations & Visual Feedback (03-05)
000337 | 
000338 | **Goal**: Add smooth, performant animations while respecting reduced-motion preferences
000339 | 
000340 | ### Step 16: Cell reveal animation
000341 | 
000342 | **File**: [src/styles/Board.module.css](src/styles/Board.module.css)
000343 | 
000344 | **Actions**:
000345 | - Add CSS transition for `.cell-revealed` class:
000346 |   - Background color fade: 0.15s ease-out
000347 |   - Scale pop effect: `transform: scale(1.05)` → `scale(1)` over 0.15s
000348 | - Use cubic-bezier for spring-like easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`
000349 | - Ensure animation doesn't delay game responsiveness (transition on background, not on click event)
000350 | - Test with rapid clicking to verify no visual lag
000351 | 
000352 | **CSS example**:
000353 | ```css
000354 | .cell-revealed {
000355 |   transition: background-color 0.15s ease-out, transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
000356 |   transform: scale(1);
000357 | }
000358 | ```
000359 | 
000360 | ### Step 17: Flag toggle animation
000361 | 
000362 | **File**: [src/styles/Board.module.css](src/styles/Board.module.css)
000363 | 
000364 | **Actions**:
000365 | - Create `@keyframes flagBounce` with scale sequence:
000366 |   - 0%: scale(1)
000367 |   - 50%: scale(1.3)
000368 |   - 100%: scale(1)
000369 | - Apply to `.cell-flagged` class: `animation: flagBounce 0.2s ease-out`
000370 | - Consider emoji size pulse for visual pop (font-size or transform scale)
000371 | - Ensure animation plays on flag add but not on flag remove (use different class or counter)
000372 | 
000373 | ### Step 18: Enhanced win/loss modal animations
000374 | 
000375 | **File**: [src/styles/Game.module.css](src/styles/Game.module.css)
000376 | 
000377 | **Actions**:
000378 | - Keep existing `modalSlideIn` animation for modal entrance (0.3s)
000379 | - **Win state enhancements**:
000380 |   - Add CSS-only confetti effect using multiple colored divs with `@keyframes` for falling/rotating
000381 |   - Or pulse/glow effect on modal card: `box-shadow` animation with theme colors
000382 | - **Loss state enhancements**:
000383 |   - Add subtle shake effect: `@keyframes shake` with translateX oscillation
000384 |   - Consider cascade reveal of all mines with stagger delay (0.03s per mine)
000385 | - Ensure animations don't block "Play Again" button interaction
000386 | 
000387 | **Confetti example** (CSS only, no libraries):
000388 | ```css
000389 | @keyframes confetti-fall {
000390 |   from { top: -10%; opacity: 1; }
000391 |   to { top: 100%; opacity: 0; rotate: 720deg; }
000392 | }
000393 | ```
000394 | 
000395 | ### Step 19: Global animation controls
000396 | 
000397 | **New file**: [src/hooks/useReducedMotion.ts](src/hooks/useReducedMotion.ts)
000398 | 
000399 | **Implementation**:
000400 | - Detect `prefers-reduced-motion` media query
000401 | - Return boolean: `const prefersReducedMotion = useReducedMotion();`
000402 | - Apply `.no-animations` class to root when true
000403 | - Listen for preference changes with `matchMedia.addEventListener('change')`
000404 | 
000405 | **Global CSS** in [src/styles/index.css](src/styles/index.css):
000406 | ```css
000407 | .no-animations *,
000408 | .no-animations *::before,
000409 | .no-animations *::after {
000410 |   animation: none !important;
000411 |   transition: none !important;
000412 | }
000413 | ```
000414 | 
000415 | **Optional user toggle**: Add "Enable animations" checkbox in options page for override.
000416 | 
000417 | ### Step 20: Performance validation
000418 | 
000419 | **Tools**: Chrome DevTools Performance panel
000420 | 
000421 | **Actions**:
000422 | - Record performance profile during gameplay with animations enabled
000423 | - Target: 60fps (16.67ms per frame)
000424 | - Check for layout thrashing or forced reflows
000425 | - Test on lower-end devices if possible (throttle CPU in DevTools)
000426 | - Document any performance considerations:
000427 |   - Use `transform` and `opacity` for animations (GPU-accelerated)
000428 |   - Avoid animating layout properties (`width`, `height`, `top`, `left`)
000429 |   - Use `will-change` sparingly for complex animations
000430 | // </anchor:0xA104>
000431 | 
000432 | // <anchor:0xA105>
000433 | ## Phase 5: Audio System (03-06)
000434 | 
000435 | **Goal**: Add optional sound effects with persistent mute control and graceful fallbacks
000436 | 
000437 | ### Step 21: Create audio assets
000438 | 
000439 | **Directory**: [public/sounds/](public/sounds/)
000440 | 
000441 | **Required files** (total <50KB):
000442 | - `reveal.mp3` - Soft click sound (200-300ms)
000443 | - `flag.mp3` - Pop/snap sound (150-250ms)
000444 | - `win.mp3` - Success chime (500-1000ms)
000445 | - `loss.mp3` - Explosion/boom (400-800ms)
000446 | 
000447 | **Sources**:
000448 | - Generate with online tools (e.g., jsfxr, sfxr)
000449 | - Or use royalty-free assets from freesound.org with CC0 license
000450 | - Compress to MP3 at 64kbps for size optimization
000451 | - Test cross-browser playback (Chrome, Edge, Brave)
000452 | 
000453 | **Vite config**: Ensure [vite.config.ts](vite.config.ts) copies sounds to dist/sounds/
000454 | 
000455 | ### Step 22: Build audio manager
000456 | 
000457 | **New file**: [src/utils/audio.ts](src/utils/audio.ts)
000458 | 
000459 | **Implementation**:
000460 | - Singleton pattern: `export const audioManager = new AudioManager();`
000461 | - Properties:
000462 |   - `sounds: Map<SoundName, HTMLAudioElement>`
000463 |   - `muted: boolean`
000464 |   - `volume: number` (0.0 - 1.0)
000465 | - Methods:
000466 |   - `play(soundName: 'reveal' | 'flag' | 'win' | 'loss'): void`
000467 |   - `setVolume(level: number): void` - Update all audio elements
000468 |   - `setMuted(muted: boolean): void` - Toggle mute state
000469 |   - `preload(): Promise<void>` - Load all audio files
000470 | - Error handling:
000471 |   - Catch audio play() failures (autoplay policy)
000472 |   - Log warnings for missing files, don't throw
000473 |   - Gracefully degrade if Audio API unavailable
000474 | 
000475 | **Preload pattern**:
000476 | ```typescript
000477 | sounds.set('reveal', new Audio('/sounds/reveal.mp3'));
000478 | sounds.get('reveal').load();
000479 | ```
000480 | 
000481 | ### Step 23: Wire audio to game events
000482 | 
000483 | **Files**: 
000484 | - [src/contexts/GameContext.tsx](src/contexts/GameContext.tsx) (full-page mode)
000485 | - [src/hooks/useGame.ts](src/hooks/useGame.ts) (if using custom hook pattern)
000486 | 
000487 | **Actions**:
000488 | - Import `audioManager` from [src/utils/audio.ts](src/utils/audio.ts)
000489 | - Call `audioManager.play()` on game events:
000490 |   - Cell reveal → `play('reveal')`
000491 |   - Flag toggle → `play('flag')`
000492 |   - Win detected → `play('win')`
000493 |   - Loss detected → `play('loss')`
000494 | - Load settings from chrome.storage.sync on mount
000495 | - Apply volume: `audioManager.setVolume(settings.soundVolume)`
000496 | - Apply mute state: `audioManager.setMuted(!settings.soundEnabled)`
000497 | - Listen for storage changes to sync audio settings across contexts
000498 | 
000499 | **Popup integration**: Similar wiring in popup message handlers or React effects.
000500 | 
000501 | ### Step 24: Enable sound controls
000502 | 
000503 | **File**: [src/options/options.tsx](src/options/options.tsx)
000504 | 
000505 | **Actions**:
000506 | - Remove "Coming soon" message from sound toggle and volume slider
000507 | - Remove `disabled` attribute from both controls
000508 | - Wire toggle `onChange` to update `soundEnabled` in settings
000509 | - Wire slider `onChange` to update `soundVolume` (0.0 - 1.0)
000510 | - Add "Test Sound" button that plays `reveal.mp3` at current volume
000511 | - Persist changes via `UPDATE_SETTINGS` message to background
000512 | - Show save confirmation: "✓ Saved" feedback
000513 | 
000514 | **UI enhancement**: Add volume percentage display next to slider (0% - 100%).
000515 | 
000516 | ### Step 25: Add keyboard shortcut for mute
000517 | 
000518 | **Files**:
000519 | - [src/components/Controls.tsx](src/components/Controls.tsx) or new global listener
000520 | - [src/components/ShortcutsHelp.tsx](src/components/ShortcutsHelp.tsx)
000521 | 
000522 | **Implementation**:
000523 | - Add global keyboard event listener for `M` key (not already used)
000524 | - Toggle `soundEnabled` setting: `settings.soundEnabled = !settings.soundEnabled`
000525 | - Save to chrome.storage.sync immediately
000526 | - Update AudioManager: `audioManager.setMuted(!settings.soundEnabled)`
000527 | - Show brief toast/notification: "🔇 Muted" or "🔊 Unmuted"
000528 | - Update ARIA live region to announce mute status change
000529 | - Document in ShortcutsHelp modal
000530 | 
000531 | ### Step 26: Audio testing
000532 | 
000533 | **Test scenarios**:
000534 | 
000535 | 1. **Basic playback**:
000536 |    - Enable sound in options
000537 |    - Verify sounds play on reveal, flag, win, loss
000538 |    - Check volume slider adjusts loudness
000539 | 
000540 | 2. **Mute functionality**:
000541 |    - Toggle mute in options → no sounds play
000542 |    - Press M key → mute toggles with notification
000543 |    - Verify persistence across popup close/reopen
000544 | 
000545 | 3. **Autoplay policy**:
000546 |    - Open fresh popup (no user interaction yet)
000547 |    - Verify first sound may be blocked by browser
000548 |    - Ensure no console errors thrown
000549 |    - After interaction, sounds should play normally
000550 | 
000551 | 4. **Error handling**:
000552 |    - Rename/delete a sound file temporarily
000553 |    - Verify game doesn't crash, logs warning only
000554 |    - Other sounds continue to work
000555 | 
000556 | 5. **Cross-context sync**:
000557 |    - Change mute in options page
000558 |    - Verify popup respects new setting without reload
000559 | // </anchor:0xA105>
000560 | 
000561 | // <anchor:0xA201>
000562 | ## Verification & Testing
000563 | 
000564 | ### Responsive (03-01)
000565 | 
000566 | - [ ] **Viewport testing**: Manually test at 320px, 375px, 480px, 768px, 1024px using Chrome DevTools device emulation
000567 | - [ ] **No horizontal scroll**: Verify at all tested widths, both portrait and landscape
000568 | - [ ] **Touch targets**: All interactive elements ≥44×44px, verified with DevTools overlay
000569 | - [ ] **Layout integrity**: No overlapping elements, text clipping, or broken layouts
000570 | - [ ] **Popup scaling**: Test Easy (8×8), Medium (16×16), Hard (30×16) grids in 400×600px popup
000571 | - [ ] **GameSetup**: Preset buttons and custom inputs work at narrow widths
000572 | 
000573 | ### Theming (03-02)
000574 | 
000575 | - [ ] **Theme switching**: Toggle light/dark/colorblind in options, verify immediate application
000576 | - [ ] **System preference**: Set OS to dark mode, verify "System Default" option respects it
000577 | - [ ] **Persistence**: Close and reopen popup/options, verify theme persists
000578 | - [ ] **CSS variables**: Inspect computed styles, verify all colors use `var(--color-*)` tokens
000579 | - [ ] **WCAG contrast**: Document all color combinations, ensure 4.5:1 for text, 3:1 for UI components
000580 | - [ ] **Color-blind simulation**: Test with Chrome Colorblindly extension or similar tool
000581 | - [ ] **Cross-context sync**: Change theme in options, verify popup updates without reload
000582 | 
000583 | ### Keyboard & ARIA (03-03, 03-04)
000584 | 
000585 | - [ ] **Complete game keyboard-only**: Play full game using only keyboard, no mouse
000586 | - [ ] **Focus visibility**: Focus indicator visible at all times during keyboard navigation
000587 | - [ ] **Shortcuts help**: Press `?` or `H`, verify modal with shortcut reference appears
000588 | - [ ] **Modal focus trap**: Open modal, verify Tab cycles only within modal, Escape closes
000589 | - [ ] **Landmark navigation**: Use screen reader landmarks (Cmd+Option+U on VoiceOver), verify structure
000590 | - [ ] **VoiceOver testing**: Navigate board, verify cell descriptions are clear (e.g., "Row 1, Column 2, Hidden")
000591 | - [ ] **Live region announcements**: Reveal cells, verify status updates announced ("Revealed 10 cells", "3 mines remaining")
000592 | - [ ] **Modal announcements**: Win/loss modals announced correctly with result and time
000593 | - [ ] **NVDA testing** (if available): Similar verification on Windows
000594 | 
000595 | ### Animations (03-05)
000596 | 
000597 | - [ ] **Cell reveal animation**: Smooth 0.15s fade and scale pop, verify at 60fps
000598 | - [ ] **Flag animation**: Bounce effect on flag placement, verify smooth playback
000599 | - [ ] **Win/loss animations**: Modal slide-in plus win celebration (e.g., confetti) or loss shake
000600 | - [ ] **Reduced motion**: Set OS to reduce motion, verify animations disabled or simplified
000601 | - [ ] **Performance**: Record Chrome DevTools Performance profile, verify 60fps during animations
000602 | - [ ] **No input blocking**: Verify animations don't prevent rapid clicking or interaction
000603 | - [ ] **Layout stability**: No layout shifts caused by animations (check Cumulative Layout Shift metric)
000604 | 
000605 | ### Audio (03-06)
000606 | 
000607 | - [ ] **Sound playback**: Enable audio, verify reveal/flag/win/loss sounds play correctly
000608 | - [ ] **Volume control**: Adjust slider in options, verify loudness changes (test with preview button)
000609 | - [ ] **Mute toggle**: Toggle in options and via `M` key, verify sounds stop/resume
000610 | - [ ] **Persistence**: Close popup, reopen, verify audio settings persist (mute state, volume level)
000611 | - [ ] **Autoplay handling**: Open fresh popup, verify no console errors if first sound blocked
000612 | - [ ] **Error resilience**: Delete sound file, verify game continues without crashing (warning logged)
000613 | - [ ] **Cross-context sync**: Mute in options, verify popup respects immediately without reload
000614 | - [ ] **Keyboard shortcut**: Press `M`, verify mute toggles with toast notification and ARIA announcement
000615 | 
000616 | ### Integration & Regression
000617 | 
000618 | - [ ] **Unit tests pass**: Run `npm test` for all existing tests in [src/core/](src/core/) and [src/components/](src/components/)
000619 | - [ ] **No regressions**: Core gameplay (reveal, flag, undo, timer, win/loss) still works correctly
000620 | - [ ] **Extension loading**: Build with `npm run build`, load unpacked in Chrome, verify all features work
000621 | - [ ] **Popup mode**: Test all features in 400×600px popup context
000622 | - [ ] **Full-page mode**: Test all features in new tab full-page context
000623 | - [ ] **Options persistence**: Change all settings, verify all persist correctly across sessions
000624 | - [ ] **Cross-browser**: Test in Chrome, Edge (Chromium), Brave for compatibility
000625 | 
000626 | ### Documentation
000627 | 
000628 | - [ ] **README update**: Document theme options, audio controls, keyboard shortcuts
000629 | - [ ] **Inline comments**: CSS variables documented with contrast ratios and color names
000630 | - [ ] **Testing results**: Save responsive testing checklist with screenshots
000631 | - [ ] **Accessibility notes**: Document VoiceOver testing results and any known limitations
000632 | // </anchor:0xA201>
000633 | 
000634 | // <anchor:0xA301>
000635 | ## Implementation Order & Dependencies
000636 | 
000637 | **Recommended sequence**:
000638 | 
000639 | 1. **Phase 1 (Responsive)** - Quick wins, builds on existing breakpoints → 03-01
000640 | 2. **Phase 3 (Keyboard/ARIA)** - Pair 03-03 + 03-04 together due to circular dependency
000641 | 3. **Phase 2 (Theming)** - Larger refactor but high visual impact → 03-02
000642 | 4. **Phase 4 (Animations)** - Polish layer, can overlap with theming → 03-05  
000643 | 5. **Phase 5 (Audio)** - Independent feature, can be implemented last → 03-06
000644 | 
000645 | **Rationale**:
000646 | - Responsive first: Foundation for all visual work, affects layout of remaining features
000647 | - Keyboard/ARIA early: Core accessibility more important than visual polish
000648 | - Theming after responsive: Easier to test themes once layouts stable
000649 | - Animations and audio last: Enhancement layers that don't block functionality
000650 | 
000651 | **Parallel work opportunities**:
000652 | - Audio asset sourcing can happen during Phase 1-2
000653 | - CSS color token planning can happen during Phase 1
000654 | - ShortcutsHelp component can be built during Phase 2
000655 | 
000656 | **Blocking dependencies from Section 2 (all complete ✅)**:
000657 | - chrome.storage.sync infrastructure → Used for theme/sound persistence
000658 | - Options page UI → Where theme/sound controls live
000659 | - Message passing system → For cross-context settings sync
000660 | - Popup scaling logic → Enhanced in Phase 1
000661 | // </anchor:0xA301>
000662 | 
000663 | // <anchor:0xA302>
000664 | ## Risk Assessment & Mitigation
000665 | 
000666 | ### Technical Risks
000667 | 
000668 | **Risk: CSS variable refactor breaks existing styles**
000669 | - *Likelihood*: Medium
000670 | - *Impact*: High (visual regressions)
000671 | - *Mitigation*: Refactor one module at a time, test after each file, keep hardcoded values as fallbacks during transition
000672 | 
000673 | **Risk: Touch target compliance reduces grid capacity in popup**
000674 | - *Likelihood*: High
000675 | - *Impact*: Medium (user experience)
000676 | - *Mitigation*: Use padding instead of increasing cell size, optimize spacing, existing scaling logic handles large grids
000677 | 
000678 | **Risk: Audio autoplay policy blocks sounds**
000679 | - *Likelihood*: High (browser default behavior)
000680 | - *Impact*: Low (expected limitation)
000681 | - *Mitigation*: Document in UI, sounds work after first user interaction, graceful error handling
000682 | 
000683 | **Risk: Screen reader announcements too verbose or miss events**
000684 | - *Likelihood*: Medium
000685 | - *Impact*: Medium (accessibility)
000686 | - *Mitigation*: Extensive manual testing with VoiceOver, debounce rapid updates, refine wording based on feedback
000687 | 
000688 | **Risk: Animation performance issues on low-end devices**
000689 | - *Likelihood*: Low (using GPU-accelerated CSS)
000690 | - *Impact*: Medium (perceived quality)
000691 | - *Mitigation*: Use transform/opacity only, respect prefers-reduced-motion, test with CPU throttling
000692 | 
000693 | ### Scope Risks
000694 | 
000695 | **Risk: Theming scope creep (users want custom color pickers)**
000696 | - *Mitigation*: Limit to three predefined themes as per requirements, document decision
000697 | 
000698 | **Risk: Accessibility testing takes longer than estimated**
000699 | - *Mitigation*: Focus on VoiceOver (macOS), document NVDA as stretch goal, prioritize critical flows
000700 | 
000701 | **Risk: Audio asset sourcing delays implementation**
000702 | - *Mitigation*: Use placeholder sounds initially, refine later, ensure audio manager works with any MP3
000703 | // </anchor:0xA302>
000704 | 
000705 | // <anchor:0xA401>
000706 | ## Success Criteria
000707 | 
000708 | Section 3 is complete when:
000709 | 
000710 | ### Functional Requirements
000711 | 
000712 | - ✅ Extension works perfectly at 320px, 375px, 768px, 1024px viewports (no scroll, no clipping)
000713 | - ✅ All touch targets ≥44×44px on all screen sizes
000714 | - ✅ Three themes (light/dark/colorblind) implemented and switchable
000715 | - ✅ Themes persist across extension sessions and sync across popup/options/full-page
000716 | - ✅ System theme preference detected and respected
000717 | - ✅ Full keyboard navigation works without mouse
000718 | - ✅ Keyboard shortcuts help discoverable in UI
000719 | - ✅ Modals trap focus and handle Escape/Tab correctly
000720 | - ✅ Screen reader announces all game state changes clearly
000721 | - ✅ Smooth reveal and flag animations at 60fps
000722 | - ✅ Win/loss animations enhanced with celebration/shake effects
000723 | - ✅ `prefers-reduced-motion` respected (animations disabled/simplified)
000724 | - ✅ Sound effects play for reveal/flag/win/loss events
000725 | - ✅ Audio mute toggle and volume control work and persist
000726 | - ✅ Keyboard shortcut (M) for mute with visual/audio feedback
000727 | 
000728 | ### Quality Requirements
000729 | 
000730 | - ✅ All colors meet WCAG AA contrast ratios (4.5:1 text, 3:1 UI)
000731 | - ✅ Color-blind palette tested with simulation tools
000732 | - ✅ VoiceOver testing completed with documented results
000733 | - ✅ Chrome DevTools Performance shows 60fps during animations
000734 | - ✅ No console errors or warnings during normal gameplay
000735 | - ✅ All existing unit tests pass (`npm test`)
000736 | - ✅ Manual testing checklist completed for all features
000737 | 
000738 | ### Acceptance Criteria from Issue Files
000739 | 
000740 | **03-01**: UI fits popup, works at target widths, touch targets compliant, no layout regressions  
000741 | **03-02**: Light/dark/colorblind themes toggle and persist, WCAG contrast met  
000742 | **03-03**: Arrow nav, Space/Enter/F keys work, focus visible, shortcuts help in UI  
000743 | **03-04**: ARIA labels/roles complete, live regions announce changes, VoiceOver/NVDA tested  
000744 | **03-05**: Reveal/flag/modal animations smooth, reduced-motion respected, no layout shifts  
000745 | **03-06**: Sounds play when unmuted, toggle/volume persist, keyboard mute, graceful fallback  
000746 | 
000747 | All 6 issues' acceptance criteria must be verifiable as complete.
000748 | // </anchor:0xA401>
