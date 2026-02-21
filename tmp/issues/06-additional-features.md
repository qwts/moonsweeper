---
title: "6. Additional Features"
---

### Issue: Hints & Tutorial
- title: `Hints & Tutorial`
- one-line summary: `Optional in-game hints and a short interactive tutorial that explains rules and suggests safe moves.`
- detailed description: `Add an optional, context-sensitive hints system plus a first-time interactive tutorial to help new players learn rules and safe moves. Hints should recommend moves without changing game state; the tutorial should be skippable and present a small sequence of guided steps. Provide a settings toggle, accessible controls, and basic analytics events for completion. Ensure UI copy is localizable.`
- acceptance_criteria:
  - `Settings contains a "Hints & Tutorial" toggle and a "Show hint" control accessible from gameplay.`
  - `Requesting a hint highlights one recommended move and does not modify game state.`
  - `A skippable 3-step first-time tutorial appears for new users and can be replayed from settings.`
  - `Hint/tutorial UI is keyboard-navigable and includes ARIA labels; automated accessibility checks pass.`
  - `Unit or e2e tests cover hint request and tutorial completion flows.`
- estimate: `3 SP`
- priority: `Medium`
- labels: `frontend, ux, accessibility, tests`
- dependencies: `Settings/preferences UI component (if not already available)`

### Issue: Themes & Customization
- title: `Themes & Customization`
- one-line summary: `Allow users to change visual appearance (themes, backgrounds, cell shapes) and persist their preferences.`
- detailed description: `Implement theme presets (light/dark/alternate), selectable cell shapes (square/rounded/circle), and a background image/gallery with preview. Changes must persist across sessions and be previewable before apply. Enforce WCAG AA contrast on theme variants and provide a reset-to-default option. Expose controls in settings and ensure accessibility.`
- acceptance_criteria:
  - `Settings exposes at least 3 theme presets, cell-shape options, and a background selector with live preview.`
  - `User selections persist between sessions (localStorage or profile storage).`
  - `Uploaded/selected backgrounds are validated (file type/size) and rendered correctly.`
  - `All theme variants meet WCAG AA contrast requirements for primary UI text and controls.`
  - `Theme controls are keyboard-accessible and covered by UI tests.`
- estimate: `5 SP`
- priority: `Medium`
- labels: `frontend, ux, accessibility, settings, storage`
- dependencies: `Persistent settings storage and asset handling (image uploads/gallery)`

### Issue: Game Export/Import
- title: `Game Export/Import`
- one-line summary: `Enable exporting and importing full game state so players can save and resume games later.`
- detailed description: `Provide export to a versioned JSON file containing the complete game state and an import flow that validates and restores that state. The import must validate schema/versioning and surface clear errors for incompatible files. Ensure the flow is secure (no code execution) and works on desktop and mobile file APIs. Add automated round‑trip tests for fidelity.`
- acceptance_criteria:
  - `Export creates a downloadable, versioned JSON payload representing the full game state.`
  - `Import restores board, score, timers, and settings exactly as in the exported file.`
  - `Import validates schema/version and rejects malformed or incompatible files with a descriptive error.`
  - `Automated tests verify export→import round-trip produces identical game state.`
  - `Export/import works on desktop and mobile (download/upload) flows.`
- estimate: `3 SP`
- priority: `High`
- labels: `frontend, backend, storage, tests, security`
- dependencies: `Game state serialization/deserialization module`

### Issue: Internationalization (i18n)
- title: `Internationalization (i18n)`
- one-line summary: `Add locale-file based localization with runtime language switching and fallback behavior.`
- detailed description: `Introduce an i18n framework and move all user-facing strings into locale files so the app can support multiple languages. Implement runtime locale switching that persists user choice and a safe fallback to English for missing keys. Ensure layout supports RTL languages and provide at least two non-English locales for validation. Add translation extraction tooling and tests.`
- acceptance_criteria:
  - `All visible UI strings are sourced from locale files and referenced via the i18n API.`
  - `User can switch locale at runtime and the selection persists across sessions.`
  - `Missing translations fall back to English; no untranslated UI strings break layout.`
  - `RTL layout adjustments are implemented and verified for an RTL locale in UI tests.`
  - `At least two additional locales (e.g., Spanish, French) are present and validated.`
- estimate: `8 SP`
- priority: `High`
- labels: `frontend, i18n, accessibility, tests`
- dependencies: `i18n library integration and string-extraction tooling (e.g., i18next or equivalent)`