# Classroom launch checklist

This is an operational checklist only. **`RULES.md` is the single and only source of truth.** If any checklist item conflicts with `RULES.md`, the checklist is wrong and must be corrected.

The codebase is not a verified production classroom system until every external item below is complete. Run `npm run release:check` before the first deployment; it intentionally exits non-zero while critical Firebase configuration is absent. The checker reports setting names and status only, never values.

## 1. Enable Email/Password authentication

1. Open the Firebase project selected for `coordinate-lms`.
2. Go to **Authentication → Sign-in method**.
3. Enable **Email/Password**. Do not enable anonymous accounts as a substitute.
4. Register one student test account and the configured teacher account through the application. Do not create or store passwords in this repository.

## 2. Create Firestore

1. Go to **Firestore Database → Create database**.
2. Select production mode and the region approved for the school.
3. Do not add permissive temporary rules. The repository rules fail closed and must be deployed before classroom data is written.

## 3. Configure GitHub Actions

In **Repository settings → Secrets and variables → Actions**, add these secrets:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`

The service account needs only the permissions required to deploy Firestore rules and indexes. Never paste its JSON into a file, issue, PR, log, or chat.

Optionally add the repository variable `VITE_ADMIN_EMAILS` as a comma-separated list of teacher emails. Keep the Firestore admin rule and this list aligned before deployment.

## 4. Deploy Firestore rules and indexes

1. Install Java 21 and run `npm run test:firestore`. Confirm all authorization scenarios pass against `demo-coordinate-lms`; this command cannot access a production Firebase project.
2. Run `npm run firebase:check` and resolve every failure.
3. In GitHub Actions, run **Deploy Firestore rules (manual)**.
4. Confirm the workflow deploys both `firestore.rules` and `firestore.indexes.json` to the intended project.
5. Verify with production acceptance accounts that a student cannot read another student's profile, drafts, results, or activity, and that only an authorized teacher can read class-wide data.

## 5. First production deployment

1. Open a PR and require CI to pass: print/LMS drift checks, answer-coverage drift, typecheck, tests, build, production audit, Firestore checks, and desktop/mobile Playwright.
2. Compare the computerized workbook against the canonical printable workbook. Every canonical page must have a one-to-one computerized twin with the same visible content, wording, diagrams, order, colours, typography, RTL structure and layout intent. Only digital interaction overlays may differ.
3. Review the answer report in `reports/answer-coverage.md`. A target with multiple valid answers must be converted to an objective mathematical predicate whenever correctness can be expressed mathematically. Do not label such a target as requiring teacher judgment and do not invent one sample answer. Truly non-objective targets require pedagogical digital adaptation according to `RULES.md`.
4. For “הסבר מדוע” tasks, verify that the computerized interaction preserves the original learning objective and, by default, uses four didactically meaningful answer options unless another objectively checkable interaction is demonstrably better.
5. Reviewed proof and digital grading logic must remain bound to current target signatures; prompt drift must be resolved before release.
6. Run `npm run release:check` locally or in the release environment.
7. Manually run **Deploy to GitHub Pages (manual)** only when all required gates pass. Do not deploy from an unreviewed branch and do not enable local LMS fallback in production.

## 6. Two-device acceptance test

Use a real student phone and a separate teacher computer:

1. On the phone, open and solve multiple pages as a guest. Confirm every page is accessible without registration, local checking works, and temporary on-screen scores/feedback are visible.
2. Refresh or leave the guest session and confirm **no guest draft, score, attempts, progress, activity history, teacher record, or durable local LMS progress is persisted**.
3. Register a new student using full name, username, email, password, school, city and class. Confirm the prior guest history is **not transferred** into the new account.
4. While signed in, solve a page, reload the phone and confirm registered answers, attempts and progress persist correctly.
5. Temporarily disconnect the phone, enter an answer, reconnect, and confirm the UI shows synchronization state accurately and does not claim central save before the central write succeeds.
6. On the teacher computer, confirm the registered student's permitted data appears and that anonymous/guest activity does not appear in teacher reports or class statistics.
7. Confirm question-level correctness and attempts, page score, latest/best score where applicable, and saved progress are associated only with the registered account.
8. Export CSV and open it in a Hebrew-capable spreadsheet. Confirm UTF-8 text, identifiers, ISO timestamps, quotes, commas, and line breaks are intact.
9. Submit twice rapidly and confirm only one grading record is stored.
10. On both phone and computer, visually compare sampled computerized pages with the canonical printable pages and confirm one-to-one visual/content parity. Digital-only controls may overlay the page but must not redesign it.

Record the date, Firebase project ID (not credentials), deployed commit, tester names, devices, and observed result in the release notes. Copy `docs/two-device-acceptance.template.json` to `reports/two-device-acceptance.json`, fill only non-secret evidence, and leave the status blocked or failure unless every recorded check passed. Then run `npm run release:report` and confirm the physical-acceptance domain changed to `pass` for the intended commit.
