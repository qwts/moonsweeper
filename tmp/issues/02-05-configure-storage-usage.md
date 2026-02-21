---
section: "2. Browser Extension Specifics"
title: "Configure Storage Usage"
---

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