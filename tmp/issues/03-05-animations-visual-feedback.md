---
section: "3. UI/UX and Accessibility"
title: "Animations & visual feedback"
---

- **one-line summary:** Add smooth, performant animations for reveal/flag and win/loss while respecting reduced-motion preferences.
- **detailed description:** Implement CSS-based reveal, flag and end-game animations with performance budgets and fallbacks. Respect `prefers-reduced-motion` to disable or simplify animations and ensure visual feedback does not interfere with gameplay or accessibility.
- **acceptance_criteria:**
  - Reveal and flagging animations are present and visually smooth on target devices.
  - Win/loss animation implemented and plays reliably without blocking input.
  - `prefers-reduced-motion` disables or simplifies animations.
  - Animations do not cause layout shifts or block gameplay (manual/perf check).
- **estimate:** 3 story points
- **priority:** Medium
- **labels:** frontend, animations, performance, accessibility
- **dependencies:** Responsive UI for popup and mobile