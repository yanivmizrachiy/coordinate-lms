# Coordinate LMS — Migration Status

Updated: 2026-08-01

## Completed in this migration

- Original Perplexity prototype preserved in:
  - Git branch: backup/perplexity-original-2026-07-31
  - Local folder: C:\coord-migration\backups\coordinate-lms-perplexity-20260731-111751
  - Repository folder: _legacy/perplexity-original
- Canonical printable workbook source copied into this repository.
- Original page order, questions, HTML, graphs and print styling retained.
- LMS score range fixed at **1–100 for every submitted page**.
- Maximum attempts configured as 3.
- First page configured as guest-accessible in LMS configuration.
- Firebase client foundation created.
- Vercel SPA configuration created.
- Local production build required before commit.

## Non-negotiable requirements

1. Never modify the source repository coordinate-first-quadrant.
2. Preserve the original printed-page design exactly.
3. Keep all canonical page numbers and question wording.
4. Add interaction as a layer over the original worksheet.
5. Score every submitted page from 1 to 100.
6. Allow no more than three attempts per answer.
7. Page 1 is available without registration.
8. Registration is mandatory before continuing.
9. Store students, attempts, activity and results centrally.
10. Never delete the Perplexity prototype.

## LMS Phase 3 Extreme

- Added a student progress page with scores, drafts, active time and continue action.
- Added an admin answer-key studio covering all workbook pages.
- Added full answer-target manifest export.
- Added JSON answer-key import and export.
- Added page-level key coverage reporting.
- Added remote/local result and draft merging.
- Added Firebase and Vercel bootstrap automation.

## LMS hardening — 2026-08-01

- Production registration now fails closed when Firebase is not configured.
- Local browser-only accounts remain available only in development or by explicit opt-in.
- GitHub Pages deployment now requires all Firebase build settings.
- Added a manual GitHub Actions workflow for deploying Firestore rules and indexes.
- Firestore rules validate page numbers, score range, student ownership and data shapes.
- Automated tests lock the page score range to 1–100 and verify attempt penalties.
- Teacher dashboard now loads results, drafts and activity events from Firebase.
- Teacher dashboard now shows registration time, last activity, current page, active time and latest action.
- CSV export now includes full activity and progress fields.
- Empty answer boxes drawn inside coordinate-grid SVGs are now editable on mobile and desktop while print output remains unchanged.
- Existing true/false radio questions are now connected to persistence, three attempts and scoring.
- Complete reviewed built-in answer keys are available for pages 1–5.
- The runtime now derives non-ambiguous answers automatically from canonical worksheet metadata: missing grid ticks, axis names, the origin, true/false rows and explicit authoring labels.
- Automatic derivation never guesses from surrounding prose; open or ambiguous tasks remain for teacher review.
- Playwright tests authenticate protected workbook routes, verify the page-1 guest flow and page-2 registration gate, and test automatic answer derivation.

## Still required before public classroom use

- Configure Firebase Authentication email/password provider.
- Create Firestore and deploy `firestore.rules`.
- Add the six `VITE_FIREBASE_*` GitHub Actions secrets.
- Add the `FIREBASE_SERVICE_ACCOUNT` GitHub Actions secret for automated rules deployment.
- Review the answer-key coverage report for pages 6–77 and manually key only the remaining ambiguous or open targets.
- Run a two-device acceptance test: student phone and teacher computer.
- Trigger the manual GitHub Pages deployment only after CI passes.
