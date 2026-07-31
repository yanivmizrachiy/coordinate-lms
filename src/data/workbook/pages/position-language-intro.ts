import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const POSITION_LANGUAGE_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided ultra-dense",
  title: "שפה של מיקום",
  subtitle: "מעל, מימין ועל הצירים",
  content: `
<div aria-label="נקודות לתיאור מיקום" class="coordinate-grid grid-lg" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 3, "y": 4, "label": "A"}, {"x": 5, "y": 0, "label": "B"}, {"x": 0, "y": 3, "label": "C"}, {"x": 6, "y": 2, "label": "D"}, {"x": 0, "y": 6, "label": "E"}, {"x": 0, "y": 0, "label": "O"}]' data-polygons="[]" data-segments="[]" role="img">
</div>
<section class="q-card">
<h3>א. כתבו את כל הנקודות המתאימות לכל תיאור.</h3>
<div class="cols-2 task-grid">
<div>מעל ציר x: <span class="blank" style="--blank-width:10ch"></span>
</div>
<div>על ציר x: <span class="blank" style="--blank-width:10ch"></span>
</div>
<div>מימין לציר y: <span class="blank" style="--blank-width:10ch"></span>
</div>
<div>על ציר y: <span class="blank" style="--blank-width:10ch"></span>
</div>
<div class="span-2">גם מעל x וגם מימין ל־y: <span class="blank" style="--blank-width:12ch"></span>
</div>
</div>
</section>
<section class="q-card">
<h3>ב. נכון / לא נכון.</h3>
<table class="tf-table" data-balanced="true">
<tbody>
<tr data-answer="true"><td>הנקודה B ממוקמת על ציר x.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-3-1" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-3-1" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="false"><td>הנקודה C ממוקמת מימין לציר y.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-3-2" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-3-2" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="true"><td>הנקודה A ממוקמת מעל ציר x.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-3-3" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-3-3" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="false"><td>הנקודה E ממוקמת מימין לציר y.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-3-4" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-3-4" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr data-answer="true"><td>הנקודה D ממוקמת מימין לציר y.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-3-5" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-3-5" value="false"><span>לא נכון</span></label>
</div></td></tr>
</tbody>
</table>
</section>
`,
});
