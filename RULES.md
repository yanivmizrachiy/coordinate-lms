# Coordinate LMS engineering rules

Updated: 2026-08-01

This is the single source of truth for work in `yanivmizrachiy/coordinate-lms`.
`USER_MEMORY.md` and `HANDOFF.md` preserve historical workbook decisions, but
they do not override this file. When a current user instruction conflicts with
this file, the current instruction wins and this file must be reconciled.

## Repository and change boundary

- The only writable repository for LMS work is
  `yanivmizrachiy/coordinate-lms`.
- `yanivmizrachiy/coordinate-first-quadrant` is the canonical source workbook
  and is read-only. Never commit, push, merge, deploy, or otherwise modify it.
- Preserve unrelated work and never rewrite shared history. Do not use
  `git reset --hard`, force-push, or forced dependency-audit fixes.
- A feature branch and draft pull request are allowed. Merging and production
  deployment require explicit confirmation for the current operation.
- Never print, commit, expose, or invent credentials.

## Canonical workbook integrity

- Preserve all 77 numbered pages, Hebrew RTL behavior, canonical wording,
  mathematics, diagrams, page order, A4 pagination, and print layout.
- LMS behavior is an interactive layer. Interactive controls must be hidden or
  made print-neutral and must not obstruct canonical diagrams.
- Canonical workbook details recorded in `USER_MEMORY.md` remain a historical
  content contract only where they do not conflict with this file or a current
  instruction.

## Scoring, access, and answer policy

- Every submitted page score is an integer from 1 through 100. The retired
  0–1200 model must never return.
- Every automatically checked answer allows at most three attempts. Reload,
  retry, stale writes, or reconnection must never reset that count.
- Page 1 is guest-accessible. Page 2 onward requires registration.
- An answer may be checked automatically only when it is reviewed explicitly,
  encoded in canonical metadata, mathematically deterministic, or a verified
  valid range.
- Never infer an answer merely from nearby prose. Open-ended, ambiguous,
  unsupported, and missing targets remain visibly ungraded for teacher review.
- The generated JSON and Markdown coverage reports must represent all pages
  1–77 and must remain synchronized with target order and runtime answer keys.

## Persistence truth and classroom data

- Local persistence success and central Firebase synchronization success are
  distinct states. Never tell a student that data was saved centrally unless
  the central write actually succeeded.
- Central failures must be visible and retryable. Retries must be idempotent and
  must not duplicate results, attempts, or activity events.
- Guest progress is copied to an account before guest source records are
  removed. A failed central transfer leaves the guest source intact.
- Concurrent and stale writes must preserve the latest valid state, the best
  score, the highest attempt count, and any completed/locked state.
- Teacher views must distinguish a central class snapshot from local fallback
  data and expose synchronization errors rather than hiding them.

## Firebase and authorization

- Production registration fails closed unless all six required Firebase client
  settings are configured. Browser-only accounts are development-only or
  require an explicit opt-in that is disabled by production workflows.
- Never claim Firebase is operational until Authentication, Firestore, GitHub
  secrets, rules/index deployment, and a real two-device acceptance test have
  all been verified.
- Students may read and write only their own profile and subcollections.
  Dashboard-wide reads and answer-key writes are administrator-only.
- Firestore writes must use field allowlists and enforce page 1–77, score
  1–100, attempt summary 0–3, monotonic progress, and bounded document shapes.
- Keep the client administrator list and the Firestore administrator rule
  aligned before deployment.

## Required quality gates

Before presenting a branch as ready for review, run at least:

```text
npm run answers:coverage:check
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm run firebase:check
npm run test:visual
```

The Firebase readiness command is expected to fail while real configuration is
absent; report the missing prerequisite exactly. A release must additionally
have a passing readiness result, deployed authorization rules, and recorded
two-device acceptance evidence. Do not describe the product as production
ready while any of those external requirements remain incomplete.
