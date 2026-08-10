import type { WorkbookPageContent } from '../types';
import { sheet, wordBank } from '../authoring';

export const PARALLEL_PERPENDICULAR: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "קטעים מקבילים לצירים",
  subtitle: "קטע מקביל לציר x הוא מאונך לציר y",
  contentTag: 'div',
  content: `
<div class="rule-box">קטע <b>אופקי</b> מקביל לציר <span class="math-ltr" dir="ltr">x</span> — ולכן הוא <b>מאונך</b> לציר <span class="math-ltr" dir="ltr">y</span>. קטע <b>אנכי</b> מקביל לציר <span class="math-ltr" dir="ltr">y</span> — ולכן הוא <b>מאונך</b> לציר <span class="math-ltr" dir="ltr">x</span>.
</div>
<div class="cols-2">
<section class="q-card">
<h3>א. שני קטעים.</h3>
<div aria-label="קטע אופקי AB וקטע אנכי CD" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 2, "label": "A"}, {"x": 6, "y": 2, "label": "B"}, {"x": 3, "y": 3, "label": "C"}, {"x": 3, "y": 6, "label": "D"}]' data-polygons="[]" data-segments='[{"from": [1, 2], "to": [6, 2], "type": "shape"}, {"from": [3, 3], "to": [3, 6], "type": "shape"}]' role="img">
</div>
<ul class="tasks compact">
<li>הקטע <span class="math-ltr" dir="ltr">AB</span> מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>, כי בשתי הנקודות שעליו שיעור ה־<span class="math-ltr" dir="ltr">y</span> זהה.</li>
<li>הקטע <span class="math-ltr" dir="ltr">CD</span> מקביל לציר <span class="math-ltr" dir="ltr">y</span>, כי בשתי הנקודות שעליו שיעור ה־<span class="blank" data-missing="letter" style="--blank-width:3ch"></span> זהה.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. השלימו.</h3>
<ul class="tasks compact">
<li>אם שתי נקודות ממוקמות על קטע ושיעור ה־<span class="math-ltr" dir="ltr">y</span> שלהן זהה — הקטע מקביל בהכרח לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
<li>אם שתי נקודות ממוקמות על קטע ושיעור ה־<span class="blank" data-missing="letter" style="--blank-width:3ch"></span> שלהן זהה — הקטע מקביל בהכרח לציר <span class="math-ltr" dir="ltr">y</span>.</li>
<li>קטע המקביל לציר <span class="math-ltr" dir="ltr">x</span> הוא בהכרח <span class="blank" data-missing="relation" style="--blank-width:6ch"></span> לציר <span class="math-ltr" dir="ltr">y</span>.</li>
<li>קטע <span class="blank" data-missing="relation" style="--blank-width:6ch"></span> לציר <span class="math-ltr" dir="ltr">y</span> הוא בהכרח מאונך לציר <span class="math-ltr" dir="ltr">x</span>.</li>
</ul>
${wordBank(['מקביל', 'x', 'מאונך'])}
</section>
</div>
<section class="q-card span-2">
<h3>ג. סמנו נכון או לא נכון.</h3>
<table class="tf-table">
<tr data-answer="true"><td>קטע המקביל לציר <span class="math-ltr" dir="ltr">x</span> הוא בהכרח מאונך לציר <span class="math-ltr" dir="ltr">y</span>.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="pp-1" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="pp-1" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="false"><td>אם שתי נקודות ממוקמות על קטע המקביל לציר <span class="math-ltr" dir="ltr">y</span>, שיעור ה־<span class="math-ltr" dir="ltr">y</span> שלהן זהה.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="pp-2" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="pp-2" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="true"><td>אם שתי נקודות ממוקמות על קטע המקביל לציר <span class="math-ltr" dir="ltr">x</span>, שיעור ה־<span class="math-ltr" dir="ltr">y</span> שלהן זהה.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="pp-3" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="pp-3" value="false"><span>לא נכון</span></label>
</div></td></tr>
</table>
</section>
<section class="q-card span-2">
<h3>ד. מסמנים בעצמכם.</h3>
<ul class="tasks compact">
<li>סמנו על המערכת שבסעיף א קטע <span class="math-ltr" dir="ltr">EF</span> המקביל לציר <span class="math-ltr" dir="ltr">y</span>, וכתבו את שיעורי קצותיו: <span class="pair math-ltr" dir="ltr">E(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">F(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
<li>הקטע שסימנתם מאונך בהכרח לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
</ul>
</section>
`,
});
