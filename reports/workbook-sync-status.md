# Workbook synchronization status

Updated: 2026-08-05

- Canonical source: `yanivmizrachiy/coordinate-first-quadrant`.
- Canonical source commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- LMS target: `yanivmizrachiy/coordinate-lms`.
- Numbered workbook pages: 78.
- All 76 files under `src/data/workbook/pages/` now come from the canonical source.
- No canonical page file is missing from the LMS branch.
- The canonical printable `colorGrid` authoring helper is available to the LMS page layer.
- The canonical `calcBox` helper is being synchronized to support `shape` and `name` used by the current rectangle and square pages.
- The LMS authentication, persistence, scoring, dashboard and Firebase layers remain separate from the canonical page sources.

The fully canonical page content currently contains 1,162 detected response
targets, of which 767 (66%) are safely automatically checkable. Stale proofs are
rejected rather than silently attached to changed prompts.

Legacy answer evidence is applied only to authored pages that survived the
reorder. Rebuilt printable replacements have no legacy page mapping, so old game
answers cannot be attached to a different printed question.

This branch remains a draft until unit tests, Firestore emulator checks, build
and browser layout checks all pass on the fully canonical page content.
