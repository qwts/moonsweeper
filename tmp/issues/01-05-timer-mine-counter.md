---
section: "1. Core Gameplay"
title: "Timer & mine counter"
---

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