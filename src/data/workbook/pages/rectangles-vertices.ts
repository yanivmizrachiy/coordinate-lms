import type { WorkbookPageContent } from '../types';
import { sheet, grid, calcBox } from '../authoring';

/* Split off מלבנים במערכת הצירים: once each side got its own exercise line and
   the drawing grew to a size a learner can read, the sheet ran 170px over. */
export const RECTANGLES_VERTICES: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "קודקודים של מלבן",
  subtitle: "מזהים קודקודים נגדיים ובונים מלבן שלם",
  content: `
<div class="two-col">
<section class="q-card span-2">
<h3>מזהים קודקודים</h3>
<p>למלבן צלעות מקבילות לצירים. שני קודקודים נגדיים הם <span class="math-ltr" dir="ltr">(1,2)</span> ו־<span class="math-ltr" dir="ltr">(7,5)</span>.</p>
<p>סמנו את ארבעת הקודקודים על הסרטוט, חברו אותם למלבן, וכתבו את שני הקודקודים האחרים כזוגות סדורים:</p>
${grid({ size: 'sm', label: 'מערכת צירים ריקה לסימון המלבן' })}
<ul class="tasks compact">
<li><span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> &nbsp;&nbsp; <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>אורך המלבן: <span class="blank" style="--blank-width:4ch"></span> יח' &nbsp; רוחב המלבן: <span class="blank" style="--blank-width:4ch"></span> יח'</li>
</ul>
<p>איזו מהנקודות הבאות ממוקמת על <b>היקף</b> המלבן? הקיפו.</p>
<div class="choice-row"><span class="choice"><span class="math-ltr" dir="ltr">(4,2)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(3,3)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(8,5)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(2,6)</span></span>
</div>
</section>
<section class="q-card span-2">
<h3>בונים מלבן</h3>
<p>ציירו מלבן שאחד מקודקודיו הוא <span class="math-ltr" dir="ltr">(2,1)</span>, אורכו 4 יחידות ורוחבו 3 יחידות. כל הקודקודים חייבים להיות ברביע הראשון.</p>
<div aria-label="מערכת צירים ריקה לבניית מלבן" class="coordinate-grid grid-sm" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<p class="axis-answer-box">כתבו את ארבעת הקודקודים כזוגות סדורים: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></p>
${calcBox({ perimeter: true, area: true })}
</section>
</div>
`,
});
