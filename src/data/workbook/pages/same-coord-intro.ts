import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const SAME_COORD_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided dense",
  title: "שיעורים זהים וקטעים מקבילים",
  subtitle: "אותו x - אנכי; אותו y - אופקי",
  content: `
<div class="cols-2">
<div aria-label="קטעים AB BC CD" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 1, "label": "A"}, {"x": 2, "y": 5, "label": "B"}, {"x": 6, "y": 5, "label": "C"}, {"x": 6, "y": 2, "label": "D"}]' data-polygons="[]" data-segments='[{"from": [2, 1], "to": [2, 5]}, {"from": [2, 5], "to": [6, 5]}, {"from": [6, 5], "to": [6, 2]}]' role="img">
</div>
<div>
<section class="q-card">
<h3>א. הנקודות <span class="math-ltr" dir="ltr">A</span> ו־<span class="math-ltr" dir="ltr">B</span>.</h3>
<ul class="tasks compact">
<li>לשתי הנקודות <span class="math-ltr" dir="ltr">A</span> ו־<span class="math-ltr" dir="ltr">B</span> יש שיעור <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> <b>זהה</b>, והוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</li>
<li>לכן הקטע <span class="math-ltr" dir="ltr">AB</span> מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. הנקודות <span class="math-ltr" dir="ltr">B</span> ו־<span class="math-ltr" dir="ltr">C</span>.</h3>
<ul class="tasks compact">
<li>לשתי הנקודות <span class="math-ltr" dir="ltr">B</span> ו־<span class="math-ltr" dir="ltr">C</span> יש שיעור <span class="math-ltr" dir="ltr">y</span> זהה, והוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</li>
<li>כתבו שתי נקודות משלכם שיש להן שיעור <span class="math-ltr" dir="ltr">x</span> זהה: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> ו־<span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
</ul>
</section>
</div>
</div>
<div class="rule-box completion-intro">
<div class="completion-sentence">לשתי נקודות שיש להן שיעור <span class="math-ltr" dir="ltr">x</span> זהה, הקטע שביניהן מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</div>
<div class="completion-sentence">לשתי נקודות שיש להן שיעור <span class="math-ltr" dir="ltr">y</span> זהה, הקטע שביניהן מקביל לציר <span class="math-ltr" dir="ltr">x</span>.</div>
</div>
<section class="q-card">
<h3>ג. השלימו.</h3>
<ul class="tasks compact">
<li>לשתי הנקודות <span class="math-ltr" dir="ltr">P(4,1)</span> ו־<span class="math-ltr" dir="ltr">Q(4,6)</span> יש שיעור <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> זהה, ולכן הקטע <span class="math-ltr" dir="ltr">PQ</span> מקביל לציר <span class="math-ltr" dir="ltr">y</span>.</li>
<li>הקטע <span class="math-ltr" dir="ltr">RS</span> מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>, כי בשתי הנקודות שעליו שיעור ה־<span class="math-ltr" dir="ltr">y</span> זהה.</li>
</ul>
</section>
<section class="q-card">
<h3>ד. כתבו נקודה נוספת כך שהקטע בינה לבין <span class="math-ltr" dir="ltr">(3,4)</span> יהיה מקביל לציר x: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>. ולציר y: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</h3>
</section>
<section class="q-card">
<h3>ה. הקיפו את כל הנקודות ששני שיעוריהן זהים.</h3>
<div class="choice-row"><span class="choice"><span class="math-ltr" dir="ltr">(1,1)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(2,5)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(4,4)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(6,3)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(0,0)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(5,5)</span></span>
</div>
</section>
<section class="q-card">
<h3>ו. האם יכולות להיות שתי נקודות שונות בעלות אותו שיעור x וגם אותו שיעור y?</h3>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
`,
});
