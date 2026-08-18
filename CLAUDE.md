# CLAUDE.md — pointer only

The repository's single source of engineering rules is:

> ## `RULES.md`

Read it before making changes. `USER_MEMORY.md` and `HANDOFF.md` are historical
workbook records, not competing rule authorities.

**`yanivmizrachiy/coordinate-lms` is the ONLY repository, the ONLY master, and
the ONLY source of truth** — content, print, LMS, grading, persistence,
dashboard. `yanivmizrachiy/coordinate-first-quadrant` is a frozen historical
archive (its final delta was fully imported here on 2026-08-18): never write
to it, never develop in it, never depend on it at runtime or build time.

Merge and production deployment require explicit confirmation for the current
operation.
