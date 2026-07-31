import type { WorkbookPageContent } from '../types';
import { sheet, calcBox, exercise, pair } from '../authoring';

export const RIGHT_ANGLE_SUMMARY: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "זווית ישרה במערכת הצירים",
  subtitle: "מלבנים, זוויות ישרות, היקף ושטח ברביע הראשון",
  contentTag: 'div',
  content: `
<section class="q-card">
<h3>א. לפני המלבן ABCD שקודקודיו A(2,1), B(7,1), C(7,5), D(2,5).</h3>
<div class="cols-2">
<div aria-label="מלבן ABCD ברביע הראשון" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 1, "label": "A"}, {"x": 7, "y": 1, "label": "B"}, {"x": 7, "y": 5, "label": "C"}, {"x": 2, "y": 5, "label": "D"}]' data-polygons='[{"points": [[2, 1], [7, 1], [7, 5], [2, 5]]}]' data-segments="[]" role="img">
</div>
<div>
<ul class="tasks compact">
<li>הצלעות <span class="blank" data-missing="letter" style="--blank-width:8ch"></span> מקבילות לציר <span class="math-ltr" dir="ltr">x</span>.</li>
<li>הצלעות שמקבילות לציר <span class="math-ltr" dir="ltr">y</span> מאונכות להן, כי הזווית ביניהן היא זווית <span class="blank" data-missing="property" style="--blank-width:5ch"></span>.</li>
<li>מספר הזוויות הישרות: <span class="blank" style="--blank-width:3ch"></span></li>
</ul>
<p>חשבו את מידות המלבן, ורק אחר כך את ההיקף ואת השטח.</p>
${exercise('AB')}
${exercise('BC')}
${calcBox({ perimeter: true, area: true })}
</div>
</div>
</section>
<section class="q-card">
<h3>ב. דניאל סימן שלושה קודקודים: P(2,2), Q(6,2), R(6,5). סמנו את הקודקוד הרביעי S כך שייווצר מלבן.</h3>
<div class="cols-2">
<div aria-label="שלושה קודקודים לבניית מלבן עם זוויות ישרות" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 2, "label": "P"}, {"x": 6, "y": 2, "label": "Q"}, {"x": 6, "y": 5, "label": "R"}]' data-polygons="[]" data-segments='[{"from": [2, 2], "to": [6, 2], "type": "shape"}, {"from": [6, 2], "to": [6, 5], "type": "shape"}]' role="img">
</div>
<div>
<p class="axis-answer-box">${pair('S')}</p>
<ul class="tasks compact">
<li>בקודקוד Q הזווית היא <span class="blank" style="--blank-width:5ch"></span>.</li>
</ul>
${calcBox({ perimeter: true, area: true })}
</div>
</div>
</section>
<section class="q-card span-2">
<h3>ג. סמנו נכון או לא נכון.</h3>
<table class="tf-table">
<tr><td>לכל מלבן יש ארבע זוויות ישרות.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="rt-sum-1" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="rt-sum-1" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr><td>שני קטעים המקבילים שניהם לציר x יוצרים ביניהם זווית ישרה.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="rt-sum-2" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="rt-sum-2" value="false"><span>לא נכון</span></label>
</div></td></tr>
<tr><td>קטע המקביל לציר x וקטע המקביל לציר y יוצרים זווית ישרה.</td><td>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="rt-sum-3" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="rt-sum-3" value="false"><span>לא נכון</span></label>
</div></td></tr>
</table>
</section>
`,
});
