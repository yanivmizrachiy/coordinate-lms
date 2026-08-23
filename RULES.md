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

## Learning the user's style — corrections become rules

- This file is a **living learning layer**, not a passive log. Read it before
  every change. After a meaningful user correction, reconcile it so the next
  similar task starts from the learned preference instead of repeating the old
  mistake.
- For every correction, ask what reusable principle it reveals. If the lesson
  applies beyond the one element that triggered it, encode the generalized rule
  here and apply it consistently to equivalent screens, controls, questions and
  future work.
- Keep one smart source of truth, not a pile of notes. Merge overlapping or
  repeated feedback into one stronger rule; replace obsolete wording when a
  newer instruction supersedes it; never create a parallel preference file,
  shadow rule list or second design source.
- Distinguish durable style from a local exception. A repeated or clearly
  general preference becomes project-wide automatically; a genuinely local
  exception stays local and must not silently alter unrelated behavior.
- Repetition increases confidence. Repeated requests for smaller/quieter
  controls, less interface chrome during practice, useful pedagogical feedback,
  tolerance for harmless input variants, and minimal interruption are part of
  the project's design language and must be preserved proactively.
- A correction is not complete until **implementation, tests and this source of
  truth agree**. No demo-only substitute counts as completion.

## Canonical workbook integrity

- The canonical booklet has **78 numbered pages** (since the 2026-08-18
  consolidation; previously 77). Preserve all pages, Hebrew RTL behavior,
  canonical wording, mathematics, diagrams, page order, A4 pagination, and
  print layout. Page numbers and the topic map derive from position in `BOOK`
  (`src/data/workbook/index.ts`); nothing is hand-numbered.
- **Printable and computerized pages are two renderings of the SAME worksheet
  content, never two content products.** The canonical worksheet content lives
  only in `src/data/workbook/`. The printable page renders that source as paper;
  `#/workbook/:n` renders that exact same source and then overlays the LMS
  interaction layer. There must never be a separate computerized copy of a
  question, sentence, diagram, value, page order or mathematical task.
- **Any content correction to a worksheet must propagate automatically to both
  print and computerized practice.** If wording, mathematics, a diagram,
  ordering, a blank, a value or any other canonical page content changes, make
  the change once in the canonical workbook source. The printable rendering and
  LMS rendering must both update from that same change; manually synchronizing
  or retyping the change in the LMS is a defect.
- Before changing a numbered practice page, classify the request explicitly as
  either a CONTENT change or an INTERACTION/PRESENTATION change. CONTENT changes
  are made in the canonical workbook and therefore affect both printable and
  computerized renderings. LMS-only controls, feedback, hints, scoring,
  persistence and navigation belong only to the interactive overlay and must
  not alter the printable worksheet content.
- Print/download controls are utilities for print/booklet surfaces, not part of
  the student practice experience. They must not appear merely because the
  underlying worksheet also has a printable rendering. A computerized practice
  page should expose only controls that serve solving, feedback, progress and
  navigation.
- Every numbered page is a printable worksheet at the content layer — „המשימות
  שלנו הן להדפסה” (31.07.2026) — and the same numbered page is also the basis of
  its computerized practice rendering. The seven interactive games are an
  ON-SCREEN layer attached to their canonical puzzle pages through the
  `SCREEN_GAMES` map in `src/data/workbook/index.ts`; the games never appear in
  print and never modify canonical sheet HTML.
- LMS behavior is an interactive layer. Interactive controls must be hidden or
  made print-neutral and must not obstruct canonical diagrams.
- The dynamic solutions module (`src/data/solutions/`, `#/solutions`) is
  canonical content but is **teacher-gated in the LMS** (admin session only):
  open solutions would undermine the first-attempt-plus-three-corrections
  practice model. Reversing this gate is a product decision and must be recorded
  here when made.
- Canonical workbook details recorded in `USER_MEMORY.md` remain a historical
  content contract only where they do not conflict with this file or a current
  instruction.

## Scoring, access, and answer policy

- A learner completes a page and receives a page score. **100 is the maximum
  possible score.** A perfect 100 is shown with a distinct celebratory badge.
- A correct answer on the **first checked attempt loses no credit**. A mistake
  costs credit only when the learner actually submits/checks that answer; typing
  or editing by itself never costs points.
- After an initial wrong checked answer, the learner gets **up to three
  correction opportunities**. This means at most four checked attempts in
  total: first attempt + correction 1 + correction 2 + correction 3. Reload,
  retry, stale writes, reconnection, or changing devices must never reset the
  count.
- Credit falls consistently after checked mistakes: correct on the first
  attempt = 100% of that target's credit; correct on correction 1 = 75%; correct
  on correction 2 = 50%; correct on correction 3 = 25%. If the final correction
  is still wrong, the unresolved target locks with 0 credit. Corrective hints
  never refund, reset or hide an attempt.
- **The learner must be told the scoring consequence in plain language.** After
  each checked mistake/correction the feedback states which stage was used,
  how much credit was lost, and how much can still be earned. The explanation
  must mirror the real scoring calculation; there must never be a second
  display-only grading model.
- The scoring constants belong in one central configuration/calculation path.
  Do not scatter hard-coded attempt limits or credit percentages across UI,
  persistence and tests. Firestore may duplicate a bound only where its separate
  execution environment requires it, and tests must keep that bound aligned.
- **Harmless input variation must not cost a child points.** Latin answer
  letters such as `x/X` and `y/Y` are case-insensitive. Hebrew textual answers
  accept tightly bounded spelling variants such as common full/defective
  spelling and one small typo (for example `אופקי/אפקי` or `ציר/צייר`) when the
  mathematical concept is still unambiguous. Diacritics and harmless spacing
  are ignored where appropriate; harmless punctuation may be ignored for
  word-like Hebrew answers only.
- Fuzzy tolerance applies only to word-like textual answers. It must never make
  a different mathematical concept correct (`אנכי` is not `אופקי`), and it
  must not loosen numeric answers, ordered data, strict sets, coordinates or
  mathematical structures. Numeric equivalence such as `1/2 = 0.5` remains
  mathematical, not spelling-based.
- Every page is open to a guest: a guest solves, receives feedback, and earns a
  page score exactly like a registered student. Guest progress is saved on the
  device only. Registration adds central save, cross-device resume, and teacher
  dashboard visibility, and copies guest history to the account.
- An answer may be checked automatically only when it is reviewed explicitly,
  encoded in canonical metadata, mathematically deterministic, or a verified
  valid range.
- Reviewed proofs and reviewed open-ended decisions must be bound to the
  current target signature and cite canonical source evidence. Prompt drift
  must make the old decision inapplicable.
- **Consolidation state (2026-08-18):** the 78-page import renumbered every
  page and changed wording on 66 pages. 588 of 735 reviewed proofs and 137 of
  161 reviewed open-ended decisions survived on unchanged prompt signatures
  and were mechanically re-keyed. The lapsed 147 proofs and 24 open-ended
  decisions, plus the new pages' targets, remain deliberately unkeyed until a
  fresh review cites exact canonical evidence. Current measured coverage is
  **729/1,150 targets (63.4%)** in `reports/answer-coverage.json`; coverage is
  raised only through reviewed/evidence-cited answers, never guessing.
- Unordered answer sets may be accepted only through the strict `set:` format;
  duplicates, omissions, and extra labels must remain incorrect.
- Never infer an answer merely from nearby prose. Open-ended, ambiguous,
  unsupported, and missing targets remain visibly ungraded for teacher review.
- Generated coverage reports must represent all pages 1–78 and remain
  synchronized with target order and runtime answer keys.

## Interactive feedback model — a teacher beside the learner

- Feedback is per QUESTION, not per keystroke. A question is the unit the
  canonical content already groups blanks into — a `.q-card`, or the finest
  labelled unit (`li`/`tr`/`completion-sentence`) where there is no card.
- Each question carries one small submit control displayed as **„להגיש ←”**;
  its accessible name is **„להגיש שאלה לבדיקה”**. The old wording „סיימתי
  שאלה” is retired and must not appear as the question-check action.
- Pressing the question submit control gives immediate feedback beside that
  same question. A fully correct question shows **✓ נכון**. If correction is
  needed, the verdict says **יש מה לתקן** or **נסה שוב**; correct parts remain
  locked and only unresolved parts stay editable.
- **The LMS should feel as if a supportive mathematics teacher is beside the
  learner.** Feedback is conversational, warm, encouraging, specific and
  pedagogically useful, while remaining truthful. It must never shame,
  frighten, mock, scold, or make a wrong answer sound correct.
- **Use a broad, non-repetitive bank of teacher feedback.** Consecutive
  questions should not mechanically repeat one phrase. Positive responses may
  vary naturally (for example: „כל הכבוד”, „איזה יופי”, „מצוין”, „יפה מאוד”,
  „בדיוק”, „מעולה — ממשיכים”, „נהדר, תפסת את הרעיון”, „עוד צעד טוב”). Wrong
  answers also receive positive support before correction (for example:
  „ננסה שוב”, „יש כאן משהו קטן לתקן”, „יפה שניסית — בוא נבדוק את הכיוון”,
  „כמעט; נשתמש ברמז וננסה שוב”). These are examples of tone, not a fixed list.
- Feedback should react to progress when possible: first-try success, successful
  correction, several consecutive correct answers, persistence after a mistake,
  completing a question, and completing a page can receive different wording.
  Avoid exaggerated praise on every click; variety and relevance matter more
  than decoration.
- A wrong verdict may **never** be the end of the feedback. Every wrong or
  partially wrong checked answer gets all three: (1) supportive teacher voice,
  (2) a useful mathematical hint/direction, and (3) a clear statement of the
  attempt/credit consequence. These are one coherent learning response, not
  three competing popups.
- **Hints never reveal the current answer.** They teach the rule, representation,
  comparison, self-check or next reasoning step without printing the missing
  word, target letter, coordinate or number. This remains true even after the
  final correction is exhausted.
- Guidance grows with the learner's need: after the initial mistake give a
  concise conceptual clue; after correction 1 give a clearer strategy; after
  correction 2 give stronger step-by-step direction; after correction 3, if
  still unresolved, give a final explanatory teaching message without turning
  it into a solution key.
- Hints derive from canonical task metadata and mathematical context, never a
  second hand-authored answer source. Relevant categories include axis identity,
  horizontal/vertical property, direction, scale/number, origin, relation, and
  ordered-pair position. A correct part stays locked and guidance addresses only
  unresolved parts where possible.
- Coordinate-system guidance follows the grade-7 curriculum emphases: distinguish
  axes, plot and read coordinates, orient within a coordinate system, use it for
  graphs/geometric representation, and read scale correctly. Guidance teaches
  these ideas without stating the current blank's answer.
- Registration, login, account and save-mode explanations belong **only on the
  landing/start screen before practice begins**. Numbered `#/workbook/:n` pages
  stay focused on mathematics, submit, feedback, hints, score, navigation, and
  essential error recovery.
- A verdict always uses shape + word, never colour alone: ✓ נכון, ◐ יש מה לתקן,
  ✕ נסה שוב, 🔒 נעול after first attempt + all three corrections, or ? נשמר
  לבדיקת המורה for unkeyed/open-ended work. Screen readers hear verdict,
  guidance and score-loss explanation; none of it appears in print.
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
- The dynamic solutions screen is teacher-gated; open solutions would undermine
  the first-attempt-plus-three-corrections learning model.

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
- Controls should **look as small and delicate as practical**. The visible
  shape, typography and padding should be compact; touch accessibility may use
  a larger invisible/outer hit area where needed rather than making the visible
  button look bulky.
- The per-question **„להגיש ←”** control is deliberately narrow and understated
  and sits immediately beside its result so the action and feedback read as one
  compact unit. It must never look like a large page-level call-to-action.
- Corrective hints, teacher feedback and score-loss feedback use calm neutral
  treatment with restrained borders and no neon/glow. They sit with the question
  and must not overwhelm the worksheet on mobile.
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
  1–100, attempt summary 0–4, monotonic progress, and bounded document shapes.
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