# Workbook synchronization status

Updated: 2026-08-05

- Canonical source: `yanivmizrachiy/coordinate-first-quadrant`.
- Canonical source commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- LMS target: `yanivmizrachiy/coordinate-lms`.
- Numbered workbook pages: 78.
- All 76 files under `src/data/workbook/pages/` now come from the canonical source.
- No canonical page file is missing from the LMS branch.
- Correct keyed answers receive positive-only immediate LMS feedback: a green ✓ appears as soon as the typed, selected, or plotted answer is correct.
- Incorrect partial typing does not consume an attempt; an incorrect attempt is counted only by the explicit answer-check action.
- The immediate feedback implementation is limited to LMS code, LMS-only styles, and tests. It is explicitly suppressed in print media.
- The generated reports are current for the canonical model: 1,162 response targets, with 735 safely checkable automatically.
- All 161 unit and content tests, Firestore emulator authorization, TypeScript and the production build pass.
- Browser checks were aligned with the 78-page workbook and the removed runtime-game pages.
- Adaptive A4 spacing now activates only for a sheet that measurably overflows; it changes spacing infrastructure, not page content.
- The latest migration commit changed only browser tests, `src/lib/fitSheet.ts`, and `src/styles/workbook.css`; no file under `src/data/workbook/pages/` changed.

Legacy answer evidence is applied only to authored pages that survived the
reorder. Rebuilt printable replacements have no legacy page mapping, so old game
answers cannot be attached to a different printed question.

The branch is undergoing its final read-only CI verification after the browser
expectation and adaptive A4 updates.
