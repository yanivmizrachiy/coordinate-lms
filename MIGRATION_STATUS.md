# Coordinate LMS — Migration Status

Updated: 2026-07-31 11:17:56

## Completed in this migration

- Original Perplexity prototype preserved in:
  - Git branch: backup/perplexity-original-2026-07-31
  - Local folder: C:\coord-migration\backups\coordinate-lms-perplexity-20260731-111751
  - Repository folder: _legacy/perplexity-original
- Canonical printable workbook source copied into this repository.
- Original page order, questions, HTML, graphs and print styling retained.
- LMS score range fixed at 1–100.
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
