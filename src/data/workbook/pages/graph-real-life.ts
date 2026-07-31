import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const GRAPH_REAL: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "קוראים גרף מהחיים",
  subtitle: "שיעור x זהה — אותו משקל; שיעור y זהה — אותו מחיר",
  content: `
<div class="rule-box">בגרף שלפניכם כל נקודה מייצגת חבילת קמח. <b>שיעור <span class="math-ltr" dir="ltr">x</span></b> הוא ה<b>משקל</b> (ק"ג), ו<b>שיעור <span class="math-ltr" dir="ltr">y</span></b> הוא ה<b>מחיר</b> (₪).
</div>
<section class="q-card">
<h3>הגרף: משקל החבילה מול מחירה.</h3>
<div aria-label="גרף משקל מול מחיר עם שש חבילות" class="coordinate-grid grid-lg" data-axisx="משקל" data-axisy="מחיר" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 5, "label": "A"}, {"x": 3, "y": 5, "label": "B"}, {"x": 3, "y": 2, "label": "C"}, {"x": 6, "y": 4, "label": "D"}, {"x": 6, "y": 1, "label": "E"}, {"x": 8, "y": 4, "label": "F"}]' data-polygons="[]" data-segments="[]" role="img">
</div>
</section>
<div class="cols-2">
<section class="q-card">
<h3>א. כתבו את שיעורי החבילות.</h3>
<div class="cols-2 task-grid">
<div><span class="pair math-ltr" dir="ltr">A(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="pair math-ltr" dir="ltr">E(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
</div>
</section>
<section class="q-card">
<h3>ב. הכי כבדה, הכי זולה.</h3>
<ul class="tasks compact">
<li>איזו חבילה הכי <b>כבדה</b> (שיעור <span class="math-ltr" dir="ltr">x</span> הגדול ביותר)? <span class="blank" style="--blank-width:4ch"></span></li>
<li>איזו חבילה הכי <b>זולה</b> (שיעור <span class="math-ltr" dir="ltr">y</span> הקטן ביותר)? <span class="blank" style="--blank-width:4ch"></span></li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ג. שיעור זהה — מה זה אומר כאן?</h3>
<ul class="tasks compact">
<li>אילו שתי חבילות באותו <b>משקל</b> (שיעור <span class="math-ltr" dir="ltr">x</span> זהה)? <span class="blank" style="--blank-width:4ch"></span> ו־<span class="blank" style="--blank-width:4ch"></span>, וגם <span class="blank" style="--blank-width:4ch"></span> ו־<span class="blank" style="--blank-width:4ch"></span></li>
<li>אילו שתי חבילות באותו <b>מחיר</b> (שיעור <span class="math-ltr" dir="ltr">y</span> זהה)? <span class="blank" style="--blank-width:4ch"></span> ו־<span class="blank" style="--blank-width:4ch"></span>, וגם <span class="blank" style="--blank-width:4ch"></span> ו־<span class="blank" style="--blank-width:4ch"></span></li>
<li>שתי חבילות באותו משקל ממוקמות על קו <span class="blank" style="--blank-width:6ch"></span> (אנכי או אופקי).</li>
</ul>
</section>
`,
});
