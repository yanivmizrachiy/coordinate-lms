import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const ON_AXES_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided dense",
  title: "נקודות שעל הצירים",
  subtitle: "מתי x=0 ומתי y=0",
  content: `
<div class="cols-3 rules">
<div class="rule-box completion-intro"><div class="completion-sentence">בכל נקודה שממוקמת על ציר <span class="math-ltr" dir="ltr">x</span> שיעור ה־<span class="math-ltr" dir="ltr">y</span> הוא <span class="word-blank word-short" data-missing="number" aria-label="מקום להשלמת המספר אפס"></span>.</div></div>
<div class="rule-box completion-intro"><div class="completion-sentence">בכל נקודה שממוקמת על ציר <span class="word-blank word-short" data-missing="letter" aria-label="מקום להשלמת האות y"></span> ערך ה־<span class="math-ltr" dir="ltr">x</span> הוא 0.</div></div>
<div class="rule-box completion-intro"><div class="completion-sentence">ראשית הצירים נכתבת <span class="pair math-ltr" dir="ltr">O(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</div></div>
</div>
<section class="q-card">
<h3>א. סמנו על הסרטוט את הנקודות <span class="math-ltr" dir="ltr">A(4,0)</span>, <span class="math-ltr" dir="ltr">B(0,5)</span>, <span class="math-ltr" dir="ltr">C(7,0)</span>, <span class="math-ltr" dir="ltr">D(0,2)</span>, <span class="math-ltr" dir="ltr">O(0,0)</span> ו־<span class="math-ltr" dir="ltr">E(3,4)</span>.</h3>
<div aria-label="נקודות על הצירים וברביע" class="coordinate-grid grid-lg" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 4, "y": 0, "label": "A"}, {"x": 0, "y": 5, "label": "B"}, {"x": 7, "y": 0, "label": "C"}, {"x": 0, "y": 2, "label": "D"}, {"x": 0, "y": 0, "label": "O"}, {"x": 3, "y": 4, "label": "E"}]' data-polygons="[]" data-segments="[]" role="img">
</div>
</section>
<section class="q-card">
<h3>ב. מיינו את הנקודות לטבלה.</h3>
<table class="work-table center">
<tbody>
<tr><th>על ציר x</th><th>על ציר y</th><th>ברביע ולא על ציר</th><th>ראשית הצירים</th></tr>
<tr><td class="tall"></td><td></td><td></td><td></td></tr>
</tbody>
</table>
</section>
<section class="q-card">
<h3>ג. השלימו.</h3>
<div class="cols-2 task-grid">
<div>הנקודה <span class="pair math-ltr" dir="ltr">P(6,<span class="pair-blank"></span>)</span> ממוקמת על ציר <span class="math-ltr" dir="ltr">x</span>.
</div>
<div>הנקודה <span class="pair math-ltr" dir="ltr">Q(<span class="pair-blank"></span>,4)</span> ממוקמת על ציר <span class="math-ltr" dir="ltr">y</span>.
</div>
<div>הנקודה שממוקמת על ציר <span class="math-ltr" dir="ltr">x</span> וערך ה־<span class="math-ltr" dir="ltr">x</span> שלה 2 היא <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,0)</span>.
</div>
<div>הנקודה שממוקמת על ציר <span class="math-ltr" dir="ltr">y</span> ושיעור ה־<span class="math-ltr" dir="ltr">y</span> שלה 6 היא <span class="pair math-ltr" dir="ltr">(0,<span class="pair-blank"></span>)</span>.
</div>
</div>
</section>
<section class="q-card">
<h3>ד. הנקודה שממוקמת על שני הצירים.</h3>
<ul class="tasks">
<li>הנקודה <span class="math-ltr" dir="ltr">O</span> ממוקמת גם על ציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> וגם על ציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
<li>היא היחידה כזאת, כי רק בה גם ערך ה־<span class="math-ltr" dir="ltr">x</span> הוא 0 וגם שיעור ה־<span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</li>
<li>שמה של הנקודה <span class="math-ltr" dir="ltr">O</span> הוא <span class="blank" data-missing="concept" style="--blank-width:6ch"></span> ה<span class="blank" data-missing="concept" style="--blank-width:6ch"></span>.</li>
</ul>
</section>
`,
});
