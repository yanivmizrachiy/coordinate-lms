import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const RIGHT_ANGLE_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "מזהים זווית ישרה",
  subtitle: "זווית ישרה נוצרת רק כשקטע אחד אופקי והשני אנכי",
  contentTag: 'div',
  content: `
<section class="q-card">
<h3>א. בכל שרטוט בדקו את הזווית בנקודה האמצעית וסמנו אם היא זווית ישרה.</h3>
<div class="cols-2">
<div>
<div aria-label="קטעים בנקודה P" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 2, "label": "M"}, {"x": 4, "y": 2, "label": "P"}, {"x": 4, "y": 5, "label": "N"}]' data-polygons="[]" data-segments='[{"from": [1, 2], "to": [4, 2], "type": "shape"}, {"from": [4, 2], "to": [4, 5], "type": "shape"}]' role="img">
</div>
<div class="mist-head"><span>הזווית שקודקודה הוא הנקודה P היא זווית ישרה</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="rt-1" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="rt-1" value="false"><span>לא נכון</span></label>
</div>
</div>
</div>
<div>
<div aria-label="קטעים בנקודה Q" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 1, "label": "R"}, {"x": 4, "y": 2, "label": "Q"}, {"x": 6, "y": 5, "label": "S"}]' data-polygons="[]" data-segments='[{"from": [1, 1], "to": [4, 2], "type": "shape"}, {"from": [4, 2], "to": [6, 5], "type": "shape"}]' role="img">
</div>
<div class="mist-head"><span>הזווית שקודקודה הוא הנקודה Q היא זווית ישרה</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="rt-2" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="rt-2" value="false"><span>לא נכון</span></label>
</div>
</div>
</div>
</div>
</section>
<section class="q-card">
<h3>ב. עוד שני שרטוטים. סמנו נכון או לא נכון.</h3>
<div class="cols-2">
<div>
<div aria-label="קטעים בנקודה K" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 5, "label": "A"}, {"x": 2, "y": 1, "label": "K"}, {"x": 7, "y": 1, "label": "B"}]' data-polygons="[]" data-segments='[{"from": [2, 5], "to": [2, 1], "type": "shape"}, {"from": [2, 1], "to": [7, 1], "type": "shape"}]' role="img">
</div>
<div class="mist-head"><span>הזווית שקודקודה הוא הנקודה K היא זווית ישרה</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="rt-3" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="rt-3" value="false"><span>לא נכון</span></label>
</div>
</div>
</div>
<div>
<div aria-label="קטעים בנקודה T" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 4, "label": "C"}, {"x": 5, "y": 4, "label": "T"}, {"x": 7, "y": 2, "label": "D"}]' data-polygons="[]" data-segments='[{"from": [1, 4], "to": [5, 4], "type": "shape"}, {"from": [5, 4], "to": [7, 2], "type": "shape"}]' role="img">
</div>
<div class="mist-head"><span>הזווית שקודקודה הוא הנקודה T היא זווית ישרה</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="rt-4" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="rt-4" value="false"><span>לא נכון</span></label>
</div>
</div>
</div>
</div>
<ul class="tasks compact">
<li>זווית ישרה נוצרת כאשר קטע אחד מקביל לציר <span class="math-ltr" dir="ltr">x</span> והשני מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. השלימו את הכלל.</h3>
<ul class="tasks">
<li>זווית ישרה נוצרת רק כשקטע אחד <span class="blank" data-missing="property" style="--blank-width:6ch"></span> והשני אנכי.</li>
<li>לשתי נקודות שעל קטע אנכי יש <span class="blank" data-missing="concept" style="--blank-width:5ch"></span> <span class="math-ltr" dir="ltr">x</span> זהה.</li>
<li>קטע המקביל לציר <span class="math-ltr" dir="ltr">x</span> הוא מאונך לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
</ul>
</section>
`,
});
