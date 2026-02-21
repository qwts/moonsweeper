---
section: "6. Additional Features"
title: "Game Export/Import"
---

- **one-line summary:** Enable exporting and importing full game state so players can save and resume games later.
- **detailed description:** Provide export to a versioned JSON file containing the complete game state and an import flow that validates and restores that state. The import must validate schema/versioning and surface clear errors for incompatible files. Ensure the flow is secure (no code execution) and works on desktop and mobile file APIs. Add automated round‑trip tests for fidelity.
- **acceptance_criteria:**
  - Export creates a downloadable, versioned JSON payload representing the full game state.
  - Import restores board, score, timers, and settings exactly as in the exported file.
  - Import validates schema/version and rejects malformed or incompatible files with a descriptive error.
  - Automated tests verify export→import round-trip produces identical game state.
  - Export/import works on desktop and mobile (download/upload) flows.
- **estimate:** 3 SP
- **priority:** High
- **labels:** frontend, backend, storage, tests, security
- **dependencies:** Game state serialization/deserialization module