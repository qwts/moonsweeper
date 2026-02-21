---
section: "3. UI/UX and Accessibility"
title: "Optional sound effects & mute control"
---

- **one-line summary:** Add optional sound effects for gameplay events and a persistent mute toggle accessible via UI and keyboard.
- **detailed description:** Add lightweight audio assets for click/flag/win/loss, a global mute toggle in settings (and keyboard shortcut), and persist the user's audio preference. Ensure audio respects browser autoplay/mute policies and can be disabled for accessibility.
- **acceptance_criteria:**
  - Sound plays for reveal, flag, win and loss events when unmuted.
  - Mute toggle present in settings and toggleable via keyboard; preference persists across sessions.
  - Audio is turned off by the mute setting and respects browser/OS mute state.
  - No errors when audio is unavailable (graceful fallback).
- **estimate:** 2 story points
- **priority:** Medium
- **labels:** frontend, audio, accessibility, settings, tests
- **dependencies:** none