---
section: "3. UI/UX and Accessibility"
title: "Themes — light/dark + color-blind palettes"
---

- **one-line summary:** Add light/dark themes and a color-blind friendly palette with persistent user preference.
- **detailed description:** Implement CSS variables / design tokens for theming, support `prefers-color-scheme`, provide a UI toggle and at least one color-blind-friendly palette option. Ensure color contrast meets WCAG targets and the selected palette persists across sessions.
- **acceptance_criteria:**
  - Light and dark themes implemented and switchable via UI and system preference.
  - Color-blind palette option available and selectable in settings.
  - All text and critical UI color combinations meet WCAG contrast (>=4.5:1 for normal text or documented exceptions).
  - Theme/ palette choice persists across page loads and extension restarts.
- **estimate:** 3 story points
- **priority:** Medium
- **labels:** frontend, accessibility, theming, design, settings
- **dependencies:** Responsive UI for popup and mobile