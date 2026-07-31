import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const MOVE_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "הזזה של נקודות",
  subtitle: "ימינה ושמאלה משנות x; למעלה ולמטה משנות y",
  content: `
<div class="two-col">
<section class="q-card">
<h3>כללי ההזזה</h3>
<div class="rule-box">
    הזזה ימינה/שמאלה משנה רק את <b>שיעור <span class="math-ltr" dir="ltr">x</span></b>.<br>
    הזזה למעלה/למטה משנה רק את <b>שיעור <span class="math-ltr" dir="ltr">y</span></b>.
  
</div>
<p>לכל הזזה כתבו איזה שיעור <b>משתנה</b> ואיזה שיעור <b>נשאר זהה</b>.</p>
<table class="work-table center">
<tbody>
<tr><th>הזזה</th><th>מה משתנה?</th><th>מה נשאר זהה?</th></tr>
<tr><td>הזזה של 3 יחידות ימינה</td><td></td><td></td></tr>
<tr><td>הזזה של 2 יחידות שמאלה</td><td></td><td></td></tr>
<tr><td>הזזה של 4 יחידות למעלה</td><td></td><td></td></tr>
<tr><td>הזזה של 1 יחידה למטה</td><td></td><td></td></tr>
</tbody>
</table>
</section>
<section class="q-card">
<h3>מחשבים הזזה</h3>
<p>אם מזיזים את הנקודה, אז מקבלים נקודה חדשה. כתבו אותה כזוג סדור.</p>
<ul class="tasks">
<li>נקודה <span class="math-ltr" dir="ltr">(2,4)</span> אחרי הזזה של 5 יחידות ימינה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">(7,3)</span> אחרי הזזה של 4 יחידות שמאלה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">(5,1)</span> אחרי הזזה של 3 יחידות למעלה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">(4,6)</span> אחרי הזזה של 2 יחידות למטה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>מסלול בשני שלבים</h3>
<div aria-label="הזזה מ-A ל-B ול-C" class="coordinate-grid grid-xs" data-arrows='[{"from": [2, 2], "to": [6, 2], "label": "4 ימינה"}, {"from": [6, 2], "to": [6, 5], "label": "3 למעלה"}]' data-points='[{"x": 2, "y": 2, "label": "A", "dx": 10, "dy": -10}, {"x": 6, "y": 2, "label": "B", "dx": 10, "dy": -10}, {"x": 6, "y": 5, "label": "C", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments="[]" role="img">
</div>
<p>נקודה <span class="math-ltr" dir="ltr">A(2,2)</span> הוזזה 4 יחידות ימינה אל <span class="math-ltr" dir="ltr">B</span>, ואז 3 יחידות למעלה אל <span class="math-ltr" dir="ltr">C</span>.</p>
<ul class="tasks compact">
<li>כתבו כזוג סדור: <span class="math-ltr" dir="ltr">B</span> = <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="math-ltr" dir="ltr">C</span> = <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>מגלים את ההזזה</h3>
<p>השלימו את החסר: פעם ההזזה, פעם נקודת הסיום ופעם שיעור אחד.</p>
<ul class="tasks">
<li>מנקודה <span class="math-ltr" dir="ltr">(1,5)</span> אל נקודה <span class="math-ltr" dir="ltr">(6,5)</span>: הזזה של <span class="blank" data-missing="relation" style="--blank-width:14ch"></span></li>
<li>הזזה של 4 יחידות למעלה מנקודה <span class="math-ltr" dir="ltr">(7,2)</span> מגיעה אל נקודה <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
<li>מנקודה <span class="math-ltr" dir="ltr">(5,4)</span> אל נקודה <span class="math-ltr" dir="ltr">(<span class="blank" data-missing="number" style="--blank-width:3ch"></span>,4)</span>: הזזה של 3 יחידות שמאלה.</li>
</ul>
</section>
</div>
`,
});
