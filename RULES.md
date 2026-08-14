# Coordinate LMS engineering rules

Updated: 2026-08-14

This is the single source of truth for work in `yanivmizrachiy/coordinate-lms`.
`USER_MEMORY.md` and `HANDOFF.md` preserve historical workbook decisions, but
they do not override this file. When a current user instruction conflicts with
this file, the current instruction wins and this file must be reconciled.

## Repository and change boundary

- The only writable repository for LMS work is
  `yanivmizrachiy/coordinate-lms`.
- `yanivmizrachiy/coordinate-first-quadrant` is the canonical printable workbook
  source and is strictly read-only during LMS work. Never commit, push, merge,
  deploy, rewrite, or otherwise modify it while implementing computerized pages.
- **All current interaction, answer-checking, pedagogical adaptation, and UI work
  applies only to the computerized/LMS pages. The ordinary printable pages must
  not be changed for these requirements.**
- Preserve unrelated work and never rewrite shared history. Do not use
  `git reset --hard`, force-push, or forced dependency-audit fixes.
- A feature branch and draft pull request are allowed. Merging and production
  deployment require explicit confirmation for the current operation.
- Never print, commit, expose, or invent credentials.

## Canonical workbook integrity and synchronization

- The printable workbook is the content and graphics source of truth. Its current
  canonical order contains 78 numbered pages; the LMS must be brought into and
  kept in one-to-one synchronization with that source rather than maintaining a
  separately edited print copy.
- Canonical Hebrew wording, mathematics, diagrams, page order, RTL behavior,
  A4 pagination, colours, typography, and graphic layout must remain identical
  by default between print and the computerized page.
- A change in the canonical printable source must cause the corresponding digital
  page content/graphics to change automatically. CI must detect source/LMS drift
  and block a release rather than silently allowing the two versions to diverge.
- LMS behavior is an interactive overlay. Interactive controls must be hidden or
  print-neutral and must not obstruct canonical diagrams.
- Never edit printable wording, diagrams, layout, or source files merely to make
  computerized checking easier. Any necessary pedagogical or interaction change
  belongs only in the digital adaptation layer.
- A good canonical question must not be removed merely because several answers,
  answer orders, positions, or notations are valid. Prefer an objective checker
  that accepts every mathematically valid response and rejects invalid ones.
- Canonical workbook details recorded in `USER_MEMORY.md` remain a historical
  content contract only where they do not conflict with this file or a current
  instruction.

## Computerized interaction is part of the task

- The computerized page must preserve the mathematical action the student is
  supposed to perform. Do not reduce every task to typing into a text field.
- When the task asks the student to mark, choose, or place a point on a diagram or
  coordinate grid, the computerized task must use direct click/tap interaction on
  that diagram whenever practical.
- The student clicks or taps the chosen location, the LMS visibly marks the
  selected point, and the student submits that actual graphical choice.
- Typing a coordinate is not a substitute when the intended computerized action
  is point selection.
- Similar principles apply to other inherently visual actions: use an appropriate
  direct digital interaction rather than replacing the mathematical action with
  unnecessary text entry.

## Objective checking of multiple valid answers

- A task is **not open-ended merely because many answers can be correct**.
- If validity can be expressed as an objective mathematical condition, the LMS
  must check that condition automatically. No teacher judgment is required.
- For point-selection tasks, the checker validates the student's actual selected
  location against the mathematical predicate at submission time.
- It must accept every selectable point that satisfies the requirement and reject
  every selectable point that does not.
- Examples include: any point with `y = 6`; any point on the x-axis; any point on
  the x-axis to the right of B; or any other deterministic geometric condition.
- The checker must never rely on one sample coordinate when the task permits a
  whole set of correct coordinates.
- A mathematically valid alternative must not be rejected merely because it
  differs from an example answer or from the author's first chosen example.

## Pedagogical conversion of explanation questions

- Questions such as **"הסבר מדוע"** must not remain free-text by default in the
  computerized version merely because automatic checking of prose is difficult.
- The preferred digital adaptation is a carefully designed selection task with
  **four answer choices** (or an equivalent compact choice control when the UI
  requires it), while preserving the same mathematical idea and cognitive goal.
- There should normally be one best correct explanation and three plausible
  distractors based on realistic student misconceptions or partial reasoning.
- Distractors must be mathematically and didactically meaningful. Do not use silly,
  obviously wrong, grammatically revealing, or unrelated options.
- The correct option must not be identifiable merely because it is longer, more
  precise in wording, uniquely formatted, or noticeably different in style.
- The task must be neither artificially easy nor artificially difficult. It should
  require genuine mathematical thought at the level appropriate to the original
  question.
- Creating the four options requires high-quality pedagogical reasoning: identify
  the intended concept, anticipate common misconceptions, preserve the original
  level of thinking, and construct distractors that diagnose understanding rather
  than reward guessing.
- The digital adaptation must preserve the mathematical learning objective of the
  printable question. It may change only the computerized response mechanism and
  digital wording needed to make the task objectively checkable.
- Do not change the printable question or printable page to implement this rule.

## Scoring, access, and answer policy

- Every submitted page score is an integer from 1 through 100. The retired
  0–1200 model must never return.
- Every automatically checked answer allows at most three attempts. Reload,
  retry, stale writes, or reconnection must never reset that count.
- Pages 1 and 2 are guest-accessible. Page 3 onward requires registration.
- An answer may be checked automatically only when it is reviewed explicitly,
  encoded in canonical metadata, mathematically deterministic, or a verified
  valid range/predicate.
- Reviewed answer logic must be bound to the current target signature and cite
  canonical source evidence. Prompt drift must make the old decision inapplicable.
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
- Never invent a single answer for a task whose correct solution set contains
  many valid responses. Encode the actual mathematical validity condition instead.
- A target should remain genuinely ungraded only when no objective digital
  equivalent can preserve the learning objective after pedagogical review.
- Generated JSON and Markdown coverage reports must remain synchronized with
  target order, digital adaptations, interaction type, and runtime answer keys.

## Student feedback and teacher visibility

- Each objectively checkable response gives immediate per-question feedback:
  a small green success mark for a correct answer and a red failure mark for an
  incorrect answer, while preserving the three-attempt rule.
- For graphical point-selection tasks, feedback applies to the submitted graphical
  choice, not to a separately typed surrogate answer.
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
