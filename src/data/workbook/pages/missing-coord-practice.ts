import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const MISSING_COORD_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "שיעור חסר ודפוסים",
  subtitle: "מסיקים שיעור מתוך קו משותף או חוקיות",
  content: `
<div class="two-col">
<section class="q-card">
<h3>שיעור חסר</h3>
<ul class="tasks">
<li>הנקודה <span class="pair math-ltr" dir="ltr">A(<span class="pair-blank"></span>,4)</span> ממוקמת על אותו קו אנכי כמו <span class="math-ltr" dir="ltr">B(6,1)</span>. לכן <span class="math-ltr" dir="ltr">A=</span> <span class="blank" style="--blank-width:10ch"></span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">C(3,<span class="pair-blank"></span>)</span> ממוקמת על אותו קו אופקי כמו <span class="math-ltr" dir="ltr">D(7,5)</span>. לכן <span class="math-ltr" dir="ltr">C=</span> <span class="blank" style="--blank-width:10ch"></span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">E(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> ממוקמת על ציר <span class="math-ltr" dir="ltr">x</span> מתחת לנקודה <span class="math-ltr" dir="ltr">F(4,3)</span>. לכן <span class="math-ltr" dir="ltr">E=</span> <span class="blank" style="--blank-width:10ch"></span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">G(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> ממוקמת על ציר <span class="math-ltr" dir="ltr">y</span> משמאל לנקודה <span class="math-ltr" dir="ltr">H(5,2)</span>. לכן <span class="math-ltr" dir="ltr">G=</span> <span class="blank" style="--blank-width:10ch"></span></li>
</ul>
</section>
<section class="q-card">
<h3>דפוס של שיעורים זהים</h3>
<div aria-label="הנקודות אחת אחת עד ארבע ארבע" class="coordinate-grid grid-large" data-arrows="[]" data-points='[{"x": 1, "y": 1, "label": "A", "dx": 10, "dy": -10}, {"x": 2, "y": 2, "label": "B", "dx": 10, "dy": -10}, {"x": 3, "y": 3, "label": "C", "dx": 10, "dy": -10}, {"x": 4, "y": 4, "label": "D", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments='[{"from": [1, 1], "to": [4, 4], "type": "guide", "dashed": true}]' role="img">
</div>
<p>המשיכו את הדפוס בשתי נקודות נוספות:</p>
<ul class="tasks compact">
<li><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp;&nbsp; <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>כתבו כלל המתאר את כל הנקודות בדפוס: <span class="blank" style="--blank-width:16ch"></span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>משלימים סדרה</h3>
<table class="work-table center">
<thead>
<tr><th>מיקום בסדרה</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
</thead>
<tbody>
<tr><th>נקודה</th><td><span class="math-ltr" dir="ltr">(1,5)</span></td><td><span class="math-ltr" dir="ltr">(2,5)</span></td><td><span class="math-ltr" dir="ltr">(3,5)</span></td><td><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></td><td><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></td></tr>
</tbody>
</table>
<ul class="tasks compact">
<li>מה נשאר קבוע? <span class="blank" style="--blank-width:12ch"></span> &nbsp; מה משתנה? <span class="blank" style="--blank-width:12ch"></span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>שאלה נוספת</h3>
<p>בכל שלב שיעור <span class="math-ltr" dir="ltr">x</span> גדל ב־2 ושיעור <span class="math-ltr" dir="ltr">y</span> קטן ב־1. נקודת ההתחלה היא <span class="math-ltr" dir="ltr">(1,6)</span>.</p>
<p>כתבו את שלוש הנקודות הבאות:</p>
<ul class="tasks compact">
<li><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
</div>
`,
});
