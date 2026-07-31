import type { WorkbookPageContent } from '../types';
import { sheet, blank, ltr, pair, exercise, grid } from '../authoring';

export const RECTANGLES_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "מלבנים במערכת הצירים",
  subtitle: "מוצאים קודקוד חסר, ומחשבים אורך ורוחב",
  content: `
<div class="two-col">
<section class="q-card">
<h3>משלימים מלבן</h3>
<p>נתונים שלושה קודקודים: <span class="math-ltr" dir="ltr">A(1,1), B(6,1), C(6,4)</span>.</p>
<div aria-label="שלושה קודקודים של מלבן" class="coordinate-grid grid-sm" data-arrows="[]" data-points='[{"x": 1, "y": 1, "label": "A", "dx": 10, "dy": -10}, {"x": 6, "y": 1, "label": "B", "dx": 10, "dy": -10}, {"x": 6, "y": 4, "label": "C", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments='[{"from": [1, 1], "to": [6, 1], "type": "shape"}, {"from": [6, 1], "to": [6, 4], "type": "shape"}]' role="img">
</div>
<p class="axis-answer-box">סמנו את הקודקוד הרביעי <span class="math-ltr" dir="ltr">D</span> וכתבו את שיעוריו כזוג סדור: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></p>
</section>
<section class="q-card">
<h3>אורך ורוחב של מלבן</h3>
${grid({
  size: 'md',
  label: 'המלבן PQRS ובו ארבעה קודקודים מסומנים',
  points: [
    { x: 2, y: 2, label: 'P', dx: 12, dy: 14 },
    { x: 7, y: 2, label: 'Q', dx: 12, dy: 14 },
    { x: 7, y: 5, label: 'R', dx: 12, dy: -10 },
    { x: 2, y: 5, label: 'S', dx: -14, dy: -10 },
  ],
  polygons: [{ points: [[2, 2], [7, 2], [7, 5], [2, 5]] }],
})}
<ul class="tasks compact">
<li>ה<b>אורך</b> של מלבן הוא הצלע הארוכה, וה<b>רוחב</b> שלו הוא הצלע ה${blank(6, 'property')}.</li>
<li>במלבן ${ltr('PQRS')} האורך הוא הצלע ${blank(4, 'letter')}, והרוחב הוא הצלע ${ltr('QR')}.</li>
</ul>
<div class="calc-box"><b>דרך החישוב:</b>
${exercise('PQ')}
${exercise('QR')}
${exercise('P')}
${exercise('S', 'יח"ר')}
</div>
</section>
<section class="q-card span-2">
<h3>ג. סמנו מלבן משלכם, ואז השלימו את החסר.</h3>
<ul class="tasks compact">
<li>סמנו על הסרטוט שלמעלה מלבן ${ltr('ABCD')} שצלעותיו מקבילות לצירים, והאורך שלו גדול מהרוחב.</li>
<li>הקודקודים שבחרתם: ${pair('A')} ${pair('B')} ${pair('C')} ${pair('D')}</li>
</ul>
<div class="calc-box"><b>דרך החישוב:</b>
${exercise('AB')}
${exercise('BC')}
${exercise('P')}
${exercise('S', 'יח"ר')}
</div>
</section>
</div>
`,
});
