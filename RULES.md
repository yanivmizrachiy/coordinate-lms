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
- **When a real worksheet task presents a product ambiguity that cannot be resolved safely from the mathematics and repository evidence, ask the user one focused question before changing that task.** Do not redesign a real question merely because its current grading implementation is incomplete.
- **When a canonical worksheet item is genuinely malformed, redundant or pedagogically useless and the user approves changing the worksheet itself, do not merely delete useful learning space. Replace it with a topic-local, pedagogically worthwhile and deterministically gradable task at an appropriate level; prefer an interaction pattern the workbook already uses. Because this is canonical CONTENT, the same replacement must appear in both print and computerized renderings.**
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
- **The computerized worksheet stays as close as possible to the printed worksheet by default: same question, wording, mathematical task, order, diagrams and expected learner action.** Do not change a printable task just to make implementation easier.
- Any canonical worksheet content change **must propagate automatically to both** printable and computerized renderings unless the difference is an explicitly approved interaction-only adaptation required because exact computerized grading is genuinely impossible in the printed interaction form.
- `#/workbook/:n` must render the canonical page itself and then add the LMS layer. Do not create a separately authored computerized workbook.
- **An open-ended printed task stays open on screen whenever its correctness can be checked exactly by a mathematical rule. Multiple valid answers do not make a task ungradeable.** The LMS must accept every response that satisfies the required condition.
- Dependent open work should be validated consistently against the learner's own earlier valid choice where appropriate. Example principle: if the learner chooses a valid point under a stated condition, later questions about that point should be checked against the point the learner actually chose.
- **Only when no robust deterministic validator can grade the original learner action exactly may the screen interaction change. In every such real case, stop and ask the user before changing it.** After approval, make the smallest screen-only adaptation that preserves the same mathematical skill; the printed worksheet remains unchanged.
- A four-choice interaction is one possible last-resort adaptation, not the default. If used, it must have exactly one correct answer and three pedagogically meaningful distractors based on realistic student errors.
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
- **Every scored target in computerized practice must have a deterministic grading rule before release.** A grading rule may be a single expected answer, a set or range of valid answers, a mathematical predicate, a geometric condition, or a consistency rule tied to another valid learner-created response.
- **A task is not considered ambiguous merely because more than one answer can be correct.** If a mathematical condition precisely determines whether a submitted response is valid, keep the task open and grade that condition.
- Release/coverage checks must fail if even one computerized scored target has neither an exact validator nor an explicitly approved deterministic screen-only adaptation. Nothing may be silently excluded from the score denominator because the implementation did not know how to grade it.
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
- The computerized student flow must not show `נשמר לבדיקת המורה` for a scored worksheet target. First try to grade the original task exactly with a deterministic mathematical validator; only if that is genuinely impossible may an approved deterministic screen-only adaptation replace the interaction.
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
- Never guess a correct answer from nearby prose. **If the printed task permits many correct responses, first express its actual mathematical condition as a validator and keep the original open interaction.** Multiple correct responses are not a reason to create multiple choice.
- If a response depends on an earlier learner choice, grade it against that earlier valid choice when the mathematics permits this.
- Only if the original learner action genuinely cannot be graded exactly by a deterministic rule may a screen-only interaction change be considered, and that real case must be brought to the user before implementation.
- If four choices are explicitly approved for such a case, they must test the same mathematical idea as the printed task; distractors must be mathematically meaningful and based on realistic student errors, not random filler.

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
- **The computerized answer-coverage gate is fail-closed:** release must fail unless every interactive scored target on all 78 computerized pages has either an exact deterministic validator in its original interaction form or an explicitly approved deterministic screen-only adaptation.

## 12. Future change map — edit the owner, not every consumer

- **Worksheet text, mathematics, diagrams, blanks and page order:** `src/data/workbook/`.
- **Deterministic grading of open learner responses and approved screen-only adaptations:** one dedicated LMS interaction/grading owner; do not fork the workbook. It must run before LMS target numbering/answer-key capture and must be included in answer-coverage tests. Prefer predicates/constraints over changing the question type.
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

The visual/e2e gate must include a first-entry viewport matrix proving both practice-choice buttons are fully above the fold on compact Android, iPhone-class portrait sizes and phone landscape, and it must verify final page-score presentation/feedback behavior.

Normal PR CI proves repository engineering health. It may generate `release:report:static` as evidence even when external Firebase configuration, pedagogical review or physical two-device acceptance is still blocked; those external blockers must be reported, not disguised as code failures.

`npm run release:check` is the strict release gate. It must fail while any required production configuration or acceptance evidence is incomplete.

Do not describe the product as production-ready while required external configuration or acceptance evidence is incomplete. Do not merge or deploy to production without the required explicit confirmation.

## 14. AI / agent entry protocol

This section exists so a future AI, coding agent or human maintainer can enter the repository safely without rediscovering or duplicating the project's rules.

- **First action:** read `RULES.md` completely before proposing or making a change. `AGENTS.md` and `CLAUDE.md` are pointer files only; `README.md`, `docs/` and `reports/` may explain or prove state, but none of them can override this file.
- **Do not infer duplication from names, formats or visual similarity.** Before deleting, merging or replacing a file, prove its role by checking imports/references, build scripts, generators, tests, runtime consumers and fallbacks.
- Treat paired assets such as PNG/WebP, JPG/WebP or MP4/WebM as potentially intentional compatibility/performance fallbacks. Treat JSON/Markdown report pairs and source/generated-output pairs as potentially intentional evidence. Delete only after proving the candidate is dead, obsolete, contradictory or a true duplicate with no independent consumer.
- Before cleanup, classify each candidate as one of: **canonical source, runtime owner, generated artifact, compatibility fallback, test/release evidence, pointer/documentation, or dead duplicate**. Only the last category is presumptively removable.
- Prefer **one surgical edit in the owning file** over parallel patches in several consumers. Use the Future change map above before searching randomly through the repository.
- Never create a second governing document to remember a decision. If a reusable product/engineering rule changes, merge it into the relevant section of `RULES.md`, remove obsolete wording, and keep pointer files free of copied rules.
- Do not perform “cleanup theatre”: no mass reformatting, file moves, renames, dependency swaps, abstraction layers or broad refactors unless they solve a verified defect or maintenance hazard and relevant tests prove behavior is preserved.
- Do not resurrect code, content or architecture from `coordinate-first-quadrant` merely because it existed historically. History is evidence, not authority.
- When a current user instruction conflicts with an older rule, the current instruction wins; reconcile `RULES.md` and implementation in the same workstream instead of leaving two truths behind.
- If a material ambiguity cannot be resolved from this file, code, tests, current user instruction or repository evidence, ask one focused question rather than inventing a requirement.
- After a change, run the **smallest relevant tests first**, then the required quality gates appropriate to review/release. Do not claim success from a visual check alone, and do not claim production readiness while external release blockers remain.
- Future agents should leave the repository **simpler to reason about**: fewer conflicting owners, fewer stale branches of behavior, no new source-of-truth documents, and no deletion of useful compatibility or evidence files merely to reduce file count.
