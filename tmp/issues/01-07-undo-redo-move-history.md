---
section: "1. Core Gameplay"
title: "Undo/Redo move history"
---

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