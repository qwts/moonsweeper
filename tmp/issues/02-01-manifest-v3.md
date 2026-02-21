---
section: "2. Browser Extension Specifics"
title: "Update to Manifest v3"
---

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