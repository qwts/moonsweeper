---
section: "3. UI/UX and Accessibility"
title: "Screen reader / ARIA support"
---

- **one-line summary:** Add ARIA roles/labels and live regions so screen readers announce cells, status and game events.
- **detailed description:** Add semantic roles, descriptive `aria-label`s for cells and controls, an `aria-live` region for status updates (remaining mines, win/lose), and ensure focus/announcement behavior is correct for dynamic updates. Test with VoiceOver / NVDA to validate announcements and navigation.
- **acceptance_criteria:**
  - Every interactive element has an appropriate role and descriptive `aria-label`.
  - Game state changes (cell reveal, flag, remaining mines, win/loss) are announced via an `aria-live` region.
  - Focus order is logical and keyboard focus is always visible when interacting.
  - Verified announcements on VoiceOver and NVDA for representative playthroughs.
- **estimate:** 5 story points
- **priority:** High
- **labels:** accessibility, a11y, screen-reader, frontend, tests
- **dependencies:** Keyboard controls