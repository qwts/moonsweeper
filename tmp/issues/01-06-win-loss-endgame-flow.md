---
section: "1. Core Gameplay"
title: "Win/Loss detection & end-game flow"
---

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