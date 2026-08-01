# Coordinate LMS — migration and launch status

Updated: 2026-08-01

The branch is materially closer to classroom use, but it is **not production
ready**. Firebase is not configured, Firestore rules have not been deployed or
emulator-verified, a two-device acceptance test has not run, and 921 response
targets still require teacher judgment or review.

## Completed and verified in the repository

- The canonical 77-page Hebrew RTL workbook, page order, diagrams, A4 layout,
  and print behavior remain present. LMS controls are a print-hidden overlay.
- Scores are validated as integers from 1 through 100. The three-attempt limit,
  guest page 1, and registered access from page 2 remain enforced.
- A rendered-DOM coverage generator enumerates every actual response target on
  every page, preserves stable ordered IDs, and writes JSON, Markdown, and
  target-order evidence under `reports/`.
- Runtime answer normalization accepts exact numeric equivalence (including
  common fractions and mixed numbers) without accepting mathematically
  different answers or unsafe answer formats.
- Firebase readiness checks verify names/presence without exposing values,
  reject placeholders, inspect initialization and production fallback, inspect
  GitHub secret/variable names, check workflows, and structurally validate rules
  and indexes. PowerShell and cross-platform Node entry points are available.
- Local and central persistence states are separate. Central failures are
  visible, stored, and retryable; activity retries use stable IDs.
- Transactional merges preserve submitted/locked state, attempts, latest score,
  best score, active time, and newer writes. Rapid duplicate submission is
  blocked and result documents are idempotently keyed per student/page.
- Guest records are copied to the account before guest source data is removed;
  a central-transfer failure preserves the guest source and is shown to the
  student.
- The teacher dashboard distinguishes Firebase from partial local fallback,
  reports sync errors, loads each student's collections in parallel, and shows
  latest/best score, attempts, active drafts, current page, activity, and time.
- CSV export is UTF-8 with BOM, RFC-style escaping, formula-injection protection,
  stable columns, identifiers, ISO timestamps, and one complete row per page
  (77 rows per student).
- Firestore rules use owner scoping, administrator-only class-wide reads and
  key writes, field allowlists, bounded document shapes, page/score/attempt
  validation, and monotonic update checks.
- LMS status messages are announced, meaningful authored/grid labels are
  preserved, true/false group names include the statement, touch targets are
  measured, keyboard completion is tested, and overlays remain hidden in print.
- The page-43 maze wall label no longer covers the x-axis tick at 2.
- Vitest, Vite, Playwright, Linkedom, and Node types were conservatively updated;
  the complete dependency audit now reports zero vulnerabilities.
- CI validates answer-report drift, Firebase static readiness, full and
  production dependency audits, typecheck, unit/content tests, build, and
  desktop/mobile Playwright. Readiness reports and browser failure artifacts
  are retained.

## Answer coverage — exact generated state

Source of record: `reports/answer-coverage.json`.

| Classification | Targets | Automatically checkable |
|---|---:|---:|
| reviewed-explicit | 111 | 111 |
| canonical-metadata-derived | 23 | 23 |
| deterministic-mathematical | 0 | 0 |
| valid-range | 6 | 6 |
| open-ended | 62 | 0 |
| ambiguous | 859 | 0 |
| unsupported | 0 | 0 |
| missing | 0 | 0 |
| **Total** | **1,061** | **140 (13.2%)** |

All pages 1–77 are represented. The manually reviewed explicit-key count is
111 (10.5% of all targets). Another 29 targets are safe because their source is
explicit canonical metadata or a reviewed valid range. No additional page 6–77
key was guessed: every remaining open-ended or ambiguous target is listed with
context for teacher review.

## Firebase readiness — measured state

The code/workflow contract passes static inspection. The release-mode checker
currently exits non-zero, as designed, because these external prerequisites are
absent from both the local environment and GitHub Actions:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`

Firebase CLI is not installed locally, so `firestore.rules` received structural
and repository-contract tests, not an emulator or deploy validation. Email/
Password Authentication, Firestore creation, rules/index deployment, the first
production deployment, and the two-device acceptance test are not complete.
Follow `docs/CLASSROOM_LAUNCH_CHECKLIST.md` without adding secrets to the repo.

## Security and dependency status

- `npm audit --json`: zero production or development vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities.
- Previous Vitest/Vite/esbuild development-tool advisories were removed by a
  Node-20-compatible Vitest 4 and patch/minor toolchain update; no forced fix or
  unrelated application-framework major upgrade was used.
- Student privacy and administrator boundaries have static rules-contract
  coverage. Real emulator/production authorization checks remain required.
- Because grading occurs in the browser, authenticated students can read the
  centrally stored answer-key collection. Those keys are grading data, not a
  secret; moving grading to a trusted backend would be a separate architecture
  change if confidential keys become a requirement.

## Validation evidence

Final branch validation on 2026-08-01:

- `npm run answers:coverage` and `npm run answers:coverage:check`: pass,
  140/1,061 safely checked targets across 77 pages.
- `npm run typecheck`: pass.
- `npm test`: 10 files passed, 140 tests passed.
- `npm run build`: pass, 330 modules transformed. Vite reports a non-blocking
  large-chunk optimization warning.
- `npm audit --audit-level=high`: pass, zero vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: pass, zero vulnerabilities.
- `npm run test:visual`: 85 passed, 15 intentionally skipped mobile duplicates,
  zero failures across 100 desktop/mobile cases.
- `npm run firebase:check:static`: 14 passed, 8 warnings, zero failures.
- `npm run release:check`: repository checks, audits, build, and browsers pass;
  final exit is non-zero solely because release Firebase readiness reports
  14 passed, one warning (local CLI), and the seven external failures listed
  above.

## Remaining blockers and honest completion

1. A teacher must review 62 open-ended and 859 ambiguous targets; add keys only
   with traceable evidence and focused tests.
2. A Firebase project owner must complete the console and GitHub configuration
   listed above without exposing credentials.
3. Rules/indexes must be emulator-tested or deployed to the intended project,
   then student-isolation and teacher-wide access must be tested with real
   accounts.
4. A real student phone and separate teacher computer must pass the recorded
   offline/reconnect, guest transfer, dashboard, CSV, and duplicate-submit flow.
5. CI and review must pass before a separately confirmed merge or deployment.

Estimated overall classroom-release completion: **70%**. Repository engineering
and verification automation are substantially complete; manual pedagogical
review and external Firebase acceptance remain the dominant unfinished work.
