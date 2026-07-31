import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const PLOT_A: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "מסמנים נקודות",
  subtitle: "מהראשית: ימינה לפי שיעור x, למעלה לפי שיעור y",
  content: `
<div class="cols-2 compact-top">
<div class="rule-box"><b>הדגמה:</b> כדי לסמן נקודה <span class="math-ltr" dir="ltr">A(3,4)</span> מתחילים בראשית, זזים 3 יחידות ימינה (שיעור <span class="math-ltr" dir="ltr">x</span>) ואז 4 יחידות למעלה (שיעור <span class="math-ltr" dir="ltr">y</span>).
</div>
<div aria-label="הדגמת סימון הנקודה A שלוש ארבע" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 3, "y": 4, "label": "A"}]' data-polygons="[]" data-segments='[{"from": [0, 0], "to": [3, 0], "dashed": true, "type": "guide"}, {"from": [3, 0], "to": [3, 4], "dashed": true, "type": "guide"}]' role="img">
</div>
</div>
<section class="q-card">
<h3>א. סמנו את הנקודות על הסרטוט וכתבו ליד כל נקודה את שמה.</h3>
<p>נקודה <span class="math-ltr" dir="ltr">A(2,1)</span>, נקודה <span class="math-ltr" dir="ltr">B(5,4)</span>, נקודה <span class="math-ltr" dir="ltr">C(7,2)</span>, נקודה <span class="math-ltr" dir="ltr">D(3,6)</span>, נקודה <span class="math-ltr" dir="ltr">E(6,5)</span>.</p>
<div aria-label="מערכת צירים גדולה לסימון חמש נקודות" class="coordinate-grid grid-lg" data-arrows="[]" data-labelboxes="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
</section>
<section class="q-card">
<h3>ב. סמנו את הנקודות לפי השיעורים, וכתבו כל אחת כזוג סדור.</h3>
<div class="cols-2">
<div aria-label="מערכת צירים לסימון הנקודות F G H" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<div>
<ul class="tasks compact">
<li>נקודה <span class="math-ltr" dir="ltr">F</span>: שיעור <span class="math-ltr" dir="ltr">x =</span> 4, שיעור <span class="math-ltr" dir="ltr">y =</span> 2 &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">F(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">G</span>: שיעור <span class="math-ltr" dir="ltr">x =</span> 1, שיעור <span class="math-ltr" dir="ltr">y =</span> 5 &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">G(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">H</span>: שיעור <span class="math-ltr" dir="ltr">x =</span> 8, שיעור <span class="math-ltr" dir="ltr">y =</span> 3 &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">H(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</div>
</div>
</section>
`,
});
