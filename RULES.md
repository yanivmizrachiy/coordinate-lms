# Coordinate LMS engineering rules

Updated: 2026-08-18

This is the single source of truth for work in `yanivmizrachiy/coordinate-lms`.
`USER_MEMORY.md` and `HANDOFF.md` preserve historical workbook decisions, but
they do not override this file. When a current user instruction conflicts with
this file, the current instruction wins and this file must be reconciled.

## Repository identity — one master, one truth

- **`yanivmizrachiy/coordinate-lms` is the ONLY repository, the ONLY master,
  and the ONLY source of truth** for the entire project: canonical workbook
  content, printable rendering, interactive LMS rendering, grading metadata,
  student persistence, and the teacher dashboard.
- `yanivmizrachiy/coordinate-first-quadrant` is a **frozen historical
  archive, read-only forever**. Its final content delta (through commit
  `b8635c8`, 2026-08-18) was fully imported here. Never commit, push, merge,
  deploy, or develop there; never read from it at runtime or build time.
- There is exactly ONE canonical content model: `src/data/workbook/` (pages,
  authoring, BOOK order) plus `src/data/solutions/` and `src/data/printAids.ts`.
  Every renderer — print, flipbook, PDF, single-page viewer, LMS practice
  layer, solutions, teacher views — derives from it. A change made once there
  appears everywhere; hand-copying content between renderers is forbidden.
- The layer split is CONTENT / PRESENTATION / INTERACTION. LMS-only behavior
  (feedback UI, grading, persistence, the on-screen game layer) never edits
  canonical page HTML; print-only styling never changes LMS behavior.
- Automated guards (`tests/ssot-guard.test.ts`, `tests/layout-rules.test.ts`)
  fail the build if a second content source, a stale page count, or a runtime
  dependency on another repository appears.
- Preserve unrelated work and never rewrite shared history. Do not use
  `git reset --hard`, force-push, or forced dependency-audit fixes.
- A feature branch and draft pull request are allowed. Merging and production
  deployment require explicit confirmation for the current operation.
- Never print, commit, expose, or invent credentials.

## Canonical workbook integrity

- The canonical booklet has **78 numbered pages** (since the 2026-08-18
  consolidation; previously 77). Preserve all pages, Hebrew RTL behavior,
  canonical wording, mathematics, diagrams, page order, A4 pagination, and
  print layout. Page numbers and the topic map derive from position in `BOOK`
  (`src/data/workbook/index.ts`); nothing is hand-numbered.
- Every numbered page is a printed worksheet — „המשימות שלנו הן להדפסה"
  (31.07.2026). The seven interactive games are an ON-SCREEN layer attached to
  their printed puzzle pages through the `SCREEN_GAMES` map in
  `src/data/workbook/index.ts`; the games never appear in print and never
  modify canonical sheet HTML.
- LMS behavior is an interactive layer. Interactive controls must be hidden or
  made print-neutral and must not obstruct canonical diagrams.
- The dynamic solutions module (`src/data/solutions/`, `#/solutions`) is
  canonical content but is **teacher-gated in the LMS** (admin session only):
  open solutions would empty the three-attempt practice model. Reversing this
  gate is a product decision for Yaniv, recorded here when made.
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
- Reviewed proofs and reviewed open-ended decisions must be bound to the
  current target signature and cite canonical source evidence. Prompt drift
  must make the old decision inapplicable.
- **Consolidation state (2026-08-18):** the 78-page import renumbered every
  page and changed wording on 66 pages. 588 of 735 reviewed proofs and 137 of
  161 reviewed open-ended decisions survived on unchanged prompt signatures
  and were mechanically re-keyed (`scripts/`-external migration, occurrence-
  aligned per page, verified by regeneration). The lapsed 147 proofs and 24
  open-ended decisions, plus the new pages' targets, are deliberately
  unkeyed until a fresh review cites exact canonical evidence. Current
  measured coverage: **729/1,150 targets (63.4%)** — see
  `reports/answer-coverage.json`. Raising it happens ONLY through the review
  studio or evidence-cited proofs, never by guessing.
- Unordered answer sets may be accepted only through the strict `set:` format;
  duplicates, omissions, and extra labels must remain incorrect.
- Never infer an answer merely from nearby prose. Open-ended, ambiguous,
  unsupported, and missing targets remain visibly ungraded for teacher review.
- The generated JSON and Markdown coverage reports must represent all pages
  1–78 and must remain synchronized with target order and runtime answer keys.

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
- Firestore writes must use field allowlists and enforce page 1–78, score
  1–100, attempt summary 0–3, monotonic progress, and bounded document shapes.
- Keep the client administrator list and the Firestore administrator rule
  aligned before deployment.

## Required quality gates

Before presenting a branch as ready for review, run at least:

```text
npm run answers:coverage:check
npm run typecheck
npm test
npm run test:firestore
npm run build
npm audit --audit-level=high
npm audit --omit=dev --audit-level=high
npm run firebase:check
npm run release:report
npm run test:visual
```

The Firebase readiness command is expected to fail while real configuration is
absent; report the missing prerequisite exactly. A release must additionally
have a passing readiness result, deployed authorization rules, and recorded
two-device acceptance evidence. Do not describe the product as production
ready while any of those external requirements remain incomplete.
