import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const SHAPE_MOVE: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "מזיזים צורה שלמה",
  subtitle: "כל קודקוד זז באותה הזזה בדיוק",
  content: `
<div class="rule-box">כאשר מזיזים <b>צורה שלמה</b>, כל קודקוד זז באותה הזזה. הצורה לא משנה את גודלה — רק את מקומה.
</div>
<section class="q-card">
<h3>לפניכם המלבן ABCD.</h3>
<div class="cols-2">
<div aria-label="מלבן ABCD ברביע הראשון" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 1, "label": "A"}, {"x": 4, "y": 1, "label": "B"}, {"x": 4, "y": 3, "label": "C"}, {"x": 1, "y": 3, "label": "D"}]' data-polygons='[{"points": [[1, 1], [4, 1], [4, 3], [1, 3]]}]' data-segments="[]" role="img">
</div>
<div>
<p><b>א. כתבו את שיעורי הקודקודים:</b></p>
<ul class="tasks compact">
<li>הנקודה <span class="pair math-ltr" dir="ltr">A(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">C(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</div>
</div>
</section>
<div class="cols-2">
<section class="q-card">
<h3>ב. הזזה של 3 יחידות ימינה.</h3>
<p>אם מזיזים את המלבן, אז מקבלים:</p>
<ul class="tasks compact">
<li>הנקודה <span class="pair math-ltr" dir="ltr">A(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">C(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
<section class="q-card">
<h3>ג. הזזה של 2 יחידות למעלה (מהמקור).</h3>
<p>אם מזיזים את המלבן, אז מקבלים:</p>
<ul class="tasks compact">
<li>הנקודה <span class="pair math-ltr" dir="ltr">A(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">C(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp; <span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ד. השלימו.</h3>
<ul class="tasks compact">
<li>בהזזה ימינה משתנה רק שיעור <span class="blank" style="--blank-width:3ch"></span>, ושיעור <span class="blank" style="--blank-width:3ch"></span> נשאר זהה.</li>
<li>בהזזה למעלה משתנה רק שיעור <span class="blank" style="--blank-width:3ch"></span>, ושיעור <span class="blank" style="--blank-width:3ch"></span> נשאר זהה.</li>
<li>אורך הצלע <span class="math-ltr" dir="ltr">AB</span> לפני ההזזה: <span class="blank" style="--blank-width:3ch"></span> יח'; אחרי ההזזה: <span class="blank" style="--blank-width:3ch"></span> יח'.</li>
</ul>
</section>
`,
});
