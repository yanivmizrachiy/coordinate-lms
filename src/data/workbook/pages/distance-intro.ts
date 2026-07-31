import type { WorkbookPageContent } from '../types';
import { sheet, exerciseGiven } from '../authoring';

export const DISTANCE_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided ultra-dense",
  title: "מרחק נקודה מהצירים",
  subtitle: "מרחק לציר x, לציר y, אופקי ואנכי",
  content: `
<div class="cols-2 compact-top">
<div class="rule-box completion-intro">
<div class="completion-sentence">כדי להגיע אל ציר <span class="math-ltr" dir="ltr">y</span> משנים את ערך <span class="math-ltr" dir="ltr">x</span> ל־<span class="word-blank word-short" data-missing="number" aria-label="מקום להשלמת המספר אפס"></span>.</div>
<div class="completion-sentence">כדי להגיע אל ציר <span class="word-blank word-short" data-missing="letter" aria-label="מקום להשלמת האות x"></span> משנים את שיעור <span class="math-ltr" dir="ltr">y</span> ל־0.</div>
</div>
<div aria-label="מערכת צירים ברביע הראשון" class="coordinate-grid grid-sm" data-arrows='[{"from": [6, 4], "to": [0, 4], "label": "6 שמאלה"}, {"from": [6, 4], "to": [6, 0], "label": "4 למטה"}]' data-labelboxes="[]" data-points='[{"x": 6, "y": 4, "label": "P"}, {"x": 0, "y": 4, "label": ""}, {"x": 6, "y": 0, "label": ""}]' data-polygons="[]" data-segments="[]" role="img">
</div>
</div>
<section class="q-card">
<h3>א. השלימו את הטבלה.</h3>
<table class="work-table center small">
<tbody>
<tr><th>נקודה</th><th>מרחק לציר y</th><th>על ציר y</th><th>מרחק לציר x</th><th>על ציר x</th></tr>
<tr><td><span class="math-ltr" dir="ltr">A(3,5)</span></td><td></td><td></td><td></td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">B(7,2)</span></td><td></td><td></td><td></td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">C(4,4)</span></td><td></td><td></td><td></td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">D(1,6)</span></td><td></td><td></td><td></td><td></td></tr>
</tbody>
</table>
</section>
<section class="q-card">
<h3>ב. לאיזה ציר קרובה יותר כל נקודה?</h3>
<div class="task-grid">
<div>A: 
<div class="choice-row"><span class="choice">ציר x</span><span class="choice">ציר y</span><span class="choice">מרחקים זהים</span>
</div>
</div>
<div>B: 
<div class="choice-row"><span class="choice">ציר x</span><span class="choice">ציר y</span><span class="choice">מרחקים זהים</span>
</div>
</div>
<div>C: 
<div class="choice-row"><span class="choice">ציר x</span><span class="choice">ציר y</span><span class="choice">מרחקים זהים</span>
</div>
</div>
</div>
</section>
<div class="cols-2">
<section class="q-card">
<h3>ג. מרחק אופקי בין שתי נקודות.</h3>
<ul class="tasks compact">
<li>לשתי הנקודות <span class="math-ltr" dir="ltr">A(2,5)</span> ו־<span class="math-ltr" dir="ltr">B(7,5)</span> יש שיעור <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> <b>זהה</b>.</li>
<li>זהו תרגיל החיסור, והתוצאה שלו היא המרחק בין שתי הנקודות:</li>
</ul>
${exerciseGiven('AB', '7 − 2')}
<ul class="tasks compact">
<li>כתבו שתי נקודות משלכם שיש להן שיעור <span class="math-ltr" dir="ltr">y</span> זהה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> ו־<span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ד. מרחק אנכי בין שתי נקודות.</h3>
<ul class="tasks compact">
<li>לשתי הנקודות <span class="math-ltr" dir="ltr">C(4,1)</span> ו־<span class="math-ltr" dir="ltr">D(4,6)</span> יש שיעור <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> זהה, ולכן הקטע <span class="math-ltr" dir="ltr">CD</span> מקביל לציר <span class="math-ltr" dir="ltr">y</span>.</li>
<li>ה־<span class="math-ltr" dir="ltr">y</span> הגבוה פחות ה־<span class="math-ltr" dir="ltr">y</span> הנמוך:</li>
</ul>
${exerciseGiven('CD', '6 − 1')}
<ul class="tasks compact">
<li>כתבו שתי נקודות משלכם שיש להן שיעור <span class="math-ltr" dir="ltr">x</span> זהה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> ו־<span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ה. אורי חישב את המרחק בין <span class="math-ltr" dir="ltr">(2,5)</span> ובין <span class="math-ltr" dir="ltr">(7,5)</span> וקיבל 9.</h3>
<ul class="tasks compact">
<li>אורי <span class="blank" data-missing="relation" style="--blank-width:5ch"></span> את שני ערכי ה־<span class="math-ltr" dir="ltr">x</span> במקום לחסר אותם.</li>
<li>זהו תרגיל החיסור הנכון, והתוצאה שלו היא המרחק:</li>
</ul>
${exerciseGiven('', '7 − 2')}
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ו. נקודה שמרחקה זהה משני הצירים - מה אפשר לומר על שיעוריה?</h3>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
`,
});
