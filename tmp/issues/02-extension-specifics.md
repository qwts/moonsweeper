---
section: "2. Browser Extension Specifics"
---

### Issue: Update to Manifest v3
- **summary**: Ensure extension uses the latest Manifest v3 format.
- **description**: The browser extension must adhere to Chrome/Edge Manifest v3 standards. This includes migrating any background scripts or permissions to the new service-worker based background and updating the manifest file accordingly. Validation should confirm compatibility with both Chrome and Edge stores.
- **acceptance_criteria**:
  - Manifest file follows v3 schema without deprecated fields.
  - Background logic is implemented as a service worker or equivalent.
  - Extension passes Chrome's manifest validator and loads without errors.
- **estimate**: M
- **priority**: High
- **labels**: extension, backend
- **dependencies**: none

### Issue: Implement Background Script Logic
- **summary**: Develop a persistent background script to manage game state and settings.
- **description**: A background service must maintain game state, handle timers, and store persistent settings. It should also interface with storage APIs and broadcast state changes to other components. Consider replacing with service worker under Manifest v3.
- **acceptance_criteria**:
  - Background component tracks and updates game state correctly.
  - Persistent settings are read/written reliably.
  - Timers continue across popup openings/closings.
- **estimate**: L
- **priority**: High
- **labels**: backend, extension
- **dependencies**: Update to Manifest v3

### Issue: Design Popup UI
- **summary**: Create the quick-access game panel popup.
- **description**: The popup UI should provide a grid display, controls, statistics, and access to settings. It must load quickly and communicate with the background script for real-time data. Accessibility and responsiveness are important for usability.
- **acceptance_criteria**:
  - Popup displays current game grid and controls.
  - Stats update based on background state.
  - Settings link navigates to options page.
- **estimate**: M
- **priority**: Medium
- **labels**: frontend, extension, accessibility
- **dependencies**: Background Script Logic

### Issue: Create Options Page
- **summary**: Build a full settings/options page for configuration.
- **description**: Users need an options page to configure difficulty presets, themes, sound, and view statistics. The page should save preferences to appropriate storage and reflect changes immediately or on restart. Must follow extension UI guidelines.
- **acceptance_criteria**:
  - Options page lists all configurable items (difficulty, themes, sound, stats).
  - Changes persist via storage APIs and affect behavior.
  - Page is accessible via extension menu and link from popup.
- **estimate**: M
- **priority**: Medium
- **labels**: frontend, extension
- **dependencies**: Storage setup

### Issue: Configure Storage Usage
- **summary**: Implement `chrome.storage` for settings and records.
- **description**: Use `chrome.storage.sync` for user settings and `chrome.storage.local` for game records, ensuring data is stored appropriately. Provide wrappers or helpers for read/write operations and handle sync limits.
- **acceptance_criteria**:
  - Settings read/write from `storage.sync`.
  - Game records saved to `storage.local`.
  - Storage operations include error handling and callbacks.
- **estimate**: S
- **priority**: High
- **labels**: backend, storage, extension
- **dependencies**: none

### Issue: Define Minimal Permissions & Offline Support
- **summary**: Set up required permissions and offline functionality.
- **description**: Restrict extension permissions to storage and optionally notifications, providing justifications in the manifest. Ensure the game runs fully offline with optional high-score sync when online. Test both offline and online scenarios.
- **acceptance_criteria**:
  - Manifest lists only necessary permissions with comments.
  - Game loads and functions without network access.
  - High scores sync automatically when network is detected.
- **estimate**: M
- **priority**: Medium
- **labels**: extension, ci, offline
- **dependencies**: Storage setup