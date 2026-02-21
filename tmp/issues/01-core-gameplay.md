---
title: "1. Core Gameplay"
---

### Issue: Resizable grid & random mine placement
- **One-line summary:** Support resizable boards (e.g. `9x9`, `16x16`, `30x16`) with correct, random mine placement and validation.
- **Detailed description:** Implement game-logic to generate boards for arbitrary validated dimensions and place the requested number of mines at unique random locations. Provide an optional deterministic seed for reproducible boards used by tests and replay. Validate and reject invalid requests (e.g., mines >= cells) and add unit tests for boundary cases.
- **Acceptance criteria:**
  - Creating an N×M board produces N*M cells with correct index mapping.
  - Exactly K unique cells are marked as mines when K is specified.
  - Providing the same seed yields identical mine layouts; omitting seed yields non-deterministic placement.
  - Invalid configurations (K >= N*M or out-of-range dimensions) return a validation error and do not create a board.
- **Estimate:** 5 story points
- **Priority:** High
- **Labels:** game-logic, backend, tests
- **Dependencies:** none

### Issue: Difficulty presets & custom game
- **One-line summary:** Add Easy/Medium/Hard presets and a validated custom-game input for rows/cols/mines.
- **Detailed description:** Provide UI and logic for three difficulty presets and a custom configuration mode. Use common defaults (Easy = `9x9`/10, Medium = `16x16`/40, Hard = `30x16`/99) and validate custom inputs (dimension and mine count limits). Persist last-used custom values for convenience and add validation error messaging.
- **Acceptance criteria:**
  - Preset selector includes Easy/Medium/Hard and sets grid & mine values to the defaults above.
  - Custom inputs accept rows/cols in allowed range (e.g., 5–50) and mines ≥1 and ≤ rows*cols - 1.
  - Invalid custom values show inline validation and prevent starting the game.
  - Selecting a preset or valid custom config updates the board configuration immediately.
- **Estimate:** 3 story points
- **Priority:** High
- **Labels:** frontend, ui, validation, game-logic
- **Dependencies:** Resizable grid & random mine placement

### Issue: Cell interactions & chording
- **One-line summary:** Implement reveal/flag interactions for desktop & mobile plus chording reveal behavior.
- **Detailed description:** Support left-click/tap to reveal cells and right-click/long-press to flag/unflag, with accessible keyboard alternatives. Implement chording: when a revealed numeric cell's adjacent flagged count equals its number, reveal adjacent unflagged cells. Ensure UI states (revealed, flagged, questioned) are consistent and interactions are disabled after game end.
- **Acceptance criteria:**
  - Left-click/tap reveals a cell; right-click/long-press toggles flag; keyboard equivalents are provided and documented.
  - Flag toggle updates mine counter immediately and persists visually.
  - Chording triggers only when flagged-adjacent-count == revealed number and reveals adjacent unflagged/unrevealed cells.
  - All interaction inputs are no-ops when game state is `won` or `lost`.
- **Estimate:** 5 story points
- **Priority:** High
- **Labels:** frontend, accessibility, interaction, mobile, tests
- **Dependencies:** Resizable grid & random mine placement, Difficulty presets & custom game

### Issue: Recursive reveal (flood-fill)
- **One-line summary:** Reveal connected zero-adjacent-mine regions and their numeric borders when an empty cell is opened.
- **Detailed description:** Implement an iterative flood-fill that reveals contiguous zero-cells and the bordering numbered cells when an empty cell is revealed. Ensure flagged cells block propagation and avoid recursion depth issues on large boards. Add unit and integration tests including stress/performance cases.
- **Acceptance criteria:**
  - Revealing a `0` cell reveals the entire connected zero-region and immediate numeric border cells.
  - Flood-fill does not overwrite flagged cells and stops propagation at flagged/edge cells.
  - Implementation avoids recursion-stack overflow on max-supported board sizes (validated by stress test).
  - Recursive reveal is treated as a single atomic user action for undo/redo semantics.
- **Estimate:** 3 story points
- **Priority:** High
- **Labels:** game-logic, performance, tests
- **Dependencies:** Resizable grid & random mine placement, Cell interactions & chording

### Issue: Timer & mine counter
- **One-line summary:** Show elapsed time and remaining-mine counter (total mines − flagged tiles) with accessible updates.
- **Detailed description:** Start the timer on the first reveal, stop it on win/loss, and reset on new game. Display the remaining mine count updated live as flags are toggled; ensure both UI elements are accessible (aria-live) and covered by tests.
- **Acceptance criteria:**
  - Timer starts on first reveal, increments per second, stops on win/loss, and resets on new game.
  - Mine counter displays `totalMines - flaggedCount` and updates immediately when flags change.
  - Timer and counter expose accessible labels/aria-live so screen readers announce updates.
  - Timer and counter reflect state correctly after undo/redo actions where applicable.
- **Estimate:** 2 story points
- **Priority:** Medium
- **Labels:** frontend, ui, accessibility, tests
- **Dependencies:** Cell interactions & chording, Resizable grid & random mine placement

### Issue: Win/Loss detection & end-game flow
- **One-line summary:** Detect wins/losses, stop play, and present end-game state and options.
- **Detailed description:** Mark the game as `lost` immediately when a mine is revealed and reveal all mines; mark as `won` when all non-mine cells are revealed (or mines correctly flagged). Stop the timer, disable further input, and show an end-game modal with elapsed time and a restart option. Ensure consistent board state for analytics/metrics and for undo semantics.
- **Acceptance criteria:**
  - Revealing a mine sets game state to `lost`, stops the timer, and reveals all mine locations (show incorrect flags as such).
  - All safe cells revealed (or correct flags) sets game state to `won` and stops the timer.
  - End-game modal displays result and elapsed time and provides a restart button.
  - Further cell interactions are disabled after win/loss (except allowed undo behavior).
- **Estimate:** 3 story points
- **Priority:** High
- **Labels:** game-logic, ui, tests
- **Dependencies:** Timer & mine counter, Cell interactions & chording, Recursive reveal

### Issue: Undo/Redo move history
- **One-line summary:** Provide undo/redo for player moves with grouped (atomic) actions and configurable depth.
- **Detailed description:** Record player actions (reveals, flags, chording, recursive reveals) and expose undo/redo up to a configurable limit (example default: 10). Treat compound operations (e.g., recursive reveal or a chord that reveals many cells) as a single atomic step for undo/redo. Ensure UI, timer, and mine counter correctly reflect reverted state and include tests for undoing win/loss and edge conditions.
- **Acceptance criteria:**
  - Undo reverts the last atomic move (single reveal, grouped recursive reveal, flag toggle, or chord); redo re-applies it.
  - Undo/redo depth is configurable and enforced; attempts beyond depth are rejected/no-op.
  - Undoing a losing move returns the game to `in-progress` and updates timer/mine counter/board accordingly.
  - UI updates immediately after undo/redo; undo after starting a new game is disabled.
- **Estimate:** 8 story points
- **Priority:** Medium
- **Labels:** game-logic, ux, undo, tests, performance
- **Dependencies:** Cell interactions & chording, Recursive reveal, Timer & mine counter