# Classroom release-readiness contract

Generated: 2026-08-25T20:35:31.584Z

Mode: static

Overall status: **failure**

| Domain | Status | Summary |
|---|---|---|
| Repository engineering gates | pass | The repository contract, generated manifests, emulator command, CI runtime, and patch hygiene are internally consistent. |
| Firestore emulator-backed validation | failure | No current passing Firestore emulator result is available. |
| External Firebase configuration and deployment | blocked | Repository validation cannot supply console settings, service-account configuration, or deployment evidence. |
| Pedagogical answer-key review | blocked | 729/1150 targets are safely auto-checkable; 137 are signature-bound open-ended tasks; 284 remain unresolved. |
| Physical two-device classroom acceptance | blocked | No passing real student-phone and separate teacher-computer acceptance record exists. |

## Repository engineering gates

Status: **pass**

The repository contract, generated manifests, emulator command, CI runtime, and patch hygiene are internally consistent.

Evidence:

- RULES.md
- reports/answer-coverage.json
- public/answer-review-manifest.json
- .github/workflows/ci.yml
- git diff --check

## Firestore emulator-backed validation

Status: **failure**

No current passing Firestore emulator result is available.

Evidence:

- reports/firestore-emulator.json

Blockers:

- Run npm run test:firestore with Java 21.

## External Firebase configuration and deployment

Status: **blocked**

Repository validation cannot supply console settings, service-account configuration, or deployment evidence.

Evidence:

- reports/firebase-readiness.json (static)

Blockers:

- FIREBASE_SERVICE_ACCOUNT was not found in GitHub Actions secrets.

## Pedagogical answer-key review

Status: **blocked**

729/1150 targets are safely auto-checkable; 137 are signature-bound open-ended tasks; 284 remain unresolved.

Evidence:

- reports/answer-coverage.json
- public/answer-review-manifest.json

Blockers:

- Resolve 284 targets in the answer-review studio without guessing.

## Physical two-device classroom acceptance

Status: **blocked**

No passing real student-phone and separate teacher-computer acceptance record exists.

Blockers:

- Run docs/CLASSROOM_LAUNCH_CHECKLIST.md and record the result.
