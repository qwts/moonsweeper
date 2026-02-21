---
section: "4. Social & Sharing"
---

### Issue: Leaderboard design

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

### Issue: Share results functionality

- **Summary:** Enable users to share their completed grid and time via copyable text or image.
- **Description:** After finishing a puzzle, users should have an option to copy a summary of their result as text or download/share an image showing the solved grid and elapsed time. This feature should work offline and integrate with native share dialogs where available.
- **acceptance_criteria:**
  - "Share" button appears on completion screen.
  - Text share includes grid size, time, and date formatted cleanly.
  - Image share renders a snapshot of completed grid and time.
  - Copy-to-clipboard and native share dialog both function correctly.
  - Shared content matches current theme (light/dark).
- **estimate:** S
- **priority:** High
- **labels:** frontend, ux
- **dependencies:** completion-screen

### Issue: Achievement tracking system

- **Summary:** Implement milestones and badges for user accomplishments.
- **Description:** Track player achievements such as "fastest win" or "10-in-a-row" and display badges. The system should record milestones, notify users when unlocked, and allow viewing a badge collection. Persistence must survive app restarts.
- **acceptance_criteria:**
  - Achievements are defined for specific milestones (e.g., first win, streaks).
  - Unlocking an achievement triggers an in-app notification.
  - Badge collection UI lists earned and locked achievements.
  - Achievement state persists across sessions/local storage.
  - System is extensible for future badges.
- **estimate:** L
- **priority:** Medium
- **labels:** backend, frontend, persistence
- **dependencies:** results-logging