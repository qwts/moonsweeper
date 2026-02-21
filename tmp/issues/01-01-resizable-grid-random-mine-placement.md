---
section: "1. Core Gameplay"
title: "Resizable grid & random mine placement"
---

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