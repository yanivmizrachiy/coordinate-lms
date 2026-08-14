# Coordinate LMS engineering rules

Updated: 2026-08-14

This file is the **single and only source of truth** for work in `yanivmizrachiy/coordinate-lms`.
No README, status document, handoff, memory file, PR description, comment, test fixture, legacy file, or old instruction may override it. If anything in the repository contradicts this file, the contradictory text/code/configuration must be removed or reconciled.

## 1. Repository boundary

- The only writable repository for LMS work is `yanivmizrachiy/coordinate-lms`.
- `yanivmizrachiy/coordinate-first-quadrant` is the canonical printable workbook repository and is **strictly read-only** during LMS work.
- Never commit, push, merge, deploy, rewrite, or otherwise modify the printable repository while implementing or fixing the computerized version.
- Never print, commit, expose, or invent credentials.
- Preserve unrelated work and never rewrite shared history with destructive git operations.

## 2. Iron rule: every printable page becomes computerized

- The printable workbook is the canonical source for the computerized workbook.
- **Every canonical printable page must have a corresponding computerized page. No printable page may be omitted, replaced by unrelated content, skipped, or treated as optional.**
- The current canonical printable workbook contains **78 numbered pages**. The LMS must track the canonical source dynamically and must not hard-code an obsolete page count.
- The computerized version starts from the printable page itself: same mathematical content, same questions, same diagrams, same page order, same Hebrew wording, same RTL behavior, same visual hierarchy, same colours, same typography, and the same intended learning progression.
- The printable design is not merely a reference. It is the visual/content base from which the computerized page is built.
- A change in the canonical printable source must propagate to the corresponding computerized page. CI must detect source/LMS drift and block release rather than silently allow divergence.
- The LMS must maintain a one-to-one mapping between canonical printable pages and computerized pages.

## 3. Printable pages are never modified for LMS needs

- All interaction, answer checking, scoring, registration, persistence, Firebase logic, pedagogical adaptation, and UI controls belong only to the computerized/LMS layer.
- **Do not change printable wording, printable questions, printable diagrams, printable layout, printable page order, or printable source files in order to make computerized checking easier.**
- Interactive controls must be digital-only and must not leak into printable output.
- A computerized adaptation may change the response mechanism, but not the mathematical learning objective of the original printable question.

## 4. Computerized interaction must match the mathematical action

- Do not reduce every computerized task to typing into a text field.
- If the printable task asks the student to mark, choose, drag, place, connect, or identify something visually, the computerized version must use a suitable direct interaction whenever practical.
- For coordinate-grid point tasks, the student clicks/taps the desired point directly on the grid, the LMS visibly marks the selected point, and submission checks that graphical choice.
- Typing a coordinate is not a substitute when the intended computerized action is direct point selection.

## 5. Multiple valid answers are checked mathematically

- A task is **not open-ended merely because many answers can be correct**.
- If correctness can be expressed as an objective mathematical condition, the LMS must check that condition automatically. No teacher judgment is required.
- For point-selection tasks, validate the student's selected location against the mathematical predicate at submission time.
- Accept every selectable point that satisfies the requirement and reject every selectable point that does not.
- Examples: any point with `y = 6`; any point on the x-axis; any point on the x-axis to the right of B; any other deterministic geometric condition.
- Never rely on one sample coordinate when the task permits an entire set of correct coordinates.
- Never reject a mathematically valid alternative merely because it differs from an example answer.

## 6. Pedagogical conversion of explanation questions

- Questions such as **"הסבר מדוע"** must not remain uncheckable free text by default in the computerized version.
- The default computerized adaptation is a carefully designed choice task with **four answer options**, unless pedagogical review establishes that another objectively checkable interaction preserves the original learning goal better.
- Normally use one best correct explanation and three plausible distractors based on realistic student misconceptions or partial reasoning.
- Distractors must be mathematically and didactically meaningful. Do not use silly, unrelated, grammatically revealing, or obviously wrong options.
- The correct option must not be identifiable merely because it is longer, more precise, uniquely formatted, or stylistically different.
- The task must be neither artificially easy nor artificially difficult. It must require genuine mathematical thought appropriate to the original question.
- Creating these alternatives requires high-level pedagogical reasoning: identify the concept, anticipate common misconceptions, preserve the original cognitive demand, and construct diagnostic distractors.
- This adaptation occurs **only in the computerized layer**. The printable question remains unchanged.

## 7. Answer-checking policy

- An answer may be checked automatically when it is reviewed explicitly, encoded in canonical metadata, mathematically deterministic, or expressible as a verified valid range/predicate.
- Reviewed answer logic must be bound to the current target signature and canonical source evidence. Prompt drift invalidates stale grading logic.
- Normal unambiguous notation variants must be accepted, including harmless spacing, equivalent numeric forms, safe x/X variants, and safe Hebrew axis spellings where context permits.
- Flexible matching must remain context-bound and must never make a mathematically different answer pass.
- Unordered sets and order-flexible multi-blank answers may pass only when the complete mathematical combination is valid; duplicates, omissions, and invalid mixtures remain wrong.
- Never invent one fixed answer for a task whose valid solution set contains many responses. Encode the mathematical condition instead.
- A target may remain genuinely ungraded only after pedagogical review proves that no objective computerized equivalent can preserve the original learning objective.

## 8. Scoring and attempts

- Every submitted page score is an integer from 1 through 100.
- Every automatically checked answer allows at most three attempts.
- Reload, retry, stale writes, or reconnection must never reset the attempt count.
- Pages 1 and 2 are guest-accessible. Page 3 onward requires registration.
- Each objectively checkable response gives immediate per-question feedback: green success for correct and red failure for incorrect, while preserving the attempt rule.
- For graphical tasks, feedback applies to the submitted graphical choice, not to a surrogate typed answer.
- After page submission, persist the score, answers, and attempt counts.

## 9. Student and teacher visibility

- Students may view only their own data.
- Only the configured administrator may view class-wide student results in the initial release.
- The administrator view must expose question-level correctness and attempts, not only page-level scores.

## 10. Persistence and Firebase truth

- Local persistence success and central Firebase synchronization success are different states.
- Never tell a student data was saved centrally unless the central write actually succeeded.
- Central failures must be visible, retryable, and idempotent.
- Retries must not duplicate results, attempts, or activity events.
- Guest progress must be copied to an account before guest source records are removed; failed transfer preserves the source.
- Concurrent/stale writes must preserve the latest valid state, best score, highest attempt count, and completed/locked state.
- Teacher views must distinguish central Firebase data from local fallback and expose synchronization errors.

## 11. Firebase and authorization

- Production registration fails closed unless all required Firebase client settings are configured.
- Browser-only accounts are development-only or require explicit production-disabled opt-in.
- Never claim Firebase is operational until Authentication, Firestore, GitHub secrets, rules/index deployment, and a real two-device acceptance test have all been verified.
- Students may read/write only their own profile and subcollections.
- Class-wide reads and answer-key writes are administrator-only.
- Firestore rules must use field allowlists and validate the **current canonical page range**, score 1–100, attempt summary 0–3, monotonic progress, and bounded document shapes.
- Do not hard-code a stale workbook page count.

## 12. Documentation and source-of-truth hygiene

- `RULES.md` is the only normative rule document.
- `README.md` may describe the project but must not define competing rules.
- Status reports may describe current implementation gaps but must not redefine requirements.
- Historical memory/handoff documents must not contain active rules that compete with `RULES.md`; contradictory historical instructions must be removed rather than left as an alternative authority.
- PR descriptions and comments are status/history only and must be reconciled when they contain obsolete claims such as 77 pages, teacher judgment for mathematically deterministic tasks, or permanent ungraded treatment for tasks that can be objectively computerized.
- Any repository text or code that conflicts with the canonical 78-page one-to-one mapping or the rules above is a defect.

## 13. Required quality gates

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

CI must also verify canonical print/LMS page synchronization and reject documentation/runtime drift.
A release must additionally have passing readiness, deployed authorization rules, and recorded two-device acceptance evidence.
Do not describe the product as production-ready while any required gate or external prerequisite is incomplete.
