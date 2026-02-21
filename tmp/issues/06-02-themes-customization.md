---
section: "6. Additional Features"
title: "Themes & Customization"
---

- **one-line summary:** Allow users to change visual appearance (themes, backgrounds, cell shapes) and persist their preferences.
- **detailed description:** Implement theme presets (light/dark/alternate), selectable cell shapes (square/rounded/circle), and a background image/gallery with preview. Changes must persist across sessions and be previewable before apply. Enforce WCAG AA contrast on theme variants and provide a reset-to-default option. Expose controls in settings and ensure accessibility.
- **acceptance_criteria:**
  - Settings exposes at least 3 theme presets, cell-shape options, and a background selector with live preview.
  - User selections persist between sessions (localStorage or profile storage).
  - Uploaded/selected backgrounds are validated (file type/size) and rendered correctly.
  - All theme variants meet WCAG AA contrast requirements for primary UI text and controls.
  - Theme controls are keyboard-accessible and covered by UI tests.
- **estimate:** 5 SP
- **priority:** Medium
- **labels:** frontend, ux, accessibility, settings, storage
- **dependencies:** Persistent settings storage and asset handling (image uploads/gallery)