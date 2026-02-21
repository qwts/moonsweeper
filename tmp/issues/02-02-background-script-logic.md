---
section: "2. Browser Extension Specifics"
title: "Implement Background Script Logic"
---

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