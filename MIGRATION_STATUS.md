# Coordinate LMS — migration and launch status

Updated: 2026-08-02

The branch is materially closer to classroom use, but it is **not production
ready**. Firebase is not configured, Firestore rules have not been deployed,
a two-device acceptance test has not run, and 186 response targets remain
deliberately ungraded: 161 open-ended and 25 requiring teacher review.

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
- A target-bound proof registry records 735 exact canonical or deterministic
  answer decisions with source evidence and prompt signatures. It also supports
  reviewed unordered label sets without accepting omissions or duplicates.
- A separate signature-bound review records 161 learner-created or
  prior-answer-dependent targets as intentionally open-ended. Prompt drift
  invalidates either reviewed classification instead of inheriting stale data.
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
- Nine genuine rules-unit-testing scenarios pass against the Firestore emulator
  under the demo-only project `demo-coordinate-lms` with Firebase CLI 15.25.1.
  They exercise anonymous, two-student, and administrator identities; valid and
  invalid writes; class reads; retries; deletes; and document/payload binding.
- A consolidated two-student simulation covers guest transfer, registration,
  page-2 access, drafts/results/activity, reload-persistent attempts,
  logout/login, retry transitions, administrator fallback, and full CSV. A
  separate isolated-browser flow repeats the identity and dashboard path.
- The answer-review studio consumes the exact generated 1,061-target manifest,
  reports global and per-page progress, filters by status/classification, and
  exports/reimports strict version-2 batches. It rejects partial, duplicate,
  unknown, drifted, malformed, and canonical-answer-changing imports and never
  activates a validated file without a separate click.
- JSON and Markdown release reports separate repository engineering,
  emulator-backed validation, external Firebase configuration, pedagogical
  review, and physical two-device acceptance with pass/warning/failure/blocked
  statuses. A passing repo or emulator result cannot imply classroom readiness.
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
| reviewed-explicit | 190 | 190 |
| canonical-metadata-derived | 23 | 23 |
| deterministic-mathematical | 656 | 656 |
| valid-range | 6 | 6 |
| open-ended | 161 | 0 |
| ambiguous | 25 | 0 |
| unsupported | 0 | 0 |
| missing | 0 | 0 |
| **Total** | **1,061** | **875 (82.5%)** |

All pages 1–77 are represented. Every newly checkable answer is bound to the
current target signature and includes exact canonical source evidence; none was
inferred merely from nearby prose. The remaining 161 open-ended targets are
intentionally learner-created or dependent on the learner's earlier choice.
The remaining 25 genuinely ambiguous targets stay visibly ungraded pending
teacher review.

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

Firebase CLI is not installed globally, but the pinned CLI 15.25.1 and a
task-local Java 21 runtime completed the real Firestore emulator suite. Email/
Password Authentication, Firestore creation, rules/index production deployment,
the first production deployment, and the two-device acceptance test are not complete.
Follow `docs/CLASSROOM_LAUNCH_CHECKLIST.md` without adding secrets to the repo.

## Security and dependency status

- `npm audit --json`: zero production or development vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: zero vulnerabilities.
- Previous Vitest/Vite/esbuild development-tool advisories were removed by a
  Node-20-compatible Vitest 4 and patch/minor toolchain update; no forced fix or
  unrelated application-framework major upgrade was used.
- Student privacy and administrator boundaries have both static contract and
  real emulator coverage. Production authorization acceptance remains required.
- Because grading occurs in the browser, authenticated students can read the
  centrally stored answer-key collection. Those keys are grading data, not a
  secret; moving grading to a trusted backend would be a separate architecture
  change if confidential keys become a requirement.

## Validation evidence

Current branch validation on 2026-08-02:

- `npm run answers:coverage` and `npm run answers:coverage:check`: pass,
  875/1,061 safely checked targets across 77 pages; 161 reviewed open-ended and
  25 ambiguous targets remain deliberately ungraded.
- `npm run typecheck`: pass.
- `npm test`: 13 files passed, 157 tests passed.
- `npm run test:firestore`: pass, nine genuine emulator tests passed with a
  demo-only project and pinned Firebase CLI 15.25.1.
- `npm run build`: pass, 333 modules transformed. Vite reports a non-blocking
  large-chunk optimization warning.
- `npm audit --audit-level=high`: pass, zero vulnerabilities.
- `npm audit --omit=dev --audit-level=high`: pass, zero vulnerabilities.
- `npm run test:visual`: 86 passed, 16 intentional mobile skips, zero failures
  across 102 desktop/mobile cases, including the isolated classroom flow.
- `npm run firebase:check:static`: 14 passed, 8 warnings, zero failures.
- `npm run release:report:static`: repository engineering and emulator domains
  pass; external Firebase, pedagogical review, and two-device acceptance are
  independently blocked.
- `npm run release:check`: repository checks, audits, build, and browsers pass;
  final exit remains non-zero because the separated release contract correctly
  marks external Firebase, pedagogical review, and physical acceptance blocked.

## Remaining blockers and honest completion

1. A teacher must resolve the 25 genuinely ambiguous targets. The 161 reviewed
   open-ended targets need an explicit classroom judgment/grading policy; add
   automatic keys only with traceable evidence and focused tests.
2. A Firebase project owner must complete the console and GitHub configuration
   listed above without exposing credentials.
3. Rules/indexes must be deployed to the intended project, then the emulator-
   proven student-isolation and teacher-wide access contract must be repeated
   with production acceptance accounts.
4. A real student phone and separate teacher computer must pass the recorded
   offline/reconnect, guest transfer, dashboard, CSV, and duplicate-submit flow.
5. CI and review must pass before a separately confirmed merge or deployment.

Estimated overall classroom-release completion: **90%**. All safe, autonomous
repository engineering identified in this pass is complete. Teacher judgment,
external Firebase ownership/deployment, and real-device acceptance are the
remaining release work.
