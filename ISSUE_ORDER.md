# Issue Development Order

This document lists every issue file in the repository along with its direct dependencies. Files are arranged in a loose development order based on numbering and dependency chains.

---

## Section 1 – Core Gameplay
- `01-core-gameplay.md`
  - `01-01-resizable-grid-random-mine-placement.md` *(none)*
  - `01-02-difficulty-presets-custom-game.md` → depends on `01-01-resizable-grid-random-mine-placement.md`
  - `01-03-cell-interactions-chording.md` → depends on `01-01-resizable-grid-random-mine-placement.md`, `01-02-difficulty-presets-custom-game.md`
  - `01-04-recursive-reveal-flood-fill.md` → depends on `01-01-resizable-grid-random-mine-placement.md`, `01-03-cell-interactions-chording.md`
  - `01-05-timer-mine-counter.md` → depends on `01-03-cell-interactions-chording.md`, `01-01-resizable-grid-random-mine-placement.md`
  - `01-06-win-loss-endgame-flow.md` → depends on `01-05-timer-mine-counter.md`, `01-03-cell-interactions-chording.md`, `01-04-recursive-reveal-flood-fill.md`
  - `01-07-undo-redo-move-history.md` → depends on `01-03-cell-interactions-chording.md`, `01-04-recursive-reveal-flood-fill.md`, `01-05-timer-mine-counter.md`

## Section 2 – Browser Extension Specifics
- `02-01-manifest-v3.md` *(none)*
- `02-02-background-script-logic.md` → depends on `02-01-manifest-v3.md`
- `02-03-popup-ui.md` → depends on `02-02-background-script-logic.md`
- `02-05-configure-storage-usage.md` *(none)*
- `02-04-options-page.md` → depends on `02-05-configure-storage-usage.md`
- `02-06-permissions-offline-support.md` → depends on `02-05-configure-storage-usage.md`
- `02-extension-specifics.md` *(overview/meta file)*

## Section 3 – UI/UX and Accessibility
- `03-01-responsive-ui-popup-mobile.md` *(none)*
- `03-02-theming-light-dark-color-blind.md` → depends on `03-01-responsive-ui-popup-mobile.md`
- `03-05-animations-visual-feedback.md` → depends on `03-01-responsive-ui-popup-mobile.md`
- `03-03-keyboard-navigation-controls.md` → depends on `03-04-screen-reader-aria-support.md` (cycle)
- `03-04-screen-reader-aria-support.md` → depends on `03-03-keyboard-navigation-controls.md` (cycle)
- `03-06-optional-sound-effects-mute.md` *(none)*

## Section 4 – Social & Sharing
- `04-01-leaderboard-design.md` → depends on *user-authentication* (not a file)
- `04-02-share-results-functionality.md` → depends on *completion-screen* (internal)
- `04-03-achievement-tracking-system.md` → depends on *results-logging* (internal)
- `04-social-sharing.md` *(meta/aggregate file containing the above issues)*

## Section 5 – Analytics & Quality Assurance
- `05-03-unit-tests-grid-logic.md` *(none)*
- `05-04-integration-tests-ui-interactions.md` → depends on `05-03-unit-tests-grid-logic.md`
- `05-05-setup-ci-headless-chrome.md` → depends on `05-03-unit-tests-grid-logic.md`, `05-04-integration-tests-ui-interactions.md`
- `05-01-usage-metrics-tracking.md` *(none)*
- `05-02-crash-reporting-scripts.md` *(none)*
- `05-analytics-qa.md` *(overview/meta file)*

## Section 6 – Additional Features
- `06-01-hints-tutorial.md` → depends on *Settings/preferences UI component* (external)
- `06-02-themes-customization.md` → depends on *persistent settings storage and asset handling* (external)
- `06-03-game-export-import.md` → depends on *Game state serialization/deserialization module* (external)
- `06-04-internationalization-i18n.md` → depends on *i18n library integration and string-extraction tooling* (external)
- `06-additional-features.md` *(overview/meta file)*
