# Classroom release-readiness contract

Generated: 2026-08-05T19:54:29.717Z

Mode: static

Overall status: **blocked**

| Domain | Status | Summary |
|---|---|---|
| Repository engineering gates | pass | The repository contract, generated manifests, emulator command, CI runtime, and patch hygiene are internally consistent. |
| Firestore emulator-backed validation | pass | Real Firestore operations passed against the demo project with the pinned Firebase CLI. |
| External Firebase configuration and deployment | blocked | Repository validation cannot supply console settings, service-account configuration, or deployment evidence. |
| Pedagogical answer-key review | blocked | 735/1162 targets are safely auto-checkable; 130 are signature-bound open-ended tasks; 297 remain unresolved. |
| Physical two-device classroom acceptance | blocked | No passing real student-phone and separate teacher-computer acceptance record exists. |

## Repository engineering gates

Status: **pass**

The repository contract, generated manifests, emulator command, CI runtime, and patch hygiene are internally consistent.

Evidence:

- RULES.md
- reports/answer-coverage.json
- reports/answer-target-order.json
- public/answer-review-manifest.json
- .github/workflows/ci.yml
- git diff --check

## Firestore emulator-backed validation

Status: **pass**

Real Firestore operations passed against the demo project with the pinned Firebase CLI.

Evidence:

- suite: tests/firestore-emulator.test.ts
- generatedAt: 2026-08-05T19:54:20.668Z
- Firebase CLI: 15.25.1
- contract SHA-256: ad2bd6c1851c885fcc40949542a136df1552c468151346407a98cd3b88f0c000

## External Firebase configuration and deployment

Status: **blocked**

Repository validation cannot supply console settings, service-account configuration, or deployment evidence.

Evidence:

- reports/firebase-readiness.json (static)

Blockers:

- VITE_FIREBASE_API_KEY is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_AUTH_DOMAIN is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_PROJECT_ID is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_STORAGE_BUCKET is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_MESSAGING_SENDER_ID is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_APP_ID is missing locally and was not found in GitHub Actions secrets.
- FIREBASE_SERVICE_ACCOUNT was not found in GitHub Actions secrets.

## Pedagogical answer-key review

Status: **blocked**

735/1162 targets are safely auto-checkable; 130 are signature-bound open-ended tasks; 297 remain unresolved.

Evidence:

- reports/answer-coverage.json
- public/answer-review-manifest.json

Blockers:

- Resolve 297 targets in the answer-review studio without guessing.

## Physical two-device classroom acceptance

Status: **blocked**

No passing real student-phone and separate teacher-computer acceptance record exists.

Blockers:

- Run docs/CLASSROOM_LAUNCH_CHECKLIST.md and record the result.
