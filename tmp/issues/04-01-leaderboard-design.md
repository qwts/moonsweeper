---
section: "4. Social & Sharing"
title: "Leaderboard design"
---

- **Summary:** Define and implement a leaderboard for local best times with optional cross-device sync.
- **Description:** Users should be able to view their best times for puzzles locally, with an opt-in feature to synchronize results across their devices. Design the data model, UI elements, and privacy opt-in flow. Ensure sync only occurs when the user explicitly enables it.
- **acceptance_criteria:**
  - Local leaderboard displays top times for each grid size.
  - Opt-in UI clearly explains cross-device sync and is accessible.
  - Enabling sync stores encrypted times in user account or cloud.
  - Sync respects user privacy and can be turned off anytime.
  - Leaderboard updates correctly after completing a puzzle.
- **estimate:** M
- **priority:** Medium
- **labels:** frontend, backend, privacy
- **dependencies:** user-authentication