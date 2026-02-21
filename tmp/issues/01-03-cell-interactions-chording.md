---
section: "1. Core Gameplay"
title: "Cell interactions & chording"
---

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