import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const ON_AXES_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "נקודות שעל הצירים",
  subtitle: "מזהים x=0, y=0 ואת ראשית הצירים",
  content: `
<div class="two-col">
<section class="q-card">
<h3>מה משותף לכל הנקודות שממוקמות על ציר?</h3>
<div class="rule-box completion-intro">
<div class="completion-sentence">בכל נקודה שממוקמת על ציר <span class="math-ltr" dir="ltr">x</span> שיעור ה־<span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</div>
<div class="completion-sentence">בכל נקודה שממוקמת על ציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> ערך ה־<span class="math-ltr" dir="ltr">x</span> הוא 0.</div>
</div>
<ul class="tasks">
<li>לכן כל הנקודות שממוקמות על ציר <span class="math-ltr" dir="ltr">x</span> הן מהצורה <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,0)</span>.</li>
<li>וכל הנקודות שממוקמות על ציר <span class="math-ltr" dir="ltr">y</span> הן מהצורה <span class="pair math-ltr" dir="ltr">(0,<span class="pair-blank"></span>)</span>.</li>
<li>הנקודה שממוקמת על שני הצירים יחד היא ראשית הצירים, <span class="math-ltr" dir="ltr">O</span><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ממיינים נקודות</h3>
<p>מיינו את הנקודות: <span class="math-ltr" dir="ltr">(3,0), (0,5), (4,2), (0,0), (8,0), (0,1)</span>.</p>
<table class="work-table">
<tbody>
<tr><th>על ציר <span class="math-ltr" dir="ltr">x</span></th><th>על ציר <span class="math-ltr" dir="ltr">y</span></th><th>לא על ציר</th></tr>
<tr><td class="tall"></td><td class="tall"></td><td class="tall"></td></tr>
</tbody>
</table>
</section>
<section class="q-card span-2">
<h3>מסמנים על הצירים</h3>
<p>סמנו <span class="math-ltr" dir="ltr">A(2,0), B(0,3), C(7,0), D(0,6), O(0,0)</span>.</p>
<div aria-label="מערכת צירים ריקה לסימון נקודות על הצירים" class="coordinate-grid grid-large" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
</section>
<section class="q-card span-2">
<h3>נקודה מיוחדת</h3>
<p>איזו נקודה ממוקמת גם על ציר <span class="math-ltr" dir="ltr">x</span> וגם על ציר <span class="math-ltr" dir="ltr">y</span>?</p>
<ul class="tasks compact">
<li><span class="blank" style="--blank-width:12ch"></span></li>
</ul>
<ul class="tasks compact">
<li>אין נקודה אחרת כזאת, כי רק בה גם ערך ה־<span class="math-ltr" dir="ltr">x</span> הוא 0 וגם שיעור ה־<span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</li>
</ul>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
</div>
`,
});
