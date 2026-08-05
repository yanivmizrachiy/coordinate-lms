# Canonical workbook parity audit

Updated: 2026-08-05

- Canonical repository commit: `aa27ee705a29fbd3b085aca1f8bfbc06b0b95ac7`.
- Page files in canonical source: **76**.
- Page files in LMS branch: **76**.
- Identical shared page files: **6**.
- Changed shared page files: **70**.
- Missing page files in LMS: **0**.
- LMS-only page files: **0**.

## Shared page files that differ

- `src/data/workbook/pages/axes-identify.ts`
- `src/data/workbook/pages/axes-intro.ts`
- `src/data/workbook/pages/axes-practice.ts`
- `src/data/workbook/pages/color-decode-print.ts`
- `src/data/workbook/pages/coordinate-maze-print.ts`
- `src/data/workbook/pages/coordinate-safe-print.ts`
- `src/data/workbook/pages/coords-intro.ts`
- `src/data/workbook/pages/coords-practice.ts`
- `src/data/workbook/pages/distance-intro.ts`
- `src/data/workbook/pages/distance-practice.ts`
- `src/data/workbook/pages/errors-intro.ts`
- `src/data/workbook/pages/errors-practice.ts`
- `src/data/workbook/pages/graph-constant-rate.ts`
- `src/data/workbook/pages/graph-own-data.ts`
- `src/data/workbook/pages/graph-reading-intro.ts`
- `src/data/workbook/pages/graph-real-life.ts`
- `src/data/workbook/pages/graph-square-area.ts`
- `src/data/workbook/pages/graph-two-series.ts`
- `src/data/workbook/pages/graph-years.ts`
- `src/data/workbook/pages/hero-intro.ts`
- `src/data/workbook/pages/life-delivery-route.ts`
- `src/data/workbook/pages/life-hall-seats.ts`
- `src/data/workbook/pages/life-park-map.ts`
- `src/data/workbook/pages/life-park-route.ts`
- `src/data/workbook/pages/life-phone-screen.ts`
- `src/data/workbook/pages/life-pixel-art.ts`
- `src/data/workbook/pages/missing-coord-intro.ts`
- `src/data/workbook/pages/missing-coord-practice.ts`
- `src/data/workbook/pages/move-intro.ts`
- `src/data/workbook/pages/move-practice.ts`
- `src/data/workbook/pages/on-axes-intro.ts`
- `src/data/workbook/pages/on-axes-practice.ts`
- `src/data/workbook/pages/ordered-pair-drill.ts`
- `src/data/workbook/pages/ordered-pair-intro.ts`
- `src/data/workbook/pages/ordered-pair-practice.ts`
- `src/data/workbook/pages/parallel-perpendicular.ts`
- `src/data/workbook/pages/plot-marking.ts`
- `src/data/workbook/pages/plot-practice.ts`
- `src/data/workbook/pages/plot-shape.ts`
- `src/data/workbook/pages/position-language-intro.ts`
- `src/data/workbook/pages/position-language-own.ts`
- `src/data/workbook/pages/position-language-practice.ts`
- `src/data/workbook/pages/poster-games.ts`
- `src/data/workbook/pages/rays-build-right-angle.ts`
- `src/data/workbook/pages/rays-claims.ts`
- `src/data/workbook/pages/rays-right-angle.ts`
- `src/data/workbook/pages/rays-vertex-off-origin.ts`
- `src/data/workbook/pages/read-intro.ts`
- `src/data/workbook/pages/read-practice.ts`
- `src/data/workbook/pages/rectangles-intro.ts`
- `src/data/workbook/pages/rectangles-practice.ts`
- `src/data/workbook/pages/rectangles-vertices.ts`
- `src/data/workbook/pages/relations-intro.ts`
- `src/data/workbook/pages/relations-practice.ts`
- `src/data/workbook/pages/right-angle-build.ts`
- `src/data/workbook/pages/right-angle-intro.ts`
- `src/data/workbook/pages/right-angle-practice.ts`
- `src/data/workbook/pages/right-angle-summary.ts`
- `src/data/workbook/pages/rule-to-graph.ts`
- `src/data/workbook/pages/same-axis-print.ts`
- `src/data/workbook/pages/same-coord-intro.ts`
- `src/data/workbook/pages/same-coord-practice.ts`
- `src/data/workbook/pages/secret-word-print.ts`
- `src/data/workbook/pages/segment-length.ts`
- `src/data/workbook/pages/shape-move.ts`
- `src/data/workbook/pages/shapes-claims.ts`
- `src/data/workbook/pages/squares-intro.ts`
- `src/data/workbook/pages/squares-practice.ts`
- `src/data/workbook/pages/squares-summary.ts`
- `src/data/workbook/pages/suspect-point-print.ts`

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
