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
<p class="spread">סמנו במערכת הצירים שלפניכם את שלוש הנקודות, וכתבו את שם הנקודה ליד כל סימון: <span class="math-ltr" dir="ltr">P(2,5), Q(7,3), R(5,6)</span>.</p>
<div aria-label="מערכת צירים ריקה לסימון הנקודות P Q R" class="coordinate-grid grid-large" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<ul class="tasks compact">
<li>מי הנקודה הגבוהה ביותר? <span class="blank" data-missing="letter" style="--blank-width:5ch"></span></li>
<li>מי הנקודה הימנית ביותר? <span class="blank" data-missing="letter" style="--blank-width:5ch"></span></li>
<li>מי הנקודה השמאלית ביותר? <span class="blank" data-missing="letter" style="--blank-width:5ch"></span></li>
<li>הנקודה הנמוכה ביותר היא <span class="blank" data-missing="letter" style="--blank-width:5ch"></span>, ושיעור ה־<span class="math-ltr" dir="ltr">y</span> שלה הוא <span class="blank" data-missing="number" style="--blank-width:4ch"></span>.</li>
<li>הנקודה <span class="math-ltr" dir="ltr">R</span> רחוקה מציר <span class="math-ltr" dir="ltr">x</span> <span class="blank" data-missing="number" style="--blank-width:4ch"></span> יחידות, כי זה שיעור ה־<span class="math-ltr" dir="ltr">y</span> שלה.</li>
<li>סמנו על הסרטוט נקודה <span class="math-ltr" dir="ltr">S</span> משלכם שממוקמת מימין לנקודה <span class="math-ltr" dir="ltr">P</span> ומתחת לנקודה <span class="math-ltr" dir="ltr">R</span>, וכתבו את שיעוריה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
</ul>
</section>
</div>
`,
});
