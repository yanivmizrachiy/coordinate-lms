# Coordinate LMS engineering rules

Updated: 2026-08-24

This file is the single source of truth for `yanivmizrachiy/coordinate-lms`.
Historical notes may explain past decisions, but they never override this file.
A current user instruction wins over older wording and this file must be reconciled immediately.

## 1. One master, one truth

- **`yanivmizrachiy/coordinate-lms` is the ONLY repository, the ONLY master, and the ONLY source of truth** for this project: workbook content, printable rendering, computerized practice, grading, persistence and teacher views.
- `yanivmizrachiy/coordinate-first-quadrant` is a **frozen historical archive**. Never develop, deploy, write to, or load runtime content from it.
- There is one canonical content model: `src/data/workbook/` plus the canonical solutions/print-aid sources. Never create a second computerized copy of a question, sentence, diagram, number, blank or page.
- Keep CONTENT, PRESENTATION and INTERACTION separate. Mathematical/content changes belong to the canonical workbook. LMS controls, feedback, hints, scores and persistence are an interactive layer. Print styling is a presentation layer.
- A correction is complete only when **source of truth + implementation + tests agree**. Demo-only or visual-only substitutes do not count.
- **There must never be more than one live source-of-truth document. `RULES.md` is that document.** Do not create another rules, memory, architecture-preferences or product-authority document. Generated reports and historical evidence are never sources of truth.

## 2. Learn from corrections and repair safely

- Read this file before changing the project.
- **Every project-changing action must be reconciled with this file in the same change set.** If behavior, requirements, ownership, scoring, feedback, persistence or release rules change, update `RULES.md` as part of that work. Do not let implementation move ahead of the source of truth.
- Keep this file useful rather than noisy: record durable rules and ownership, merge repeated wording, and do not add temporary operational chatter merely to prove that an action happened.
- Every meaningful correction from the user must be converted into the most useful reusable rule, not treated as a one-off patch when it clearly applies elsewhere.
- **When refining the product with the user, discuss and test only questions, pages and behavior that actually exist in this repository. Do not invent unrelated sample questions or pretend examples are project content.** If a computerized adaptation is being designed, start from the exact existing worksheet task and make the adaptation explicit.
- Merge repeated or overlapping rules. Delete obsolete wording instead of accumulating contradictory notes.
- During a repair/cleanup pass, change only a **verified defect, direct contradiction with a current requirement, or a demonstrated maintenance hazard**. Do not add opportunistic features or broad redesigns while repairing failures.
- Before a multi-step repair, keep a short explicit work plan: what is broken, what will change, what must stay untouched, and which gates prove the repair. Finish that repair and its tests before expanding scope.
- Do not optimize for fewer files. Optimize for one owner per responsibility, less duplication, less dead code and fewer places where the same rule can drift.
- Do not perform a broad refactor merely because it looks cleaner. A refactor must reduce real complexity or risk and must preserve working behavior.
- Preserve unrelated work and never rewrite shared history or force-push.
- Feature branches and draft PRs are allowed. Merge and production deployment require explicit confirmation for that operation.

## 3. Canonical worksheet: print and computerized practice

- **החוברת = 78 עמודים ממוספרים**. Preserve mathematics, wording, diagrams, RTL behavior, page order and print pagination unless a current content instruction changes them.
- **Printable and computerized pages are two renderings of the SAME worksheet learning content**, not two unrelated products.
- Any canonical worksheet content change **must propagate automatically to both** printable and computerized renderings unless the difference is an intentional interaction-only adaptation required for deterministic computerized grading.
- `#/workbook/:n` must render the canonical page itself and then add the LMS layer. Do not create a separately authored computerized workbook.
- **A printed open-ended task may become an interaction-only closed task on screen when that is necessary to make grading exact.** The computerized version must preserve the same mathematical skill and use the real printed task as its source; it may replace an ungradeable free response with four carefully designed choices containing exactly one correct answer and three pedagogically meaningful distractors.
- Computerized adaptations must never make the printed worksheet change merely to satisfy the LMS. They belong to the interaction layer and must be hidden from print.
- The practice rendering keeps the canonical A4 **width** but is never height-clipped: the interaction layer may make a dense page taller than one printed page, and every question must remain visible and answerable on screen. Print pagination is a print-surface property and stays exactly A4.
- Before every page change classify it as CONTENT or INTERACTION/PRESENTATION. Content changes affect both renderings; LMS-only changes must not modify printable content.
- **Print/download controls are utilities for print/booklet surfaces**, not part of computerized student practice. No print/download button belongs inside `#/workbook/:n`.
- On-screen games may be attached as an LMS layer, but must not fork or rewrite canonical sheet HTML and must never appear in print.
- Solutions remain teacher-gated in the student LMS so they do not bypass the correction-and-learning process.

## 4. First entry and student practice surface

- `#/` is the mandatory first-entry screen. Its main job is an immediate, unmistakable choice between exactly two primary actions: **`לתרגל עם רישום`** and **`לתרגל בלי רישום`**.
- On phones, **both primary buttons and their short explanations must be fully visible immediately without vertical or horizontal scrolling**, including compact Android phones, iPhone-class widths/heights and phone landscape. Use safe-area-aware viewport sizing (`svh`/equivalent) and automated viewport tests rather than assuming `100vh` is sufficient.
- The explanation under **`לתרגל עם רישום`** must say briefly that scores/progress are saved, work can continue on another device after sign-in and the teacher can see progress. The registration/sign-in screen may contain the fuller account explanation.
- The explanation under **`לתרגל בלי רישום`** must say briefly that practice starts immediately with feedback and a page score, but the score is not saved and is not visible to the teacher.
- Existing users reach sign-in through the **with-registration** path; do not add a third large competing entry button to the first screen.
- The rich learning/materials landing is a separate route at `#/home`. It must **not** be auto-loaded underneath `#/`; the first-entry explanation stays lightweight and must not import Firebase or the heavy materials surface.
- A numbered computerized page is first and foremost a student practice screen. Show only what helps the learner solve, receive feedback, understand progress and move between pages.
- Registration/login/account/save-mode explanations belong **only before practice**, never inside numbered practice pages.
- Do not show legacy print/download actions, duplicate reader toolbars, duplicate navigation, a general `בדיקת תשובות` button, or other unrelated chrome inside practice.
- Each question has one small action displayed as **`להגיש ←`** with accessible name **`להגיש שאלה לבדיקה`**. The old action wording `סיימתי שאלה` is retired.
- Page submission remains separate: when the learner finishes the page, the page is submitted and receives its final page score.
- Correct parts stay correct and locked. The learner edits only unresolved parts.
- Typing/editing is never counted as an attempt. An attempt is counted only when a check is actually requested.

## 5. Scoring and correction model

- A learner completes a page and receives a page score. **100 is the maximum possible score; 0 is a valid minimum when no credit was earned.**
- **Every scored target in computerized practice must have a deterministic correct answer before release. There is no teacher-judgment, ambiguous or unkeyed target inside the computerized page score.**
- Release/coverage checks must fail if even one computerized answer target cannot be graded deterministically. Open-ended or ambiguous printed work must be adapted on screen before release rather than silently excluded from the denominator.
- **After the learner submits a page, the final page grade is shown prominently in red.** The numeric grade remains red at every score, including 100; a perfect-score celebration may add restrained decoration without changing the grade colour.
- Every final page score is accompanied by a short **Hebrew teacher comment appropriate to the score band**. The wording must come from one maintained feedback owner, vary naturally across pages, and remain truthful: strong scores receive positive reinforcement; middle scores combine recognition with a concrete review suggestion; low scores clearly say more practice is needed without shaming the learner.
- Correct on the first checked attempt loses no credit: 100% of that target's credit.
- If the first checked answer is wrong, the learner receives **up to three correction opportunities**: first attempt + correction 1 + correction 2 + correction 3 = at most four checked attempts.
- Credit after checked mistakes is fixed and transparent:
  - first attempt correct: 100%
  - correction 1 correct: 75%
  - correction 2 correct: 50%
  - correction 3 correct: 25%
  - final correction still wrong: unresolved target locks with 0 credit
- **A learner who answers incorrectly once, receives the first hint and then answers correctly earns 75% of that target's credit, never 100%.** The hint does not erase the checked mistake.
- Reload, retry, stale writes, reconnect or device changes must never reset attempts or refund lost credit.
- After every checked mistake/correction, tell the learner plainly which stage was used, how much credit was lost and how much can still be earned.
- UI explanations must mirror the real scoring calculation. Never maintain a second display-only grading model.
- Attempt limits and score fractions must have one code owner/configuration path. Firestore may duplicate a bound only because it executes separately; tests must keep it aligned at 0–4.
- Page submission must remain reachable. Unanswered targets may score 0; the learner must never be trapped on a page forever.

## 6. Feedback: a teacher beside the learner

- Feedback is per QUESTION, not per keystroke, and final PAGE feedback appears after page submission.
- A fully correct question shows **✓ נכון**. Partial work shows **◐ יש מה לתקן**. A wrong answer shows **✕ נסה שוב**. A locked unresolved answer shows **🔒 נעול**.
- The computerized student flow must not show `נשמר לבדיקת המורה` for a scored worksheet target. A target that would require teacher judgment must be converted to a deterministic computerized interaction before release.
- The LMS should feel as if a supportive mathematics teacher is beside the learner: warm, specific, truthful, encouraging and pedagogically useful.
- Use broad, non-repetitive banks of natural, grammatically correct Hebrew teacher feedback. Avoid mechanically repeating the same praise, correction phrase or final-page comment on consecutive work.
- Positive feedback should vary according to context: first-try success, successful correction, persistence, a streak of correct answers, completing a question and completing a page may receive different wording.
- Examples of the intended tone include `כל הכבוד`, `איזה יופי`, `מצוין`, `יפה מאוד`, `בדיוק`, `מעולה — ממשיכים`, `נהדר, תפסת את הרעיון`, but these are examples, not a fixed list.
- A wrong/partial answer must also receive encouragement before correction. Examples of tone: `ננסה שוב`, `יש כאן משהו קטן לתקן`, `יפה שניסית — בוא נבדוק את הכיוון`, `כמעט; נשתמש ברמז וננסה שוב`.
- Never shame, scold, frighten or mock a learner. Never praise a mathematically wrong answer or a low final score as though it were excellent.
- A wrong verdict may never be the whole response. Every checked wrong/partial answer receives one coherent learning response containing:
  1. supportive teacher voice;
  2. a useful mathematical hint/direction;
  3. the real attempt/score consequence.
- Final page feedback must interpret the result at a high level without inventing mathematical facts not supported by the student's actual page result.
- Keep the response readable and calm; do not create competing popups or visual noise.

## 7. Corrective hints

- Hints are written for the learner who **already got the question wrong**. Use very simple, concrete Hebrew that helps that learner take the next step; do not answer difficulty with more terminology.
- Prefer **one clear idea at a time**. Avoid abstract instructions such as “compare consecutive values” when a simple worked example can show the idea more clearly.
- When a small example, mini-diagram, number line, axis fragment, arrows or restrained colour would make the idea easier to see, use it. Visual help must stay small, clear and directly connected to the question; it must not add decorative noise.
- A useful hint may show an **analogous example**. Example for right/left number understanding: `3  →  4` together with simple wording such as `שימו לב לדוגמה: המספר 4 נמצא מימין למספר 3.` The example should teach the move without simply printing the current missing answer.
- Match the language of the requested answer. **If the question asks for a number, the hint says “number”; do not call it a point.** Use “point” for an actual point/ordered pair context.
- For a question asking for the number shared where the axes cross, guide with wording such as: `חפשו את המספר שבו גם ציר x וגם ציר y עוברים. זה אותו מספר בשני הצירים.` Do not replace “number” with “point”.
- Hints do not simply reveal the current missing word, axis letter, number, coordinate or final result. They may give a concrete example or explanation that makes the reasoning accessible.
- Support grows progressively:
  - after the initial mistake: short, concrete help or example;
  - after correction 1: a clearer example or next step;
  - after correction 2: stronger step-by-step guidance, preferably visual when that is clearer;
  - after correction 3 if still unresolved: final simple teaching explanation, still without merely printing the answer.
- Hints derive from canonical task metadata and mathematical context, never from a second hand-authored answer source.
- For coordinate-system work, use only the concepts necessary for the current question. Do not introduce extra mathematical vocabulary merely because it is related to the topic.
- When only part of a multi-part question is wrong, guidance should address the unresolved part; correct parts remain locked.

## 8. Answer acceptance: forgiving language, strict mathematics

- Harmless input variation must not cost points.
- Axis letters are case-insensitive: `x/X` and `y/Y` are equivalent.
- Hebrew word-like answers may accept common full/defective spelling and **one small harmless typo** when the intended mathematical concept remains unambiguous (for example `אופקי/אפקי`, `ציר/צייר`).
- Diacritics and harmless spacing may be ignored. Harmless punctuation may be ignored only for word-like textual answers.
- Fuzzy spelling must never turn a different concept into a correct answer: `אנכי` is not `אופקי`.
- Numeric answers, coordinates, ordered data, sets and other mathematical structures remain mathematically strict. Numeric equivalence such as `1/2 = 0.5` is allowed because it is mathematically equivalent, not because of fuzzy text matching.
- A deterministic answer encoded directly in the canonical target/page metadata is authoritative for that target. Stale positional/default/local/remote keys must not override an explicit canonical answer attached to the current target.
- Never guess a correct answer from nearby prose. If the printed task permits many correct responses or lacks enough information for a unique answer, **the computerized interaction must be redesigned from that exact task into a deterministic form before release**, normally four choices with exactly one correct option and three plausible misconception-based distractors.
- The four choices must test the same mathematical idea as the printed task. Distractors must be mathematically meaningful and based on realistic student errors, not random filler designed merely to create four buttons.

## 9. Interface design

- Practice controls use a **quiet, compact, premium app language**: neutral navy/slate/white surfaces, thin borders, restrained shadows, no neon, no saturated navigation blocks, no sheen and no decorative glow.
- Controls should **look small and delicate** while remaining easy to tap. Prefer a compact visible button with an adequate touch target rather than a bulky visual block.
- Touch accessibility is judged at the **final rendered scale on the device**, not by an unscaled CSS number inside the A4 sheet. A larger invisible hit region is preferred when it preserves a compact premium appearance.
- `להגיש ←` is narrow and understated and sits beside its verdict/feedback. It must not look like a large page-level CTA.
- Previous/next navigation is one calm navigation system, distinguished by label/arrow/position rather than loud colors.
- Secondary tools belong behind a quiet overflow control where appropriate. Do not duplicate primary navigation.
- Feedback/hint/score-loss panels are compact, calm and readable on mobile and must not overwhelm the worksheet.
- The final submitted page grade is a clear red visual anchor; the teacher comment sits beside/below it in a calm readable panel.
- The special celebration for a perfect page score of 100 is an intentional exception to the otherwise restrained interface, but the numeric grade itself stays red.

## 10. Persistence, registration and authorization

- Local save and central Firebase synchronization are different states. Never tell a learner that central save succeeded unless it actually did.
- Central failures must be visible and retryable without duplicating attempts, results or activity events.
- **Guest draft/answer/attempt state may be stored locally only to preserve learning continuity and prevent attempt reset. Guest page scores/results must never be persisted locally or centrally.** A legacy guest result from an older build must be ignored/purged, never restored and never transferred into a newly registered account.
- Registration transfers eligible guest draft/attempt state only after account creation; it never imports an already displayed guest score.
- Registration requires full name, school, email and password in backend validation as well as the form. Student-facing authentication errors must be plain Hebrew, never raw Firebase codes.
- If Firebase Authentication creates a user but the required profile write fails, do not leave a known partial registration behind; roll back the just-created auth user where possible and report a clear error.
- Registration enables central save, cross-device continuation and teacher-dashboard visibility.
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
- **The computerized answer-coverage gate is fail-closed:** release must fail unless every interactive scored target on all 78 computerized pages has a deterministic answer after all screen-only adaptations are applied.

## 12. Future change map — edit the owner, not every consumer

- **Worksheet text, mathematics, diagrams, blanks and page order:** `src/data/workbook/`.
- **Screen-only deterministic adaptation of printed open-ended/ambiguous tasks:** one dedicated LMS interaction owner; do not fork the workbook. It must run before LMS target numbering/answer-key capture and must be included in answer-coverage tests.
- **First-entry explanation:** `src/views/welcome.ts`; **route ownership:** `src/router.ts`; **first-entry styling:** `src/styles/welcome.css`.
- **Registration/authentication semantics:** `src/lms/auth.ts` and `src/views/lmsLogin.ts`.
- **Attempt limit:** `src/lms/config.ts`. The Firestore bound in `firestore.rules` is the only intentional mirror because security rules execute separately; its contract tests must change in the same commit.
- **Score/credit curve:** `src/lms/scoring.ts`.
- **Final page-score rendering:** `src/lms/engine.ts`; **final score teacher sentence:** `src/lms/teacherVoice.ts` via `src/lms/pageScoreFeedback.ts`; **final score presentation:** `src/styles/page-score.css`.
- **Answer normalization/tolerance:** `src/lms/answerValidation.ts`.
- **Explicit canonical answer capture:** `src/lms/implicitAnswers.ts`; **answer-key precedence/persistence:** `src/lms/repository.ts`.
- **Guest/result persistence, retries, merge semantics and dashboard loading:** `src/lms/repository.ts` plus dedicated sync modules.
- **Teacher wording/encouragement:** `src/lms/teacherVoice.ts`.
- **Pedagogical hints:** `src/lms/hintCoach.ts` and `src/styles/hint-coach.css` for any small visual hint aid.
- **Per-question grading/state machine and page submission:** `src/lms/engine.ts`.
- **Computerized page shell/navigation:** `src/views/pageViewer.ts` and its practice-shell styles; do not copy worksheet content there.
- **Authorization/data boundaries:** `firestore.rules`.
- Tests should import runtime policy/configuration where possible instead of repeating magic numbers. A test may duplicate a value only when it is deliberately verifying an external contract such as Firestore rules or a required device viewport.
- Do not create another architecture/preferences/rules document. If ownership changes, update this map here.
