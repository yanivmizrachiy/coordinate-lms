# Canonical workbook parity audit

Updated: 2026-08-05

- Canonical repository commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- Page files in canonical source: **76**.
- Page files in LMS branch: **76**.
- Identical shared page files: **76**.
- Changed shared page files: **0**.
- Missing page files in LMS: **0**.
- LMS-only page files: **0**.

Line-ending differences are ignored; only normalized UTF-8 content is compared.

## Shared page files that differ

- None.

## Page files missing in LMS

- None.

## LMS-only page files

- None.

## Shared infrastructure files

| File | State |
|---|---|
| `src/data/workbook/index.ts` | different |
| `src/data/workbook/authoring.ts` | different |
| `src/data/workbook/types.ts` | different |
| `src/data/colorDecode.ts` | different |
| `src/lib/coordinateGrid.ts` | different |
| `src/lib/coordinateMath.ts` | identical |
| `src/styles/workbook.css` | different |
| `src/styles/grayscale.css` | different |
| `src/views/book.ts` | different |
| `src/views/flipbook.ts` | different |
| `src/views/tocSheet.ts` | different |

This report is diagnostic. A differing file is not copied blindly:
LMS-specific persistence and grading behavior must be preserved while
canonical wording, mathematics, diagrams and print layout are synchronized.
