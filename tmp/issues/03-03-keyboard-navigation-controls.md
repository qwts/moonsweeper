---
section: "3. UI/UX and Accessibility"
title: "Keyboard navigation & controls"
---

- **one-line summary:** Enable full keyboard interaction (arrow navigation, reveal, flagging and shortcut keys).
- **detailed description:** Add keyboard focus management and shortcuts so users can navigate the board with arrow keys, reveal with Space/Enter and toggle flags with `F`. Expose shortcut help in the UI and ensure focus indicators and keyboard-only play are reliable.
- **acceptance_criteria:**
  - Arrow keys move focus between cells consistently.
  - Space/Enter reveals a cell; `F` toggles flag on focused cell.
  - Visible focus ring for focused elements and no loss of keyboard control during gameplay.
  - Shortcuts are discoverable in the UI (help or settings) and usable via keyboard-only workflow.
- **estimate:** 3 story points
- **priority:** High
- **labels:** frontend, accessibility, keyboard, ui, tests
- **dependencies:** Screen reader / ARIA support