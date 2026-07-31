import type { WorkbookPageContent } from '../types';
import { sheet, calcBox } from '../authoring';

export const RIGHT_ANGLE_BUILD: WorkbookPageContent = sheet({
  sectionClass: "sheet guided dense",
  title: "בונים זווית ישרה",
  subtitle: "זזים לפי x ואז לפי y — ובפינה נוצרת זווית ישרה",
  contentTag: 'div',
  content: `
<div class="cols-2 compact-top">
<div class="rule-box completion-intro">
<div class="completion-sentence">מהראשית זזים תחילה לפי <span class="word-blank word-short" data-missing="letter" aria-label="מקום להשלמת האות x"></span> ואז לפי <span class="math-ltr" dir="ltr">y</span>.</div>
<div class="completion-sentence">בפינה שבה הכיוון משתנה מאופקי לאנכי נוצרת זווית <span class="word-blank word-medium" data-missing="property" aria-label="מקום להשלמת המילה ישרה"></span>.</div>
</div>
<div aria-label="מסלול מהראשית עם זווית ישרה בפינה" class="coordinate-grid grid-md" data-arrows='[{"from": [0, 0], "to": [4, 0], "label": "4 ימינה"}, {"from": [4, 0], "to": [4, 3], "label": "3 למעלה"}]' data-labelboxes="[]" data-points='[{"x": 0, "y": 0, "label": "O"}, {"x": 4, "y": 0, "label": ""}, {"x": 4, "y": 3, "label": "P"}]' data-polygons="[]" data-segments='[{"from": [3.5, 0], "to": [3.5, 0.5], "type": "guide"}, {"from": [3.5, 0.5], "to": [4, 0.5], "type": "guide"}]' role="img">
</div>
</div>
<section class="q-card">
<h3>א. לפי המסלול שלמעלה.</h3>
<ul class="tasks compact">
<li>בפינה (4,0) הכיוון משתנה מ־<span class="blank" style="--blank-width:5ch"></span> ל־<span class="blank" style="--blank-width:5ch"></span>.</li>
<li>לכן ב־(4,0) נוצרת זווית <span class="blank" style="--blank-width:5ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ב. אורי בונה מלבן ABCD. בכמה מקודקודי המלבן יש זווית ישרה?</h3>
<div class="cols-2">
<div aria-label="מלבן ABCD עם זוויות ישרות בקודקודים" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 1, "label": "A"}, {"x": 6, "y": 1, "label": "B"}, {"x": 6, "y": 4, "label": "C"}, {"x": 1, "y": 4, "label": "D"}]' data-polygons='[{"points": [[1, 1], [6, 1], [6, 4], [1, 4]]}]' data-segments="[]" role="img">
</div>
<div>
<p class="axis-answer-box">מספר הזוויות הישרות: <span class="blank" style="--blank-width:4ch"></span></p>
<ul class="tasks compact">
<li>הצלעות <span class="math-ltr" dir="ltr">AB</span> ו־<span class="math-ltr" dir="ltr">DC</span> מקבילות לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
<li>הצלעות <span class="blank" data-missing="letter" style="--blank-width:8ch"></span> ו־<span class="math-ltr" dir="ltr">BC</span> מקבילות לציר <span class="math-ltr" dir="ltr">y</span>, ולכן הן מאונכות ל־<span class="math-ltr" dir="ltr">AB</span>.</li>
</ul>
</div>
</div>
</section>
<section class="q-card span-2">
<h3>ג. חשבו את היקף ושטח המלבן ABCD מסעיף ב.</h3>
<ul class="tasks compact">
<li>האורך <span class="math-ltr" dir="ltr">AB</span>: <span class="blank" data-missing="number" style="--blank-width:4ch"></span> יח'. &nbsp; הרוחב <span class="math-ltr" dir="ltr">BC</span>: <span class="blank" data-missing="number" style="--blank-width:4ch"></span> יח'.</li>
<li>אורך הצלע <span class="math-ltr" dir="ltr">AB</span> והרוחב <span class="math-ltr" dir="ltr">BC</span> הם ההפרשים בין השיעורים המתאימים.</li>
</ul>
${calcBox({ perimeter: true, area: true })}
</section>
`,
});
