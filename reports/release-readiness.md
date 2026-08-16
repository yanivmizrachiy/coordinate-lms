# Classroom release-readiness contract

Generated: 2026-08-16T11:44:32.425Z

Mode: static

Overall status: **blocked**

| Domain | Status | Summary |
|---|---|---|
| Repository engineering gates | pass | The repository contract, generated manifests, emulator command, CI runtime, deployment verifier, and patch hygiene are internally consistent. |
| Firestore emulator-backed validation | pass | Real Firestore operations passed against the demo project with the pinned Firebase CLI. |
| External Firebase configuration and deployment | blocked | Firebase Production remains blocked until a successful manual Firestore deployment produces current non-secret evidence and Email/Password Authentication is verified. |
| Pedagogical answer-key review | pass | 1094/1162 targets are safely auto-checkable; 68 open-ended targets have signature-verified review evidence; 0 remain unresolved. |
| Physical two-device classroom acceptance | blocked | No passing real student-phone and separate teacher-computer acceptance record exists. |

## Repository engineering gates

Status: **pass**

The repository contract, generated manifests, emulator command, CI runtime, deployment verifier, and patch hygiene are internally consistent.

Evidence:

- RULES.md
- reports/answer-coverage.json
- reports/answer-target-order.json
- public/answer-review-manifest.json
- .github/workflows/ci.yml
- .github/workflows/deploy-firestore.yml
- scripts/verify-production-firebase.mjs
- git diff --check

## Firestore emulator-backed validation

Status: **pass**

Real Firestore operations passed against the demo project with the pinned Firebase CLI.

Evidence:

- suite: tests/firestore-emulator.test.ts
- generatedAt: 2026-08-16T11:44:31.542Z
- Firebase CLI: 15.25.1
- contract SHA-256: 8d18094192a5fa7a7a5b6646ed6b265412f7a18901e134864d025576643854f9

## External Firebase configuration and deployment

Status: **blocked**

Firebase Production remains blocked until a successful manual Firestore deployment produces current non-secret evidence and Email/Password Authentication is verified.

Evidence:

- reports/firebase-readiness.json (static)
- reports/firebase-production-evidence.json (required after successful manual production deployment)

Blockers:

- No current verified Firebase production evidence matches the deployed Firestore rules/indexes and Email/Password Authentication configuration.
- VITE_FIREBASE_API_KEY is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_AUTH_DOMAIN is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_PROJECT_ID is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_STORAGE_BUCKET is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_MESSAGING_SENDER_ID is missing locally and was not found in GitHub Actions secrets.
- VITE_FIREBASE_APP_ID is missing locally and was not found in GitHub Actions secrets.
- FIREBASE_SERVICE_ACCOUNT was not found in GitHub Actions secrets.

## Pedagogical answer-key review

Status: **pass**

1094/1162 targets are safely auto-checkable; 68 open-ended targets have signature-verified review evidence; 0 remain unresolved.

Evidence:

- reports/answer-coverage.json
- public/answer-review-manifest.json
- docs/open-ended-review.json

## Physical two-device classroom acceptance

Status: **blocked**

No passing real student-phone and separate teacher-computer acceptance record exists.

Blockers:

- Run docs/CLASSROOM_LAUNCH_CHECKLIST.md and record the result.
