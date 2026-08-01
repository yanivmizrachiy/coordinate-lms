# Classroom launch checklist

The codebase is not a verified production classroom system until every external
item below is complete. Run `npm run release:check` before the first deployment;
it intentionally exits non-zero while critical Firebase configuration is absent.
The checker reports setting names and status only, never values.

## 1. Enable Email/Password authentication

1. Open the Firebase project selected for `coordinate-lms`.
2. Go to **Authentication → Sign-in method**.
3. Enable **Email/Password**. Do not enable anonymous accounts as a substitute.
4. Register one student test account and the configured teacher account through
   the application. Do not create or store passwords in this repository.

## 2. Create Firestore

1. Go to **Firestore Database → Create database**.
2. Select production mode and the region approved for the school.
3. Do not add permissive temporary rules. The repository rules fail closed and
   must be deployed before classroom data is written.

## 3. Configure GitHub Actions

In **Repository settings → Secrets and variables → Actions**, add these secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`

The service account needs only the permissions required to deploy Firestore
rules and indexes. Never paste its JSON into a file, issue, PR, log, or chat.

Optionally add the repository variable `VITE_ADMIN_EMAILS` as a comma-separated
list of teacher emails. Keep the Firestore admin rule and this list aligned
before deployment.

## 4. Deploy Firestore rules and indexes

1. Install Java 21 and run `npm run test:firestore`. Confirm all authorization
   scenarios pass against `demo-coordinate-lms`; this command cannot access a
   production Firebase project.
2. Run `npm run firebase:check` and resolve every failure.
3. In GitHub Actions, run **Deploy Firestore rules (manual)**.
4. Confirm the workflow deploys both `firestore.rules` and
   `firestore.indexes.json` to the intended project.
5. Verify with production acceptance accounts that a student cannot
   read another student's profile, drafts, results, or activity, and that only
   an authorized teacher can read class-wide data.

## 5. First production deployment

1. Open a PR and require CI to pass: coverage drift, typecheck, tests, build,
   production audit, Firestore checks, and desktop/mobile Playwright.
2. Review the answer report in `reports/answer-coverage.md`. Unkeyed ambiguous or
   open-ended targets require teacher review; do not convert them by guessing.
3. Run `npm run release:check` locally or in the release environment.
4. Manually run **Deploy to GitHub Pages (manual)**. Do not deploy from an
   unreviewed branch and do not enable local LMS fallback in production.

## 6. Two-device acceptance test

Use a real student phone and a separate teacher computer:

1. On the phone, complete page 1 as a guest and record its score and attempts.
2. Register. Confirm the guest draft/result transfers without disappearing.
3. Reload the phone, continue on page 2, and confirm attempts survive reload.
4. Temporarily disconnect the phone, enter an answer, reconnect, and confirm the
   UI shows the synchronization state accurately.
5. On the teacher computer, confirm the student's name, email, registration
   time, current page, latest action, active time, draft, attempts, latest score,
   and best score.
6. Export CSV and open it in a Hebrew-capable spreadsheet. Confirm UTF-8 text,
   identifiers, ISO timestamps, quotes, commas, and line breaks are intact.
7. Submit twice rapidly and confirm only one grading record is stored.

Record the date, Firebase project ID (not credentials), deployed commit, tester
names, devices, and observed result in the release notes.
Copy `docs/two-device-acceptance.template.json` to
`reports/two-device-acceptance.json`, fill only non-secret evidence, and leave
the status blocked or failure unless every recorded check passed. Then run
`npm run release:report` and confirm the physical-acceptance domain changed to
`pass` for the intended commit.
