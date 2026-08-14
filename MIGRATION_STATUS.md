# Coordinate LMS — implementation status

Updated: 2026-08-14

**Status only. `RULES.md` is the single source of truth.**

Current unified work is on `agent/canonical-lms-unified` / PR #7.

Known release work still requiring verification at this snapshot:

- rerun the full CI after the dependency-security lockfile update;
- verify typecheck/build and the Playwright web server after the latest LMS/auth/privacy changes;
- regenerate and review answer-coverage evidence for the unified workbook;
- finish any remaining computerized interactions identified by that evidence;
- verify Firebase production configuration and deployed authorization rules;
- complete real student-phone and separate teacher-computer acceptance;
- deploy only after the release gates are green.

This file intentionally does not restate product requirements. See `RULES.md`.
