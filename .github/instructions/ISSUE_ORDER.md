---
name: "Issue Order Priorities"
description: "Guidelines for working with ISSUE_ORDER.md and related issue files"
applyTo: "**/ISSUE_ORDER.md"
---

These instructions apply when the agent is interacting with `ISSUE_ORDER.md` or
any referenced issue documents in the `tmp/` directory.

- **Follow the sequence as the priority order.** The first entry is the
  highest priority, the next entry is second, and so on.
- **Do not edit or reorder the list** unless the user explicitly asks you to.
- **When adding new issues**, append them to the bottom of the file and keep
  the same markdown list format.
- **Cross-reference issue files** by name/path in responses or code when
  relevant. These files describe requirements and should inform implementation
  choices.
- **Validate paths** if asked: ensure each referenced markdown file exists under
  `tmp/` and report any discrepancies.
- **Use ISSUE_ORDER.md** to infer project priorities and to decide which
  feature to focus on next when given broad tasks.

Example usages:
> "According to the instructions, `tmp/01-01-resizable-grid-random-mine-placement.md` is
> the current priority. Let's inspect that file for details."

> "Don't jump ahead to later items without user confirmation -- stay in
> sequence."