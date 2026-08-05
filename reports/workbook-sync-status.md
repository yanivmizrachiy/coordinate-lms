# Workbook synchronization status

Updated: 2026-08-05

- Canonical source: `yanivmizrachiy/coordinate-first-quadrant`.
- Canonical source commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- LMS target: `yanivmizrachiy/coordinate-lms`.
- Numbered workbook pages: 78.
- All 76 files under `src/data/workbook/pages/` now come from the canonical source.
- No canonical page file is missing from the LMS branch.
- The LMS authentication, persistence, scoring, dashboard and Firebase layers remain separate from the canonical page sources.

Before the full canonical-content import, the migrated answer identity layer safely
checked 876 of 1,184 response targets. The answer coverage report must now be
regenerated against the imported canonical wording and target signatures; stale
proofs are rejected rather than silently attached to changed prompts.

Legacy answer evidence is applied only to authored pages that survived the
reorder. Rebuilt printable replacements have no legacy page mapping, so old game
answers cannot be attached to a different printed question.

This branch remains a draft until regenerated answer reports, unit tests,
Firestore emulator checks, build and browser layout checks all pass on the fully
canonical page content.
