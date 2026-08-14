# Coordinate LMS engineering rules

Updated: 2026-08-14

This is the single source of truth for work in `yanivmizrachiy/coordinate-lms`.
`USER_MEMORY.md` and `HANDOFF.md` preserve historical workbook decisions, but
they do not override this file. When a current user instruction conflicts with
this file, the current instruction wins and this file must be reconciled.

## Repository and change boundary

- The only writable repository for LMS work is
  `yanivmizrachiy/coordinate-lms`.
- `yanivmizrachiy/coordinate-first-quadrant` is the canonical source workbook
  and is read-only. Never commit, push, merge, deploy, or otherwise modify it
  while doing LMS work.
- Preserve unrelated work and never rewrite shared history. Do not use
  `git reset --hard`, force-push, or forced dependency-audit fixes.
- A feature branch and draft pull request are allowed. Merging and production
  deployment require explicit confirmation for the current operation.
- Never print, commit, expose, or invent credentials.

## Canonical workbook integrity and synchronization

- The printed workbook is the content and graphics source of truth. Its current
  canonical order contains 78 numbered pages; the LMS must be brought into and
  kept in one-to-one synchronization with that source rather than maintaining a
  separately edited copy.
- Canonical Hebrew wording, mathematics, diagrams, page order, RTL behavior,
  A4 pagination, colours, typography, and graphic layout must remain identical
  by default between print and the computerized page.
- A change in the canonical printed source must cause the corresponding digital
  page content/graphics to change automatically. CI must detect source/LMS drift
  and block a release rather than silently allowing the two versions to diverge.
- LMS behavior is an interactive overlay. Interactive controls must be hidden or
  print-neutral and must not obstruct canonical diagrams.
- **Printed-source protection:** the current interaction and answer-checking work
  applies only to the computerized/LMS pages. Do not edit the printable workbook,
  print-source files, printed wording, printed diagrams, or printed layout in
  order to make computerized checking easier.
- **Digital-only exception:** if a canonical printed question genuinely cannot
  support objective computerized checking, do not alter the printed source.
  The rendered digital layer may omit that response from grading or replace it
  with a deterministic computerized question that checks the same mathematical
  skill. Digital adaptations must never leak into printed output.
- A good canonical question must not be removed merely because several answer
  orders or notations are valid. Prefer a strict-but-flexible checker that
  accepts every mathematically equivalent valid arrangement and rejects
  duplicates, omissions, or invalid combinations.
- Canonical workbook details recorded in `USER_MEMORY.md` remain a historical
  content contract only where they do not conflict with this file or a current
  instruction.

## Scoring, access, and answer policy

- Every submitted page score is an integer from 1 through 100. The retired
  0–1200 model must never return.
- Every automatically checked answer allows at most three attempts. Reload,
  retry, stale writes, or reconnection must never reset that count.
- Pages 1 and 2 are guest-accessible. Page 3 onward requires registration.
- An answer may be checked automatically only when it is reviewed explicitly,
  encoded in canonical metadata, mathematically deterministic, or a verified
  valid range.
- **Interactive point-selection rule:** when the printed task asks the student to
  mark, choose, or place a point on a diagram or coordinate grid, the computerized
  task must use direct interaction with that diagram whenever practical. The
  student clicks/taps the chosen location, the LMS visibly marks that selected
  point, and submission checks the mathematical condition of the task. Typing a
  coordinate is not a substitute when the intended computerized interaction is
  point selection.
- A point-selection task is **not open-ended merely because many points can be
  correct**. If the requirement is mathematically objective, the checker must
  accept every selectable point that satisfies the requirement and reject every
  selectable point that does not. Examples include `y = 6`, a point on the x-axis,
  a point on the x-axis to the right of B, or any other deterministic geometric
  predicate. These tasks require no teacher judgment.
- The checker must validate the student's actual selected location against the
  task predicate at submission time. It must not rely on one pre-authored sample
  coordinate, and it must not reject a mathematically valid alternative merely
  because it differs from an example answer.
- Reviewed proofs and reviewed open-ended decisions must be bound to the
  current target signature and cite canonical source evidence. Prompt drift
  must make the old decision inapplicable.
- Normal student notation variants must be accepted when their meaning is
  unambiguous. Examples include case differences (`x`/`X`), safe Hebrew axis
  spellings (`איקס`, `וואי`), Hebrew-keyboard axis-key slips when an axis name
  is expected, harmless spacing, and numerically equivalent forms such as
  common fractions and decimals.
- Flexible matching must be context-bound: never turn a permissive alias into a
  global rule that could make a mathematically different answer pass.
- Unordered answer sets and order-flexible multi-blank answers may be accepted
  only when the complete combination is valid; duplicates, omissions, and
  mixed invalid combinations must remain incorrect.
- Never infer an answer merely from nearby prose. Open-ended, unsupported, or
  genuinely non-deterministic targets remain ungraded unless the digital-only
  exception above replaces them with an objective equivalent. A task with many
  valid answers is not considered non-deterministic when membership in the set
  of valid answers can be checked objectively.
- Generated JSON and Markdown coverage reports must remain synchronized with
  target order, digital adaptations, and runtime answer keys.

## Student feedback and teacher visibility

- Each objectively checkable response gives immediate per-question feedback:
  a small green success mark for a correct answer and a red failure mark for an
  incorrect answer, while preserving the three-attempt rule.
- After page submission, show the final page score prominently in red inside a
  red circle and persist the score together with the student's answers and
  attempt counts.
- In the initial release, only the configured administrator (Yaniv) may view
  class-wide student results. Students may view only their own data.
- The administrator view must ultimately expose question-level correctness and
  attempts, not only a page-level score.

## Persistence truth and classroom data

- Local persistence success and central Firebase synchronization success are
  distinct states. Never tell a student that data was saved centrally unless
  the central write actually succeeded.
- Central failures must be visible and retryable. Retries must be idempotent and
  must not duplicate results, attempts, or activity events.
- Guest progress from pages 1–2 must be copied to an account before guest source
  records are removed. A failed central transfer leaves the guest source intact.
- Concurrent and stale writes must preserve the latest valid state, the best
  score, the highest attempt count, and any completed/locked state.
- Teacher views must distinguish a central class snapshot from local fallback
  data and expose synchronization errors rather than hiding them.

## Firebase and authorization

- Production registration fails closed unless all required Firebase client
  settings are configured. Browser-only accounts are development-only or
  require an explicit opt-in that is disabled by production workflows.
- Never claim Firebase is operational until Authentication, Firestore, GitHub
  secrets, rules/index deployment, and a real two-device acceptance test have
  all been verified.
- Students may read and write only their own profile and subcollections.
  Dashboard-wide reads and answer-key writes are administrator-only.
- Firestore writes must use field allowlists and enforce the current canonical
  page range, score 1–100, attempt summary 0–3, monotonic progress, and bounded
  document shapes. Do not hard-code a stale workbook page count.
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
