# Coordinate LMS engineering rules

Updated: 2026-08-23

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
  0–1200 model must never return. A perfect 100 is shown with a distinct
  celebratory glowing badge; every other score keeps the plain red badge.
- Every automatically checked answer allows at most three attempts. Reload,
  retry, stale writes, or reconnection must never reset that count.
- A mistake still has a scoring consequence: a correct answer on the first
  checked attempt earns full credit for that target, on the second checked
  attempt 75%, and on the third checked attempt 50%. Corrective hints never
  refund, reset, or hide an attempt; they exist to turn the lost credit into
  learning rather than punishment without guidance.
- Every page is open to a guest (Yaniv, 2026-08-18): a guest solves, receives
  feedback, and earns a page score exactly like a registered student. A
  guest's progress is saved on the device only — never centrally, never in the
  teacher dashboard. Registration (full name, school, email, password — no
  username or class field; the stored username is derived from the email) adds
  central save, cross-device resume, and dashboard visibility, and copies the
  full guest history to the account. The single teacher/admin is Yaniv; only
  the admin sees class-wide results.
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

## Interactive feedback model (LMS layer)

- Feedback is per QUESTION, not per keystroke. A question is the unit the
  canonical content already groups blanks into — a `.q-card`, or the finest
  labelled unit (`li`/`tr`/`completion-sentence`) where there is no card.
- Each question carries one small submit control displayed as **„להגיש ←”**;
  its accessible name is **„להגיש שאלה לבדיקה”**. The old wording „סיימתי
  שאלה” is retired and must not appear as the question-check action.
- Pressing the question submit control gives immediate feedback beside that
  same question. A fully correct question shows a clearly visible **green
  ✓ נכון** verdict. If correction is needed, the verdict must say **יש מה
  לתקן** (partial) or **נסה שוב** (wrong); the incorrect part remains editable
  and the same small submit control stays available so the learner can correct
  and submit again until the three-attempt limit is reached.
- **A wrong verdict may never be the end of the feedback.** After every wrong
  or partially wrong checked attempt the LMS must also give a short,
  pedagogical correction hint beside that same question. The hint must direct
  the learner toward a rule, representation, comparison or step of reasoning;
  it must not merely repeat „לא נכון”.
- Hints are progressive. Attempt 1 gives a concise conceptual clue; attempt 2
  gives a more explicit strategy or worked direction; after attempt 3 / lock,
  the learner receives a compact explanation of the governing rule. The
  student may keep editing the unresolved part while attempts remain.
- Hints must be derived from canonical task metadata and mathematical context,
  never from a second hand-authored answer source. Relevant categories include
  axis identity, horizontal/vertical property, direction, scale/number,
  origin, relation, and ordered-pair position. A correct part stays locked and
  the hint addresses only unresolved parts where possible.
- Coordinate-system guidance must follow the Ministry of Education grade-7
  teaching emphases: x is the horizontal axis, y the vertical axis; pupils
  practise both plotting given points and reading coordinates of given points;
  coordinate systems support orientation, graphs and geometric
  representation; and scale must be read correctly. The implementation is
  self-contained and must not fetch curriculum content at runtime.
- Registration, login, account and save-mode explanations belong **only on the
  landing/start screen before practice begins**. Once the learner enters any
  numbered `#/workbook/:n` page, the practice surface must not show registration
  explanations, guest/account identity copy, or an account/login call-to-action.
  Numbered pages stay focused on the mathematics, submit control, feedback,
  corrective hints, score, navigation, and essential error recovery only.
- A verdict always shows as a shape AND a word, never colour alone: ✓ נכון
  (all correct), ◐ יש מה לתקן (partial — some right, some not), ✕ נסה שוב
  (wrong), 🔒 (locked after three attempts), ? נשמר לבדיקת המורה
  (unkeyed/open-ended). Screen readers hear the verdict and the corrective hint;
  none of it appears in print.
- A correct target is preserved and locked — never re-typed or re-counted; the
  learner fixes only the part still marked. Typing is never an attempt; an
  attempt is counted only when a check is actually run. Reload never resets.
- Progress counts QUESTIONS completed (correct, locked-out, or saved for
  review), not raw targets. Question state is DERIVED from target progress and
  never stored twice.
- Page submit must always be reachable. An empty checkable blank never locks on
  its own, so submit warns once when answers are unfinished and finalises on a
  second press, scoring unanswered targets as 0 — a page score is never made
  permanently unreachable.
- The dynamic solutions screen is teacher-gated (admin session only); open
  solutions would empty the three-attempt practice model.

## Bundle and loading

- The first download must stay small: every screen is fetched on demand
  (dynamic `import()` in `main.ts`), and the Firebase SDK is loaded only by the
  screens that sign a student in. A static view import in `main.ts`, or Firebase
  reaching the entry module, is a regression — `tests/ssot-guard.test.ts` fails
  the build on either.
- Async screen loading must stay honest: a stale navigation is dropped, a wait
  long enough to feel like one is explained, and a screen whose code never
  arrives offers a retry rather than a blank page.

## Interface controls

- Buttons and action controls use a **quiet, compact visual language**: neutral
  navy/slate/white surfaces, thin borders, restrained shadows, and no neon,
  glow, saturated purple/green navigation blocks, sheen sweeps, or decorative
  colour effects.
- Compact means visually compact, not hard to tap: primary interactive controls
  keep a minimum 44px touch height while using smaller type, tighter padding,
  smaller gaps, and natural wrapping instead of oversized full-width slabs.
- The per-question **„להגיש ←”** control is deliberately narrow and understated,
  remains at least 44px high for touch, and sits immediately beside its result
  so the action and feedback read as one compact unit.
- Corrective hints use a calm neutral panel with restrained borders and no
  neon/glow. They sit immediately with the question feedback and remain compact
  enough not to overwhelm the worksheet on mobile.
- Previous/next navigation is distinguished by position, label and arrow rather
  than loud colour. Hover/press feedback is subtle and must not move controls
  enough to feel jumpy on touch devices.
- This rule applies to buttons, navigation controls, menu action tiles and LMS
  action controls. It does **not** remove the separate celebratory perfect-100
  score badge defined in the scoring section.

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