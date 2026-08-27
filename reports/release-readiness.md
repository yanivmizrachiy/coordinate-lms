# Classroom release-readiness contract

Generated: 2026-08-27T15:08:52.643Z

Mode: static

Overall status: **blocked**

| Domain | Status | Summary |
|---|---|---|
| Repository engineering gates | pass | The repository contract, generated manifests, emulator command, CI runtime, and patch hygiene are internally consistent. |
| Firestore emulator-backed validation | pass | Real Firestore operations passed against the demo project with the pinned Firebase CLI. |
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

Status: **pass**

Real Firestore operations passed against the demo project with the pinned Firebase CLI.

Evidence:

- suite: tests/firestore-emulator.test.ts
- generatedAt: 2026-08-27T15:04:42.656Z
- Firebase CLI: 15.25.1
- contract SHA-256: 4bda5652ae75ec868888d9270204cd259e88d4e66fd475fd1cf494be8594f7e3

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
