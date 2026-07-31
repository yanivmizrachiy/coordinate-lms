import type { WorkbookPageContent } from '../types';
import { sheet, calcBox, exercise } from '../authoring';

export const SQUARES_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided ultra-dense",
  title: "ריבועים ומלבנים — שטח והיקף",
  subtitle: "השוואה, הזזה וטענות מתמטיות",
  content: `
<div class="cols-2">
<div aria-label="ריבוע ABCD" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 1, "label": "A"}, {"x": 6, "y": 1, "label": "B"}, {"x": 6, "y": 5, "label": "C"}, {"x": 2, "y": 5, "label": "D"}]' data-polygons='[{"points": [[2, 1], [6, 1], [6, 5], [2, 5]]}]' data-segments="[]" role="img">
</div>
<section class="q-card">
<h3>א. הריבוע <span class="math-ltr" dir="ltr">ABCD</span>.</h3>
<ul class="tasks compact">
<li>הצלעות המקבילות לציר <span class="math-ltr" dir="ltr">x</span> הן <span class="blank" data-missing="letter" style="--blank-width:8ch"></span>.</li>
<li>המלבן הזה הוא <b>ריבוע</b>, כי כל הצלעות שלו <span class="blank" data-missing="relation" style="--blank-width:5ch"></span>.</li>
</ul>
${exercise('AB')}
${calcBox({ perimeter: true, area: true })}
<ul class="tasks compact">
<li>באורך <span class="blank" data-missing="number" style="--blank-width:3ch"></span> יח' וברוחב <span class="blank" data-missing="number" style="--blank-width:3ch"></span> יח' — ולכן האורך והרוחב <b>זהים</b>.</li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ב. חשבו שטח והיקף לשני המלבנים.</h3>
<div class="cols-2">
<div><b>מלבן א:</b> <span class="math-ltr" dir="ltr">(1,1),(7,1),(7,3),(1,3)</span>
<div aria-label="מערכת צירים ברביע הראשון" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 1, "y": 1}, {"x": 7, "y": 1}, {"x": 7, "y": 3}, {"x": 1, "y": 3}]' data-polygons='[{"points": [[1, 1], [7, 1], [7, 3], [1, 3]]}]' data-segments="[]" role="img">
</div>
${calcBox({ perimeter: true, area: true })}
</div>
<div><b>מלבן ב:</b> <span class="math-ltr" dir="ltr">(2,1),(5,1),(5,5),(2,5)</span>
<div aria-label="מערכת צירים ברביע הראשון" class="coordinate-grid grid-sm" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 1}, {"x": 5, "y": 1}, {"x": 5, "y": 5}, {"x": 2, "y": 5}]' data-polygons='[{"points": [[2, 1], [5, 1], [5, 5], [2, 5]]}]' data-segments="[]" role="img">
</div>
${calcBox({ perimeter: true, area: true })}
</div>
</div>
<ul class="tasks compact">
<li>האם אותו שטח מחייב אותו היקף? <span class="blank" style="--blank-width:6ch"></span></li>
</ul>
</section>
<div class="cols-2">
<section class="q-card">
<h3>ג. הזיזו את הריבוע (1,1),(4,1),(4,4),(1,4) - 3 ימינה ו־2 למעלה.</h3>
<ul class="tasks compact">
<li>הנקודה <span class="pair math-ltr" dir="ltr">A′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">B′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>הנקודה <span class="pair math-ltr" dir="ltr">C′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> <span class="pair math-ltr" dir="ltr">D′(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
${calcBox({ perimeter: true, area: true })}
<ul class="tasks compact">
<li>מה נשאר זהה? <span class="blank" style="--blank-width:10ch"></span></li>
</ul>
</section>
</div>
`,
});
