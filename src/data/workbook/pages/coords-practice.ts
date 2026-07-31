import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const COORDS_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "שיעור x ושיעור y",
  subtitle: "המספר השמאלי אופקי; המספר הימני אנכי",
  content: `
<div class="two-col">
<section class="q-card">
<h3>קוראים כל שיעור בנפרד</h3>
<div class="rule-box">
    בנקודה <span class="math-ltr" dir="ltr">(x,y)</span>: המספר השמאלי הוא <b>שיעור <span class="math-ltr" dir="ltr">x</span></b>, והמספר הימני הוא <b>שיעור <span class="math-ltr" dir="ltr">y</span></b>.
  
</div>
<ul class="tasks">
<li>בנקודה <span class="math-ltr" dir="ltr">P(5,2)</span> שיעור <span class="math-ltr" dir="ltr">x</span> הוא <span class="blank" style="--blank-width:6ch"></span>, ושיעור <span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" style="--blank-width:6ch"></span>.</li>
<li>בנקודה <span class="math-ltr" dir="ltr">Q(0,6)</span> ערך <span class="math-ltr" dir="ltr">x</span> הוא <span class="blank" data-missing="number" style="--blank-width:6ch"></span>, ושיעור <span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:6ch"></span>.</li>
<li>בנקודה <span class="math-ltr" dir="ltr">R(8,0)</span> שיעור <span class="math-ltr" dir="ltr">y</span> הוא 0, ולכן היא ממוקמת על ציר <span class="blank" data-missing="letter" style="--blank-width:4ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>טבלת שיעורים</h3>
<table class="work-table center">
<thead>
<tr><th>נקודה</th><th>שיעור <span class="math-ltr" dir="ltr">x</span></th><th>שיעור <span class="math-ltr" dir="ltr">y</span></th></tr>
</thead>
<tbody>
<tr><td><span class="math-ltr" dir="ltr">A(1,4)</span></td><td></td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">B(6,2)</span></td><td></td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">C(3,5)</span></td><td></td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">D(7,1)</span></td><td></td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">E(2,6)</span></td><td></td><td></td></tr>
</tbody>
</table>
</section>
<section class="q-card span-2">
<h3>מתאימים לגרף</h3>
<div aria-label="מערכת צירים ובה הנקודות A B C D E" class="coordinate-grid grid-large" data-arrows="[]" data-points='[{"x": 1, "y": 4, "label": "A", "dx": 10, "dy": -10}, {"x": 6, "y": 2, "label": "B", "dx": 10, "dy": -10}, {"x": 3, "y": 5, "label": "C", "dx": 10, "dy": -10}, {"x": 7, "y": 1, "label": "D", "dx": 10, "dy": -10}, {"x": 2, "y": 6, "label": "E", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments="[]" role="img">
</div>
<p class="axis-answer-box">איזו נקודה בעלת שיעור <span class="math-ltr" dir="ltr">x=6</span>? <span class="blank" style="--blank-width:5ch"></span></p>
<ul class="tasks compact">
<li>לנקודה שבה שיעור ה־<span class="math-ltr" dir="ltr">y</span> הוא 6 קוראים <span class="blank" data-missing="letter" style="--blank-width:5ch"></span>.</li>
<li>הנקודה ששיעור ה־<span class="math-ltr" dir="ltr">y</span> שלה <span class="blank" data-missing="number" style="--blank-width:3ch"></span> היא הנקודה <span class="math-ltr" dir="ltr">E</span>.</li>
<li>איזו נקודה היא הימנית ביותר? <span class="blank" style="--blank-width:5ch"></span></li>
</ul>
</section>
</div>
`,
});
