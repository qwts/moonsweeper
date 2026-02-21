---
section: "1. Core Gameplay"
title: "Difficulty presets & custom game"
---

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