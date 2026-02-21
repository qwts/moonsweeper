---
section: "3. UI/UX and Accessibility"
title: "Responsive UI for popup and mobile"
---

- **one-line summary:** Ensure the extension popup and web UI scale and remain fully usable across common popup sizes and mobile browsers.
- **detailed description:** Implement responsive layouts, breakpoints and touch-friendly scaling so the game fits compact extension popups and mobile viewports without horizontal scrolling or clipped controls. Verify layout, font scaling and touch targets on common widths and orientation changes so gameplay stays usable and readable on small screens.
- **acceptance_criteria:**
  - UI fits within typical extension popup dimensions (no horizontal scroll or clipped controls).
  - Game is fully usable at viewport widths: 320px, 375px, 768px and 1024px (portrait and landscape where applicable).
  - Touch targets meet minimum size and controls remain reachable on mobile.
  - No visual overlap, clipping, or layout regressions across tested breakpoints.
- **estimate:** 5 story points
- **priority:** High
- **labels:** frontend, responsive, mobile, ui, tests
- **dependencies:** none