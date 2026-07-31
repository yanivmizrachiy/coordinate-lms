import type { WorkbookPageContent } from '../types';
import { sheet, calcBox } from '../authoring';

/* Split off ריבועים ומלבנים: five calculations, each with room for the working
   and its answer, do not fit on one sheet — and Yaniv's rule is that the
   working matters more than saving a page. */
export const SQUARES_SUMMARY: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "מלבן ברביע הראשון",
  subtitle: "משלימים קודקוד חסר, ומכריעים אם טענה נכונה בהכרח",
  content: `
<section class="q-card">
<h3>א. משלימים את הקודקוד החסר.</h3>
<p>נתונים שלושת הקודקודים <span class="math-ltr" dir="ltr">A(2,2)</span>, <span class="math-ltr" dir="ltr">B(2,6)</span> ו־<span class="math-ltr" dir="ltr">C(7,6)</span>.</p>
<ul class="tasks compact">
<li>הקודקוד הרביעי הוא הנקודה <span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
<li>הצלעות המקבילות לציר <span class="math-ltr" dir="ltr">x</span> הן <span class="blank" data-missing="letter" style="--blank-width:8ch"></span>.</li>
<li>ה<b>אורך</b> הוא הצלע <span class="blank" data-missing="letter" style="--blank-width:4ch"></span>, וה<b>רוחב</b> הוא הצלע <span class="math-ltr" dir="ltr">AB</span>.</li>
</ul>
${calcBox({ perimeter: true, area: true })}
<ul class="tasks compact">
<li>אם מזיזים את המלבן יחידה אחת ימינה, הקודקוד <span class="math-ltr" dir="ltr">A</span> מגיע אל <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>, וההיקף והשטח <span class="blank" data-missing="relation" style="--blank-width:5ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. הקיפו: מה נכון לגבי כל טענה?</h3>
<p>הטענה <b>נכונה בהכרח</b> · <b>ייתכן</b> שהטענה נכונה · <b>לא ייתכן</b> שהטענה נכונה.</p>
<div class="always-row"><span>1. אם לשתי נקודות אותו שיעור x, הקטע ביניהן מקביל לציר y.</span>
<div class="choice-row"><span class="choice">נכונה בהכרח</span><span class="choice">ייתכן שנכונה</span><span class="choice">לא ייתכן</span>
</div><span class="reason-line"></span>
</div>
<div class="always-row"><span>2. אם לשתי נקודות אותו שיעור y, הן ממוקמות באותו גובה.</span>
<div class="choice-row"><span class="choice">נכונה בהכרח</span><span class="choice">ייתכן שנכונה</span><span class="choice">לא ייתכן</span>
</div><span class="reason-line"></span>
</div>
<div class="always-row"><span>3. הזזה של מלבן משנה את שטחו.</span>
<div class="choice-row"><span class="choice">נכונה בהכרח</span><span class="choice">ייתכן שנכונה</span><span class="choice">לא ייתכן</span>
</div><span class="reason-line"></span>
</div>
<div class="always-row"><span>4. שני מלבנים בעלי אותו שטח הם בעלי אותו היקף.</span>
<div class="choice-row"><span class="choice">נכונה בהכרח</span><span class="choice">ייתכן שנכונה</span><span class="choice">לא ייתכן</span>
</div><span class="reason-line"></span>
</div>
</section>
<section class="q-card span-2">
<h3>ג. תרגיל מסכם.</h3>
<p>מלבן וריבוע חולקים את הקודקוד <span class="math-ltr" dir="ltr">(2,2)</span>. לריבוע צלע באורך 3. למלבן אורך 5 ורוחב 2. כל הצלעות מקבילות לצירים.</p>
<p>ציירו אפשרות אחת לכל צורה וכתבו את קודקודיה.</p>
<div aria-label="מערכת צירים ריקה לתרגיל מסכם" class="coordinate-grid grid-sm" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<p class="axis-answer-box">קודקודי הריבוע: <span class="blank" style="--blank-width:34ch"></span></p>
<ul class="tasks compact">
<li>קודקודי המלבן: <span class="blank" style="--blank-width:34ch"></span></li>
</ul>
</section>
`,
});
