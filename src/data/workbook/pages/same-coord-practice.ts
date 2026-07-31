import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const SAME_COORD_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "שיעורים זהים וקטעים מקבילים",
  subtitle: "אותו x יוצר אנכי; אותו y יוצר אופקי",
  content: `
<div class="two-col">
<section class="q-card">
<h3>הכלל הגאומטרי</h3>
<div class="rule-box">
    אותו שיעור <span class="math-ltr" dir="ltr">x</span> ⇒ הנקודות בקו אנכי והקטע מקביל לציר <span class="math-ltr" dir="ltr">y</span>.<br>
    אותו שיעור <span class="math-ltr" dir="ltr">y</span> ⇒ הנקודות בקו אופקי והקטע מקביל לציר <span class="math-ltr" dir="ltr">x</span>.
  
</div>
<p>השלימו:</p>
<ul class="tasks">
<li>הנקודה <span class="math-ltr" dir="ltr">P(3,1)</span> ו־<span class="math-ltr" dir="ltr">Q(3,6)</span> - שיעור <span class="blank" data-missing="letter" style="--blank-width:3ch"></span> זהה.</li>
<li>ב־<span class="math-ltr" dir="ltr">R(1,4)</span> ו־<span class="math-ltr" dir="ltr">S(7,4)</span> שיעור <span class="math-ltr" dir="ltr">y</span> זהה, ולכן הקטע <span class="math-ltr" dir="ltr">RS</span> מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>מזהים קטעים</h3>
<div aria-label="מערכת צירים עם הקטעים AB BC CD" class="coordinate-grid grid-md" data-arrows="[]" data-points='[{"x": 2, "y": 1, "label": "A", "dx": 10, "dy": -10}, {"x": 2, "y": 5, "label": "B", "dx": 10, "dy": -10}, {"x": 6, "y": 5, "label": "C", "dx": 10, "dy": -10}, {"x": 6, "y": 2, "label": "D", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments='[{"from": [2, 1], "to": [2, 5], "type": "shape"}, {"from": [2, 5], "to": [6, 5], "type": "shape"}, {"from": [6, 5], "to": [6, 2], "type": "shape"}]' role="img">
</div>
<ul class="tasks compact">
<li>הקטע <span class="math-ltr" dir="ltr">AB</span> מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
<li>הקטע <span class="math-ltr" dir="ltr">BC</span> <span class="blank" data-missing="relation" style="--blank-width:6ch"></span> לקטע <span class="math-ltr" dir="ltr">AB</span>.</li>
<li>האם <span class="math-ltr" dir="ltr">CD</span> אופקי או אנכי? <span class="blank" data-missing="property" style="--blank-width:7ch"></span></li>
</ul>
</section>
<section class="q-card">
<h3>בוחרים זוגות</h3>
<p>הקיפו כל זוג שיוצר קטע אופקי:</p>
<p><span class="math-ltr" dir="ltr">(1,3),(5,3)</span> &nbsp; | &nbsp; <span class="math-ltr" dir="ltr">(4,1),(4,6)</span> &nbsp; | &nbsp; <span class="math-ltr" dir="ltr">(2,2),(7,2)</span></p>
<p>הקיפו כל זוג שיוצר קטע אנכי:</p>
<p><span class="math-ltr" dir="ltr">(6,1),(6,5)</span> &nbsp; | &nbsp; <span class="math-ltr" dir="ltr">(1,4),(5,4)</span> &nbsp; | &nbsp; <span class="math-ltr" dir="ltr">(3,0),(3,6)</span></p>
</section>
<section class="q-card span-2">
<h3>בונים קטעים</h3>
<p>במערכת סמנו את <span class="math-ltr" dir="ltr">M(4,2)</span>.</p>
<p>סמנו נקודה <span class="math-ltr" dir="ltr">N</span> כך שהקטע <span class="math-ltr" dir="ltr">MN</span> יהיה אופקי באורך 3 יחידות.</p>
<p>סמנו נקודה <span class="math-ltr" dir="ltr">T</span> כך שהקטע <span class="math-ltr" dir="ltr">MT</span> יהיה אנכי באורך 4 יחידות.</p>
<div aria-label="מערכת צירים ריקה לבניית קטעים" class="coordinate-grid grid-md" data-arrows="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
</section>
</div>
`,
});
