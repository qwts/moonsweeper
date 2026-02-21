---
section: "1. Core Gameplay"
title: "Recursive reveal (flood-fill)"
---

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