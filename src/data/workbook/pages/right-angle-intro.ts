import type { WorkbookPageContent } from '../types';
import { sheet, grid } from '../authoring';

export const RIGHT_ANGLE_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided dense",
  title: "זווית ישרה במערכת הצירים",
  subtitle: "הצירים מאונכים זה לזה, וכך גם קטע אופקי וקטע אנכי",
  contentTag: 'div',
  content: `
<div class="completion-intro">
<div class="completion-title">השלימו את המשפטים
</div>
<div class="completion-sentence">קטע המקביל לציר x הוא קטע <span class="word-blank word-medium"></span>.
</div>
<div class="completion-sentence">קטע המקביל לציר y הוא קטע <span class="word-blank word-medium"></span>.
</div>
<div class="completion-sentence">כאשר קטע אופקי וקטע אנכי נפגשים, נוצרת ביניהם זווית <span class="word-blank word-medium"></span>.
</div>
</div>
<section class="q-card">
<h3>א. השלימו לפי הסרטוט.</h3>
<div class="cols-2">
<div aria-label="זווית ישרה בנקודה B בין קטע אופקי לקטע אנכי" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes='[{"text": "זווית ישרה", "at": [4.2, 3.6], "to": [6, 2]}]' data-points='[{"x": 2, "y": 2, "label": "A"}, {"x": 6, "y": 2, "label": "B"}, {"x": 6, "y": 5, "label": "C"}]' data-polygons="[]" data-segments='[{"from": [2, 2], "to": [6, 2], "type": "shape"}, {"from": [6, 2], "to": [6, 5], "type": "shape"}, {"from": [5.5, 2], "to": [5.5, 2.5], "type": "guide"}, {"from": [5.5, 2.5], "to": [6, 2.5], "type": "guide"}]' role="img">
</div>
<div>
<ul class="tasks compact">
<li>הקטע <span class="math-ltr" dir="ltr">AB</span> מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>, כי בשתי הנקודות שעליו שיעור ה־<span class="math-ltr" dir="ltr">y</span> זהה.</li>
<li>הקטע <span class="math-ltr" dir="ltr">BC</span> מקביל לציר <span class="math-ltr" dir="ltr">y</span>, כי בשתי הנקודות שעליו שיעור ה־<span class="blank" data-missing="letter" style="--blank-width:3ch"></span> זהה.</li>
</ul>
<p class="axis-answer-box">הזווית הישרה ממוקמת בנקודה <span class="blank" style="--blank-width:4ch"></span></p>
</div>
</div>
</section>
<section class="q-card">
<h3>ב. נועה מסמנת קטע מ־(1,3) עד (5,3) וקטע מ־(5,3) עד (5,6). איזו זווית נוצרת בנקודה (5,3)?</h3>
<div class="choice-row"><span class="choice">זווית ישרה</span><span class="choice">אין זווית ישרה</span>
</div>
<ul class="tasks compact">
<li>הקטע הראשון מקביל לציר <span class="blank" style="--blank-width:4ch"></span>; הקטע השני מקביל לציר <span class="blank" style="--blank-width:4ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. סמנו את הקטעים, ואז השלימו עליהם.</h3>
<p>סמנו על הסרטוט את ארבע הנקודות, וציירו את שני הקטעים <span class="math-ltr" dir="ltr">AB</span> ו־<span class="math-ltr" dir="ltr">BC</span>.</p>
${grid({ size: 'md', label: 'מערכת צירים ריקה לסימון הנקודות ולציור שני הקטעים' })}
<ul class="tasks">
<li>לקטע <span class="math-ltr" dir="ltr">AB</span> קצה אחד בנקודה <span class="math-ltr" dir="ltr">A(2,1)</span> והקצה האחר בנקודה <span class="math-ltr" dir="ltr">B(2,5)</span>, ולכן הוא מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
<li>לקטע <span class="math-ltr" dir="ltr">BC</span> קצה אחד בנקודה <span class="math-ltr" dir="ltr">B(2,5)</span> והקצה האחר בנקודה <span class="blank" data-missing="letter" style="--blank-width:8ch"></span>, ולכן הוא מקביל לציר <span class="math-ltr" dir="ltr">x</span>.</li>
<li>הנקודה <span class="math-ltr" dir="ltr">B</span> ממוקמת על שני הקטעים, ולכן היא <span class="blank" data-missing="concept" style="--blank-width:6ch"></span> הזווית שנוצרת ביניהם.</li>
<li>הזווית שקודקודה הוא הנקודה <span class="math-ltr" dir="ltr">B</span> היא זווית <span class="blank" data-missing="property" style="--blank-width:5ch"></span>.</li>
</ul>
</section>
`,
});
