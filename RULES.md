# Coordinate LMS engineering rules

Updated: 2026-08-23

This file is the single source of truth for `yanivmizrachiy/coordinate-lms`.
Historical notes may explain past decisions, but they never override this file.
A current user instruction wins over older wording and this file must be reconciled immediately.

## 1. One master, one truth

- **`yanivmizrachiy/coordinate-lms` is the ONLY repository, the ONLY master, and the ONLY source of truth** for this project: workbook content, printable rendering, computerized practice, grading, persistence and teacher views.
- `yanivmizrachiy/coordinate-first-quadrant` is a **frozen historical archive**. Never develop, deploy, write to, or load runtime content from it.
- There is one canonical content model: `src/data/workbook/` plus the canonical solutions/print-aid sources. Never create a second computerized copy of a question, sentence, diagram, number, blank or page.
- Keep CONTENT, PRESENTATION and INTERACTION separate. Mathematical/content changes belong to the canonical workbook. LMS controls, feedback, hints, scores and persistence are an interactive layer. Print styling is a presentation layer.
- A correction is complete only when **source of truth + implementation + tests agree**. Demo-only or visual-only substitutes do not count.

## 2. Learn from corrections

- Read this file before changing the project.
- Every meaningful correction from the user must be converted into the most useful reusable rule, not treated as a one-off patch when it clearly applies elsewhere.
- Merge repeated or overlapping rules. Delete obsolete wording instead of accumulating contradictory notes.
- Do not optimize for fewer files. Optimize for one owner per responsibility, less duplication, less dead code and fewer places where the same rule can drift.
- Do not perform a broad refactor merely because it looks cleaner. A refactor must reduce real complexity or risk and must preserve working behavior.
- Preserve unrelated work and never rewrite shared history or force-push.
- Feature branches and draft PRs are allowed. Merge and production deployment require explicit confirmation for that operation.

## 3. Canonical worksheet: print and computerized practice

- **החוברת = 78 עמודים ממוספרים**. Preserve mathematics, wording, diagrams, RTL behavior, page order and print pagination unless a current content instruction changes them.
- **Printable and computerized pages are two renderings of the SAME worksheet** content, never two content products.
- Any canonical worksheet content change **must propagate automatically to both** printable and computerized renderings. Make the content change once.
- `#/workbook/:n` must render the canonical page itself and then add the LMS layer. A separately authored computerized worksheet is a defect.
- Before every page change classify it as CONTENT or INTERACTION/PRESENTATION. Content changes affect both renderings; LMS-only changes must not modify printable content.
- **Print/download controls are utilities for print/booklet surfaces**, not part of computerized student practice. No print/download button belongs inside `#/workbook/:n`.
- On-screen games may be attached as an LMS layer, but must not fork or rewrite canonical sheet HTML and must never appear in print.
- Solutions remain teacher-gated in the student LMS so they do not bypass the correction-and-learning process.

## 4. Student practice surface

- A numbered computerized page is first and foremost a student practice screen. Show only what helps the learner solve, receive feedback, understand progress and move between pages.
- Registration/login/account/save-mode explanations belong **only on the landing/start screen before practice**. Do not show them in numbered practice pages.
- Do not show legacy print/download actions, duplicate reader toolbars, duplicate navigation, a general `בדיקת תשובות` button, or other unrelated chrome inside practice.
- Each question has one small action displayed as **`להגיש ←`** with accessible name **`להגיש שאלה לבדיקה`**. The old action wording `סיימתי שאלה` is retired.
- Page submission remains separate: when the learner finishes the page, the page is submitted and receives its final page score.
- Correct parts stay correct and locked. The learner edits only unresolved parts.
- Typing/editing is never counted as an attempt. An attempt is counted only when a check is actually requested.

## 5. Scoring and correction model

- A learner completes a page and receives a page score. **100 is the maximum possible score; 0 is a valid minimum when no credit was earned.**
- Correct on the first checked attempt loses no credit: 100% of that target's credit.
- If the first checked answer is wrong, the learner receives **up to three correction opportunities**: first attempt + correction 1 + correction 2 + correction 3 = at most four checked attempts.
- Credit after checked mistakes is fixed and transparent:
  - first attempt correct: 100%
  - correction 1 correct: 75%
  - correction 2 correct: 50%
  - correction 3 correct: 25%
  - final correction still wrong: unresolved target locks with 0 credit
- Reload, retry, stale writes, reconnect or device changes must never reset attempts or refund lost credit.
- After every checked mistake/correction, tell the learner plainly which stage was used, how much credit was lost and how much can still be earned.
- UI explanations must mirror the real scoring calculation. Never maintain a second display-only grading model.
- Attempt limits and score fractions must have one code owner/configuration path. Firestore may duplicate a bound only because it executes separately; tests must keep it aligned at 0–4.
- Page submission must remain reachable. Unanswered targets may score 0; the learner must never be trapped on a page forever.

## 6. Feedback: a teacher beside the learner

- Feedback is per QUESTION, not per keystroke.
- A fully correct question shows **✓ נכון**. Partial work shows **◐ יש מה לתקן**. A wrong answer shows **✕ נסה שוב**. A locked unresolved answer shows **🔒 נעול**. Open/unkeyed work may show **? נשמר לבדיקת המורה**.
- The LMS should feel as if a supportive mathematics teacher is beside the learner: warm, specific, truthful, encouraging and pedagogically useful.
- Use a broad, non-repetitive bank of natural teacher feedback. Avoid mechanically repeating the same praise or correction phrase on consecutive questions.
- Positive feedback should vary according to context: first-try success, successful correction, persistence, a streak of correct answers, completing a question and completing a page may receive different wording.
- Examples of the intended tone include `כל הכבוד`, `איזה יופי`, `מצוין`, `יפה מאוד`, `בדיוק`, `מעולה — ממשיכים`, `נהדר, תפסת את הרעיון`, but these are examples, not a fixed list.
- A wrong/partial answer must also receive encouragement before correction. Examples of tone: `ננסה שוב`, `יש כאן משהו קטן לתקן`, `יפה שניסית — בוא נבדוק את הכיוון`, `כמעט; נשתמש ברמז וננסה שוב`.
- Never shame, scold, frighten or mock a learner. Never praise a mathematically wrong answer as though it were correct.
- A wrong verdict may never be the whole response. Every checked wrong/partial answer receives one coherent learning response containing:
  1. supportive teacher voice;
  2. a useful mathematical hint/direction;
  3. the real attempt/score consequence.
- Keep the response readable and calm; do not create competing popups or visual noise.

## 7. Corrective hints

- Hints **never reveal the current answer**: not the missing word, axis letter, number, coordinate or final result.
- Support grows progressively:
  - after the initial mistake: concise conceptual clue;
  - after correction 1: clearer strategy;
  - after correction 2: stronger step-by-step direction;
  - after correction 3 if still unresolved: final explanatory teaching guidance, still without giving the answer.
- Hints teach the governing idea, representation, comparison, self-check or next reasoning step.
- Hints derive from canonical task metadata and mathematical context, never from a second hand-authored answer source.
- For coordinate-system work, guidance follows the grade-7 curriculum ideas: distinguish axes, horizontal/vertical meaning, origin, read scale, read coordinates, plot points, ordered-pair order, movement/direction and use coordinates in graphs/geometric representations.
- When only part of a multi-part question is wrong, guidance should address the unresolved part; correct parts remain locked.

## 8. Answer acceptance: forgiving language, strict mathematics

- Harmless input variation must not cost points.
- Axis letters are case-insensitive: `x/X` and `y/Y` are equivalent.
- Hebrew word-like answers may accept common full/defective spelling and **one small harmless typo** when the intended mathematical concept remains unambiguous (for example `אופקי/אפקי`, `ציר/צייר`).
- Diacritics and harmless spacing may be ignored. Harmless punctuation may be ignored only for word-like textual answers.
- Fuzzy spelling must never turn a different concept into a correct answer: `אנכי` is not `אופקי`.
- Numeric answers, coordinates, ordered data, sets and other mathematical structures remain mathematically strict. Numeric equivalence such as `1/2 = 0.5` is allowed because it is mathematically equivalent, not because of fuzzy text matching.
- A deterministic answer encoded directly in the canonical target/page metadata is authoritative for that target. Stale positional/default/local/remote keys must not override an explicit canonical answer attached to the current target.
- Never infer a supposedly correct answer from nearby prose. Ambiguous/open-ended items remain ungraded or teacher-reviewed until supported by canonical evidence.

## 9. Interface design

- Practice controls use a **quiet, compact, premium app language**: neutral navy/slate/white surfaces, thin borders, restrained shadows, no neon, no saturated navigation blocks, no sheen and no decorative glow.
- Controls should **look small and delicate** while remaining easy to tap. Prefer a compact visible button with an adequate touch target rather than a bulky visual block.
- `להגיש ←` is narrow and understated and sits beside its verdict/feedback. It must not look like a large page-level CTA.
- Previous/next navigation is one calm navigation system, distinguished by label/arrow/position rather than loud colors.
- Secondary tools belong behind a quiet overflow control where appropriate. Do not duplicate primary navigation.
- Feedback/hint/score-loss panels are compact, calm and readable on mobile and must not overwhelm the worksheet.
- The special celebration for a perfect page score of 100 is an intentional exception to the otherwise restrained interface.

## 10. Persistence, privacy and authorization

- Local save and central Firebase synchronization are different states. Never tell a learner that central save succeeded unless it actually did.
- Central failures must be visible and retryable without duplicating attempts, results or activity events.
- Guest progress is local-only; registration enables central save, cross-device continuation and teacher-dashboard visibility. Guest history is copied safely before source guest records are removed.
- Concurrent/stale writes must preserve the latest valid state, best score, highest attempt count and completed/locked states.
- Students may access only their own data. Class-wide data and answer-key writes are administrator-only.
- Firestore writes use field allowlists and enforce pages 1–78, scores 0–100, attempt summary 0–4, monotonic progress and bounded document shapes.
- Never commit, expose or invent credentials.

## 11. Engineering discipline

- The first download stays small: screens are dynamically imported and Firebase must not leak into the entry module.
- Keep one owner for each behavior. Delete dead compatibility/patch code once the canonical implementation owns the behavior and tests prove it is unused.
- Do not keep stale historical statistics or temporary migration counts in this source-of-truth file. Such data belongs in generated reports/history, because volatile numbers can become false rules.
- Do not delete a working subsystem merely to reduce file count. Delete/move only code that is demonstrably duplicate, dead, obsolete or contradictory.
- Automated guards should protect product principles, not incidental filenames or implementation trivia.

## 12. Future change map — edit the owner, not every consumer

- **Worksheet text, mathematics, diagrams, blanks and page order:** `src/data/workbook/`.
- **Attempt limit:** `src/lms/config.ts`. The Firestore bound in `firestore.rules` is the only intentional mirror because security rules execute separately; its contract tests must change in the same commit.
- **Score/credit curve:** `src/lms/scoring.ts`.
- **Answer normalization/tolerance:** `src/lms/answerValidation.ts`.
- **Explicit canonical answer capture:** `src/lms/implicitAnswers.ts`; **answer-key precedence/persistence:** `src/lms/repository.ts`.
- **Teacher wording/encouragement:** `src/lms/teacherVoice.ts`.
- **Pedagogical hints:** `src/lms/hintCoach.ts`.
- **Per-question grading/state machine and page submission:** `src/lms/engine.ts`.
- **Computerized page shell/navigation:** `src/views/pageViewer.ts` and its practice-shell styles; do not copy worksheet content there.
- **Persistence, retries, merge semantics and dashboard loading:** `src/lms/repository.ts` plus the dedicated sync modules.
- **Authorization/data boundaries:** `firestore.rules`.
- Tests should import runtime policy/configuration where possible instead of repeating magic numbers. A test may duplicate a value only when it is deliberately verifying an external contract such as Firestore rules.
- Do not create another architecture/preferences/rules document. If ownership changes, update this map here.

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

`npm run verify` must cover answer coverage, typecheck, unit/content tests, Firestore authorization tests, build and visual/e2e checks in one command.

Normal PR CI proves repository engineering health. It may generate `release:report:static` as evidence even when external Firebase configuration, pedagogical review or physical two-device acceptance is still blocked; those external blockers must be reported, not disguised as code failures.

`npm run release:check` is the strict release gate. It must fail while any required production configuration or acceptance evidence is incomplete.

Do not describe the product as production-ready while required external configuration or acceptance evidence is incomplete. Do not merge or deploy to production without the required explicit confirmation.