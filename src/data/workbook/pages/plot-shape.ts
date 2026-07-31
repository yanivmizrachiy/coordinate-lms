import type { WorkbookPageContent } from '../types';
import { sheet, calcBox } from '../authoring';

export const PLOT_SHAPE: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "מסמנים, מחברים ומזהים צורה",
  subtitle: "מזוג סדור אל צורה — ואילו צלעות מקבילות לכל ציר",
  content: `
<section class="q-card">
<h3>א. סמנו את ארבע הנקודות וחברו את הקטעים לפי הסדר.</h3>
<p>נקודה <span class="math-ltr" dir="ltr">A(2,1)</span>, נקודה <span class="math-ltr" dir="ltr">B(7,1)</span>, נקודה <span class="math-ltr" dir="ltr">C(7,5)</span>, נקודה <span class="math-ltr" dir="ltr">D(2,5)</span>. חברו: <span class="math-ltr" dir="ltr">AB</span>, <span class="math-ltr" dir="ltr">BC</span>, <span class="math-ltr" dir="ltr">CD</span>, <span class="math-ltr" dir="ltr">DA</span>.</p>
<div aria-label="מערכת צירים לסימון ארבע נקודות וחיבורן" class="coordinate-grid grid-lg" data-arrows="[]" data-labelboxes="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<p class="axis-answer-box">איזו צורה התקבלה? <span class="blank" style="--blank-width:12ch"></span></p>
</section>
<div class="cols-2">
<section class="q-card">
<h3>ב. מקביל לאיזה ציר?</h3>
<ul class="tasks compact">
<li>הקטעים <span class="math-ltr" dir="ltr">AB</span> ו־<span class="math-ltr" dir="ltr">CD</span> מקבילים לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
<li>הקטעים <span class="blank" data-missing="letter" style="--blank-width:8ch"></span> ו־<span class="math-ltr" dir="ltr">DA</span> מקבילים לציר <span class="math-ltr" dir="ltr">y</span>.</li>
<li>קטע המקביל לציר <span class="math-ltr" dir="ltr">x</span> הוא מאונך לציר <span class="blank" style="--blank-width:3ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. איזה שיעור זהה?</h3>
<ul class="tasks compact">
<li>בקטע <span class="math-ltr" dir="ltr">AB</span> שיעור <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> זהה בשתי הנקודות.</li>
<li>בקטע <span class="math-ltr" dir="ltr">BC</span> ערך <span class="math-ltr" dir="ltr">x</span> זהה, ולכן הקטע <span class="blank" data-missing="relation" style="--blank-width:6ch"></span> לציר <span class="math-ltr" dir="ltr">y</span>.</li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ד. חשבו את ההיקף והשטח.</h3>
<p>אורך כל צלע הוא <b>הפרש</b>: בצלע המקבילה לציר <span class="math-ltr" dir="ltr">x</span> הימני פחות השמאלי, ובצלע המקבילה לציר <span class="math-ltr" dir="ltr">y</span> הגבוה פחות הנמוך.</p>
<ul class="tasks compact">
<li>אורך <span class="math-ltr" dir="ltr">AB</span>: <span class="blank" style="--blank-width:4ch"></span> יח'. &nbsp; אורך <span class="math-ltr" dir="ltr">BC</span>: <span class="blank" style="--blank-width:4ch"></span> יח'.</li>
</ul>
${calcBox({ perimeter: true, area: true })}
</section>
`,
});
