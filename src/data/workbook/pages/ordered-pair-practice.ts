import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const ORDERED_PAIR_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "הזוג הסדור",
  subtitle: "כותבים תמיד לפי הסדר (x,y)",
  content: `
<div class="two-col">
<section class="q-card">
<h3>כותבים זוג סדור</h3>
<p>כתבו כל תיאור כזוג סדור.</p>
<ul class="tasks">
<li>שיעור <span class="math-ltr" dir="ltr">x</span> הוא 4 ושיעור <span class="math-ltr" dir="ltr">y</span> הוא 3: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>שיעור <span class="math-ltr" dir="ltr">x</span> הוא 0 ושיעור <span class="math-ltr" dir="ltr">y</span> הוא 5: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>שיעור <span class="math-ltr" dir="ltr">x</span> הוא 8 ושיעור <span class="math-ltr" dir="ltr">y</span> הוא 0: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>שני השיעורים שווים ל־2: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
<section class="q-card">
<h3>משלימים זוגות</h3>
<ul class="tasks">
<li><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,4)</span> כאשר שיעור <span class="math-ltr" dir="ltr">x</span> הוא 7.</li>
<li><span class="pair math-ltr" dir="ltr">(3,<span class="pair-blank"></span>)</span> כאשר שיעור <span class="math-ltr" dir="ltr">y</span> הוא 6.</li>
<li><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> כאשר הנקודה היא ראשית הצירים.</li>
<li><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,0)</span> כאשר הנקודה על ציר <span class="math-ltr" dir="ltr">x</span> וערך <span class="math-ltr" dir="ltr">x</span> הוא 5.</li>
</ul>
</section>
<section class="q-card span-2">
<h3>הסדר משנה</h3>
<div aria-label="הנקודות M שתיים חמש ו-N חמש שתיים" class="coordinate-grid grid-large" data-arrows="[]" data-points='[{"x": 2, "y": 5, "label": "M", "dx": 10, "dy": -10}, {"x": 5, "y": 2, "label": "N", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments="[]" role="img">
</div>
<p class="axis-answer-box">כתבו את שיעורי נקודה <span class="math-ltr" dir="ltr">M</span>: <span class="pair math-ltr" dir="ltr">M(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></p>
<ul class="tasks compact">
<li>כתבו את שיעורי נקודה <span class="math-ltr" dir="ltr">N</span>: <span class="pair math-ltr" dir="ltr">N(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
<ul class="tasks compact">
<li>בשני הזוגות אותם מספרים, אבל ה<span class="blank" data-missing="concept" style="--blank-width:5ch"></span> שלהם שונה.</li>
<li>בנקודה <span class="math-ltr" dir="ltr">(2,5)</span> ערך ה־<span class="math-ltr" dir="ltr">x</span> הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>, ובנקודה <span class="math-ltr" dir="ltr">(5,2)</span> הוא 5.</li>
</ul>
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
