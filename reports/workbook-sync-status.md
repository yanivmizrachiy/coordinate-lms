# Workbook synchronization status

Updated: 2026-08-05

- Canonical source: `yanivmizrachiy/coordinate-first-quadrant`.
- Canonical source commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- LMS target: `yanivmizrachiy/coordinate-lms`.
- Numbered workbook pages: 78.
- All 76 files under `src/data/workbook/pages/` now come from the canonical source.
- No canonical page file is missing from the LMS branch.
- The canonical printable `colorGrid` authoring helper is available to the LMS page layer.
- The canonical `calcBox` helper supports `shape` and `name` used by the current rectangle and square pages.
- The LMS authentication, persistence, scoring, dashboard and Firebase layers remain separate from the canonical page sources.
- Correct keyed answers receive positive-only immediate LMS feedback: a green ✓ appears as soon as the typed or selected answer is correct. Incorrect partial typing does not consume an attempt.
- The immediate feedback implementation is limited to `src/lms`, LMS-only styles, and LMS tests. No canonical page source is modified by this behavior.
- The four dedicated immediate-feedback unit tests pass.
- The final calculation-layout assertion now distinguishes a learner-written subtraction blank between two equals signs from a short result field after a preprinted subtraction.
- The generated reports are current for the canonical model: 1,162 response targets, with 735 safely checkable automatically.

Legacy answer evidence is applied only to authored pages that survived the
reorder. Rebuilt printable replacements have no legacy page mapping, so old game
answers cannot be attached to a different printed question.

The branch is undergoing its final read-only CI verification: unit tests,
Firestore emulator authorization, production build and browser layout checks.
