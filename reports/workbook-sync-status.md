# Workbook synchronization status

Updated: 2026-08-05

- Canonical source: `yanivmizrachiy/coordinate-first-quadrant`.
- Canonical source commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- LMS target: `yanivmizrachiy/coordinate-lms`.
- Numbered workbook pages: 78.
- All 76 files under `src/data/workbook/pages/` come from the canonical source; no page file is missing or modified by the LMS feedback work.
- Correct keyed answers receive positive-only immediate LMS feedback: a green ✓ appears as soon as a typed, selected, or plotted answer is correct.
- Incorrect partial typing does not consume an attempt; an incorrect attempt is counted only by the explicit answer-check action.
- The immediate checker uses reviewed answer metadata embedded in the target until the asynchronous repository key finishes loading, then continues with the repository key.
- Adaptive A4 spacing operates in both the fixed A4 screen view and print media, and activates only when measured overflow exists.
- The generated reports are current for the canonical model: 1,162 response targets, with 735 safely checkable automatically.
- Full verification passed before cleanup: 161 unit/content tests, Firestore emulator authorization, TypeScript, production build, release report and all 102 Playwright browser/A4 checks.
- The completed one-shot synchronization workflows and patch scripts have been removed. The permanent read-only CI and production code remain.
- The LMS and A4 infrastructure changes modified no file under `src/data/workbook/pages/`.

Legacy answer evidence is applied only to authored pages that survived the
reorder. Rebuilt printable replacements have no legacy page mapping, so old game
answers cannot be attached to a different printed question.

The cleaned branch is running one final read-only verification.
