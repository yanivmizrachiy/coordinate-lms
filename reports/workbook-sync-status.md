# Workbook synchronization status

Updated: 2026-08-05

- Canonical source: `yanivmizrachiy/coordinate-first-quadrant`.
- Canonical source commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- LMS target: `yanivmizrachiy/coordinate-lms`.
- Numbered workbook pages: 78.
- All 76 files under `src/data/workbook/pages/` now come from the canonical source; no page file is missing.
- Correct keyed answers receive positive-only immediate LMS feedback: a green ✓ appears as soon as a typed, selected, or plotted answer is correct.
- Incorrect partial typing does not consume an attempt; an incorrect attempt is counted only by the explicit answer-check action.
- The immediate checker now falls back to the reviewed answer metadata already embedded in the LMS target while the asynchronous repository key is loading.
- Adaptive A4 spacing is being moved from print-dialog-only CSS to the fixed A4 sheet view as well, and still activates only when measured overflow exists.
- These fixes are restricted to `src/lms/engine.ts` and `src/styles/workbook.css`; no file under `src/data/workbook/pages/` is modified.
- The generated reports are current for the canonical model: 1,162 response targets, with 735 safely checkable automatically.
- All 161 unit and content tests, Firestore emulator authorization, TypeScript and the production build pass.

Legacy answer evidence is applied only to authored pages that survived the
reorder. Rebuilt printable replacements have no legacy page mapping, so old game
answers cannot be attached to a different printed question.

The branch is applying the final live-key and adaptive A4 infrastructure fix,
then will run the complete read-only CI verification again.
