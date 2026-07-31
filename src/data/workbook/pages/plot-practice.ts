import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const PLOT_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "מסמנים נקודות",
  subtitle: "זזים תחילה לפי x ואחר כך לפי y",
  content: `
<div class="two-col">
<section class="q-card">
<h3>מסמנים ארבע נקודות</h3>
<p>סמנו במערכת: <span class="math-ltr" dir="ltr">A(1,1), B(4,1), C(4,4), D(1,4)</span>.</p>
<div aria-label="מערכת צירים ריקה לסימון הנקודות A B C D" class="coordinate-grid grid-large" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<p>חברו את הנקודות לפי הסדר <span class="math-ltr" dir="ltr">A-B-C-D-A</span>.</p>
</section>
<section class="q-card">
<h3>מסמנים נקודות על הצירים</h3>
<p>סמנו: <span class="math-ltr" dir="ltr">E(0,5), F(6,0), G(0,2), H(3,0), O(0,0)</span>.</p>
<div aria-label="מערכת צירים ריקה לסימון נקודות על הצירים" class="coordinate-grid grid-large" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<p>הקיפו את הנקודה שממוקמת על שני הצירים.</p>
</section>
<section class="q-card span-2">
<h3>מסמנים ובודקים</h3>
<p>סמנו: <span class="math-ltr" dir="ltr">P(2,5), Q(7,3), R(5,6)</span>.</p>
<div aria-label="מערכת צירים ריקה לסימון הנקודות P Q R" class="coordinate-grid grid-large" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<ul class="tasks compact">
<li>מי מהנקודות הגבוהה ביותר? <span class="blank" style="--blank-width:5ch"></span></li>
<li>מי הימנית ביותר? <span class="blank" style="--blank-width:5ch"></span></li>
</ul>
</section>
</div>
`,
});
