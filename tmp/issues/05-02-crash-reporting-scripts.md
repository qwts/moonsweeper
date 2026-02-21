---
section: "5. Analytics & Quality Assurance"
title: "Add Crash Reporting for Scripts"
---

- **summary**: Capture and report errors occurring in background or content scripts.
- **description**: Implement a crash/error-reporting system that logs unhandled exceptions from background and content scripts. Reports should be sent to a centralized service for review. Ensure minimal impact on performance and privacy by anonymizing data.
- **acceptance_criteria**:
  - Error handler added to background and content scripts
  - Reports include stack trace and environment info
  - Data sent to configured crash-reporting endpoint
  - Reports can be viewed and filtered by severity
  - No user-identifying information transmitted
- **estimate**: Medium
- **priority**: High
- **labels**: backend, monitoring, privacy
- **dependencies**: none