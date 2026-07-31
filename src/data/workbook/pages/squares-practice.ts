import type { WorkbookPageContent } from '../types';
import { sheet, calcBox, exercise } from '../authoring';

export const SQUARES_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "ריבוע ברביע הראשון",
  subtitle: "יישום משולב של כל הכללים",
  content: `
<div class="two-col">
<section class="q-card">
<h3>משלימים ריבוע</h3>
<p>נתונים שלושה קודקודים: <span class="math-ltr" dir="ltr">A(2,1), B(6,1), C(6,5)</span>.</p>
<div aria-label="שלושה קודקודים של ריבוע" class="coordinate-grid grid-sm" data-arrows="[]" data-points='[{"x": 2, "y": 1, "label": "A", "dx": 10, "dy": -10}, {"x": 6, "y": 1, "label": "B", "dx": 10, "dy": -10}, {"x": 6, "y": 5, "label": "C", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments='[{"from": [2, 1], "to": [6, 1], "type": "shape"}, {"from": [6, 1], "to": [6, 5], "type": "shape"}]' role="img">
</div>
<p class="axis-answer-box">הקודקוד הרביעי <span class="math-ltr" dir="ltr">D</span>: <span class="blank" style="--blank-width:10ch"></span></p>
<ul class="tasks compact">
<li>כתבו את תרגיל החיסור של אורך הצלע, ואת ההפרש שקיבלתם:</li>
</ul>
${exercise('AB')}
${calcBox({ perimeter: true, area: true })}
</section>
<section class="q-card">
<h3>ריבוע מתיאור</h3>
<p>קודקוד שמאלי־תחתון של ריבוע הוא <span class="math-ltr" dir="ltr">(1,2)</span>. אורך הצלע 3 יחידות והצלעות מקבילות לצירים.</p>
<p>כתבו את שלושת הקודקודים האחרים:</p>
<ul class="tasks compact">
<li><span class="blank" style="--blank-width:10ch"></span> &nbsp; <span class="blank" style="--blank-width:10ch"></span> &nbsp; <span class="blank" style="--blank-width:10ch"></span></li>
</ul>
${calcBox({ perimeter: true, area: true })}
</section>
<section class="q-card">
<h3>סיכום קצר</h3>
<table class="work-table">
<tbody>
<tr><td>נקודה על ציר <span class="math-ltr" dir="ltr">x</span></td><td><span class="math-ltr" dir="ltr">y=</span> <span class="blank" style="--blank-width:3ch"></span></td></tr>
<tr><td>נקודה על ציר <span class="math-ltr" dir="ltr">y</span></td><td><span class="math-ltr" dir="ltr">x=</span> <span class="blank" style="--blank-width:3ch"></span></td></tr>
<tr><td>קטע אופקי</td><td>שיעור <span class="blank" style="--blank-width:3ch"></span> זהה</td></tr>
<tr><td>קטע אנכי</td><td>שיעור <span class="blank" style="--blank-width:3ch"></span> זהה</td></tr>
<tr><td>הזזה ימינה</td><td>רק <span class="blank" style="--blank-width:3ch"></span> משתנה</td></tr>
<tr><td>הזזה למעלה</td><td>רק <span class="blank" style="--blank-width:3ch"></span> משתנה</td></tr>
</tbody>
</table>
</section>
<section class="q-card">
<h3>משימת סיכום</h3>
<p>התחילו בנקודה <span class="math-ltr" dir="ltr">P(1,1)</span>. זוזו 5 ימינה, 4 למעלה, 2 שמאלה ולבסוף 3 למטה.</p>
<p>כתבו את הנקודה לאחר כל שלב כזוג סדור:</p>
<ul class="tasks compact">
<li><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> → <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> → <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> → <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>מהי נקודת הסיום? <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
</div>
`,
});
