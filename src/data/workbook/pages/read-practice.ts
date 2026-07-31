import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const READ_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "קוראים שיעורי נקודות",
  subtitle: "מזהים מיקום וכותבים (x,y)",
  content: `
<div class="two-col">
<section class="q-card">
<h3>קוראים מן הגרף</h3>
<div aria-label="מערכת צירים ובה הנקודות A B C D" class="coordinate-grid grid-large" data-arrows="[]" data-points='[{"x": 1, "y": 2, "label": "A", "dx": 10, "dy": -10}, {"x": 4, "y": 5, "label": "B", "dx": 10, "dy": -10}, {"x": 7, "y": 3, "label": "C", "dx": 10, "dy": -10}, {"x": 5, "y": 0, "label": "D", "dx": 10, "dy": -12}]' data-polygons="[]" data-segments="[]" role="img">
</div>
<table class="work-table center">
<tbody>
<tr><th>כתבו כל נקודה כזוג סדור</th></tr>
<tr><td><span class="pair math-ltr" dir="ltr">A(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></td></tr>
<tr><td><span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></td></tr>
<tr><td><span class="pair math-ltr" dir="ltr">C(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></td></tr>
<tr><td><span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></td></tr>
</tbody>
</table>
</section>
<section class="q-card">
<h3>קוראים ומשווים</h3>
<div aria-label="מערכת צירים ובה הנקודות K L M N" class="coordinate-grid grid-large" data-arrows="[]" data-points='[{"x": 0, "y": 4, "label": "K", "dx": 12, "dy": -7}, {"x": 2, "y": 6, "label": "L", "dx": 10, "dy": 14}, {"x": 6, "y": 1, "label": "M", "dx": 10, "dy": -10}, {"x": 8, "y": 5, "label": "N", "dx": -20, "dy": -10}]' data-polygons="[]" data-segments="[]" role="img">
</div>
<ul class="tasks compact">
<li>כתבו את שיעורי נקודה <span class="math-ltr" dir="ltr">K</span>: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>כתבו את שיעורי נקודה <span class="math-ltr" dir="ltr">N</span>: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>לאילו נקודות שיעור <span class="math-ltr" dir="ltr">y</span> גדול מ־3? <span class="blank" style="--blank-width:10ch"></span></li>
<li>איזו נקודה ממוקמת על ציר <span class="math-ltr" dir="ltr">y</span>? <span class="blank" style="--blank-width:5ch"></span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>שאלה נוספת</h3>
<p>נקודה ממוקמת בגובה של <span class="math-ltr" dir="ltr">L</span> ובאותו קו אנכי כמו <span class="math-ltr" dir="ltr">M</span>.</p>
<ul class="tasks compact">
<li>מהם שיעוריה? <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
<p>נמקו בעזרת הביטויים <b>שיעור <span class="math-ltr" dir="ltr">x</span> זהה</b> ו־<b>שיעור <span class="math-ltr" dir="ltr">y</span> זהה</b>.</p>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
</div>
`,
});
