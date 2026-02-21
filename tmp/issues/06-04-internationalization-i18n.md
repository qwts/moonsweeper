---
section: "6. Additional Features"
title: "Internationalization (i18n)"
---

- **one-line summary:** Add locale-file based localization with runtime language switching and fallback behavior.
- **detailed description:** Introduce an i18n framework and move all user-facing strings into locale files so the app can support multiple languages. Implement runtime locale switching that persists user choice and a safe fallback to English for missing keys. Ensure layout supports RTL languages and provide at least two non-English locales for validation. Add translation extraction tooling and tests.
- **acceptance_criteria:**
  - All visible UI strings are sourced from locale files and referenced via the i18n API.
  - User can switch locale at runtime and the selection persists across sessions.
  - Missing translations fall back to English; no untranslated UI strings break layout.
  - RTL layout adjustments are implemented and verified for an RTL locale in UI tests.
  - At least two additional locales (e.g., Spanish, French) are present and validated.
- **estimate:** 8 SP
- **priority:** High
- **labels:** frontend, i18n, accessibility, tests
- **dependencies:** i18n library integration and string-extraction tooling (e.g., i18next or equivalent)