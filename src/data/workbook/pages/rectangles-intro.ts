import type { WorkbookPageContent } from '../types';
import { sheet, calcBox, exerciseGiven } from '../authoring';

export const RECTANGLES_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided dense",
  title: "מלבנים במערכת הצירים",
  subtitle: "קודקודים, צלעות מקבילות, היקף ושטח",
  content: `
<div class="cols-2">
<div aria-label="מלבן ABCD" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 1, "label": "A"}, {"x": 6, "y": 1, "label": "B"}, {"x": 6, "y": 4, "label": "C"}, {"x": 1, "y": 4, "label": "D"}]' data-polygons='[{"points": [[1, 1], [6, 1], [6, 4], [1, 4]]}]' data-segments="[]" role="img">
</div>
<div>
<section class="q-card">
<h3>א. לפי הגרף.</h3>
<ul class="tasks compact">
<li>לקודקודים <span class="blank" data-missing="letter" style="--blank-width:10ch"></span> יש ערך <span class="math-ltr" dir="ltr">x</span> זהה, ולכן הקטע שביניהם מקביל לציר <span class="math-ltr" dir="ltr">y</span>.</li>
<li>הקודקודים <span class="math-ltr" dir="ltr">A</span> ו־<span class="math-ltr" dir="ltr">B</span> חולקים שיעור <span class="math-ltr" dir="ltr">y</span> זהה, והוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</li>
<li>הצלעות המקבילות לציר <span class="math-ltr" dir="ltr">x</span> הן <span class="blank" data-missing="letter" style="--blank-width:8ch"></span>.</li>
<li>הצלעות <span class="blank" data-missing="letter" style="--blank-width:8ch"></span> מקבילות לציר <span class="math-ltr" dir="ltr">y</span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. אורכי הצלעות — תרגיל חיסור.</h3>
<ul class="tasks compact">
<li>הצלע <span class="math-ltr" dir="ltr">AB</span> מקבילה לציר <span class="math-ltr" dir="ltr">x</span>: ה־<span class="math-ltr" dir="ltr">x</span> הימני פחות השמאלי.</li>
</ul>
${exerciseGiven('AB', '6 − 1')}
<ul class="tasks compact">
<li>הצלע <span class="math-ltr" dir="ltr">BC</span> מקבילה לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>: ה־<span class="math-ltr" dir="ltr">y</span> הגבוה פחות הנמוך.</li>
</ul>
${exerciseGiven('BC', '4 − 1')}
${calcBox({ perimeter: true, area: true })}
</section>
</div>
</div>
<section class="q-card">
<h3>ג. הזיזו את המלבן 1 ימינה ו־2 למעלה.</h3>
<div class="cols-2">
<div>
<ul class="tasks compact">
<li>הנקודה <span class="pair math-ltr" dir="ltr">A′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">B′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">C′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">D′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</div>
<div>
<ul class="tasks compact">
<li>מה השתנה? <span class="blank" style="--blank-width:12ch"></span></li>
<li>מה נשאר זהה? <span class="blank" style="--blank-width:12ch"></span></li>
<li>אחרי ההזזה האורך, הרוחב, ההיקף והשטח <span class="blank" data-missing="relation" style="--blank-width:6ch"></span>, כי הזזה אינה משנה את הצורה.</li>
</ul>
</div>
</div>
</section>
<div class="cols-2">
<section class="q-card">
<h3>ד. משלימים את הקודקוד החסר.</h3>
<p>נתונים <span class="math-ltr" dir="ltr">P(2,2)</span>, <span class="math-ltr" dir="ltr">Q(7,2)</span> ו־<span class="math-ltr" dir="ltr">R(7,5)</span>.</p>
<div aria-label="מערכת צירים ברביע הראשון" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 2, "label": "P"}, {"x": 7, "y": 2, "label": "Q"}, {"x": 7, "y": 5, "label": "R"}]' data-polygons="[]" data-segments='[{"from": [2, 2], "to": [7, 2]}, {"from": [7, 2], "to": [7, 5]}]' role="img">
</div>
<p class="axis-answer-box">הקודקוד החסר: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></p>
${calcBox({ perimeter: true, area: true })}
</section>
<section class="q-card">
<h3>ה. הקיפו את הקודקוד הרביעי.</h3>
<p>נתונים <span class="math-ltr" dir="ltr">A(2,2)</span>, <span class="math-ltr" dir="ltr">B(7,2)</span> ו־<span class="math-ltr" dir="ltr">C(7,5)</span>.</p>
<div class="choice-row"><span class="choice"><span class="math-ltr" dir="ltr">(2,5)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(5,2)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(5,7)</span></span>
</div>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
</div>
`,
});
