import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const DISTANCE_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "מרחק נקודה מהצירים",
  subtitle: "המרחק לציר נקבע לפי השיעור המתאים",
  content: `
<div class="two-col">
<section class="q-card">
<h3>מרחק מן הצירים</h3>
<div class="rule-box">
    המרחק של <span class="math-ltr" dir="ltr">(x,y)</span> מציר <span class="math-ltr" dir="ltr">y</span> הוא <span class="math-ltr" dir="ltr">x</span> יח'.<br>
    המרחק של <span class="math-ltr" dir="ltr">(x,y)</span> מציר <span class="math-ltr" dir="ltr">x</span> הוא <span class="math-ltr" dir="ltr">y</span> יח'.
  
</div>
<ul class="tasks">
<li>המרחק של <span class="math-ltr" dir="ltr">(5,2)</span> מציר <span class="math-ltr" dir="ltr">y</span>: <span class="blank" data-missing="number" style="--blank-width:5ch"></span> יח'.</li>
<li>המרחק של <span class="math-ltr" dir="ltr">(5,2)</span> מציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>: 2 יח'.</li>
<li>נקודה <span class="math-ltr" dir="ltr">(0,6)</span> ממוקמת על ציר <span class="math-ltr" dir="ltr">y</span>, ולכן מרחקה מציר <span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:5ch"></span> יח'.</li>
</ul>
</section>
<section class="q-card">
<h3>אל הצירים</h3>
<p>כדי להגיע מציר כלשהו, משנים רק שיעור אחד.</p>
<ul class="tasks">
<li>מ־<span class="math-ltr" dir="ltr">(7,3)</span> אל ציר <span class="math-ltr" dir="ltr">y</span>: הזזה של <span class="blank" data-missing="number" style="--blank-width:4ch"></span> יח' <span class="blank" data-missing="direction" style="--blank-width:8ch"></span>.</li>
<li>מ־<span class="math-ltr" dir="ltr">(4,5)</span> אל ציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>: הזזה של 5 יח' למטה.</li>
<li>הנקודה המתקבלת מ־<span class="math-ltr" dir="ltr">(3,6)</span> לאחר ירידה לציר <span class="math-ltr" dir="ltr">x</span>: <span class="blank" style="--blank-width:10ch"></span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>רואים את המרחק</h3>
<div aria-label="הנקודה P והזזות אל שני הצירים" class="coordinate-grid grid-large" data-arrows='[{"from": [6, 4], "to": [0, 4], "label": "6 שמאלה"}, {"from": [6, 4], "to": [6, 0], "label": "4 למטה"}]' data-points='[{"x": 6, "y": 4, "label": "P", "dx": 10, "dy": -10}, {"x": 0, "y": 4, "label": "Q", "dx": 12, "dy": -10}, {"x": 6, "y": 0, "label": "R", "dx": 10, "dy": -12}]' data-polygons="[]" data-segments="[]" role="img">
</div>
<p class="axis-answer-box">כתבו את שיעורי נקודה <span class="math-ltr" dir="ltr">Q</span>: <span class="pair math-ltr" dir="ltr">Q(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></p>
<ul class="tasks compact">
<li>כתבו את שיעורי נקודה <span class="math-ltr" dir="ltr">R</span>: <span class="pair math-ltr" dir="ltr">R(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>המסלול הקצר</h3>
<p>הנקודה <span class="math-ltr" dir="ltr">M(3,5)</span> יכולה להגיע לציר <span class="math-ltr" dir="ltr">x</span> או לציר <span class="math-ltr" dir="ltr">y</span>.</p>
<ul class="tasks compact">
<li>לאיזה ציר המסלול קצר יותר? <span class="blank" style="--blank-width:8ch"></span> &nbsp; בכמה יחידות? <span class="blank" style="--blank-width:4ch"></span></li>
</ul>
<p>נמקו.</p>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
</div>
`,
});
