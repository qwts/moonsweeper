---
section: "6. Additional Features"
title: "Hints & Tutorial"
---

- **one-line summary:** Optional in-game hints and a short interactive tutorial that explains rules and suggests safe moves.
- **detailed description:** Add an optional, context-sensitive hints system plus a first-time interactive tutorial to help new players learn rules and safe moves. Hints should recommend moves without changing game state; the tutorial should be skippable and present a small sequence of guided steps. Provide a settings toggle, accessible controls, and basic analytics events for completion. Ensure UI copy is localizable.
- **acceptance_criteria:**
  - Settings contains a "Hints & Tutorial" toggle and a "Show hint" control accessible from gameplay.
  - Requesting a hint highlights one recommended move and does not modify game state.
  - A skippable 3-step first-time tutorial appears for new users and can be replayed from settings.
  - Hint/tutorial UI is keyboard-navigable and includes ARIA labels; automated accessibility checks pass.
  - Unit or e2e tests cover hint request and tutorial completion flows.
- **estimate:** 3 SP
- **priority:** Medium
- **labels:** frontend, ux, accessibility, tests
- **dependencies:** Settings/preferences UI component (if not already available)