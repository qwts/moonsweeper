---
section: "2. Browser Extension Specifics"
title: "Define Minimal Permissions & Offline Support"
---

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