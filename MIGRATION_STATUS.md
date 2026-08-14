# Coordinate LMS — current implementation status

Updated: 2026-08-14

**This file is status only. It is not a source of requirements. `RULES.md` is the single source of truth.**

## Canonical target

- Printable canonical source: `yanivmizrachiy/coordinate-first-quadrant` — read-only for LMS work.
- Canonical printable workbook: 78 numbered pages.
- Required final state: every canonical printable page has a one-to-one computerized counterpart, preserving printable content/design and adding digital interaction only in the LMS layer.

## Current branch status

The current working PR `#6` (`agent/digital-answer-audit`) is **not ready for merge or production**.

Known implementation gaps:

1. **Page synchronization is incomplete in PR #6.** Its existing answer manifest still reflects a 77-page LMS state. This is an implementation defect relative to `RULES.md`, not an alternative requirement.
2. PR `#5` contains the newer 78-page canonical synchronization work. Its unique implementation work must be consolidated with the digital-answer work rather than maintained as a competing source of truth.
3. The latest CI run for PR #6 (`CI #324`, 2026-08-14) fails before full validation because `src/data/workbook/pages/color-decode-print.ts` imports `../../colorDecode`, which cannot be resolved in the PR merge result.
4. The visual job also fails because the Playwright web server cannot start; this is downstream of the broken application/build state and must be revalidated after the source error is fixed.
5. The current Vercel status on the PR head is failing.
6. Firebase production configuration is not complete: required client settings/service-account configuration and production Firestore deployment evidence are still absent.
7. A real student-phone + separate teacher-computer acceptance test is still required before production readiness may be claimed.

## Answer-checking status

Older reports classify 161 targets as `open-ended`. That classification is **not a permanent product rule** and must not be interpreted as “teacher judgment required”.

Under `RULES.md`:

- tasks with multiple mathematically valid answers must be converted to objective predicate checking;
- point-selection tasks must be checked from the student's actual graphical selection;
- explanation questions such as „הסבר מדוע” should normally become an objectively checkable four-option pedagogical task in the computerized layer;
- the printable source remains unchanged.

Therefore coverage reports must be regenerated after the digital interactions are implemented. Old percentages are historical implementation snapshots only.

## Release condition

Do not merge or deploy as production-ready until:

- canonical 78-page synchronization is complete;
- contradictory 77-page assumptions are removed from runtime, tests, manifests, documentation and Firestore validation;
- all digital adaptations required by `RULES.md` are implemented and tested;
- CI, typecheck, unit/content, Firestore emulator, build, security audits and visual/mobile/A4 tests pass cleanly;
- Firebase production configuration/rules deployment is verified;
- real two-device classroom acceptance passes.
