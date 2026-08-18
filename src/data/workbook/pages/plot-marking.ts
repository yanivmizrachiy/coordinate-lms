import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const PLOT_A: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "מסמנים נקודות",
  subtitle: "מראשית הצירים: ימינה לפי שיעור x, למעלה לפי שיעור y",
  content: `
<div class="cols-2 compact-top">
<div class="rule-box"><b>הדגמה:</b> כדי לסמן נקודה <span class="math-ltr" dir="ltr">M(3,4)</span> מתחילים בראשית הצירים, זזים 3 יחידות ימינה (שיעור <span class="math-ltr" dir="ltr">x</span>) ואז 4 יחידות למעלה (שיעור <span class="math-ltr" dir="ltr">y</span>).
</div>
<div aria-label="הדגמת סימון הנקודה M שלוש ארבע" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 3, "y": 4, "label": "M"}]' data-polygons="[]" data-segments='[{"from": [0, 0], "to": [3, 0], "dashed": true, "type": "guide"}, {"from": [3, 0], "to": [3, 4], "dashed": true, "type": "guide"}]' role="img">
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
<div aria-label="מערכת צירים לסימון הנקודות F G H K L" class="coordinate-grid grid-md" data-arrows="[]" data-labelboxes="[]" data-points="[]" data-polygons="[]" data-segments="[]" role="img">
</div>
<div>
<ul class="tasks compact">
<li>נקודה <span class="math-ltr" dir="ltr">F</span>: שיעור <span class="math-ltr" dir="ltr">x = 4</span>, שיעור <span class="math-ltr" dir="ltr">y = 2</span> &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">F(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">G</span>: שיעור <span class="math-ltr" dir="ltr">x = 1</span>, שיעור <span class="math-ltr" dir="ltr">y = 5</span> &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">G(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">H</span>: שיעור <span class="math-ltr" dir="ltr">x = 8</span>, שיעור <span class="math-ltr" dir="ltr">y = 3</span> &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">H(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">K</span>: שיעור <span class="math-ltr" dir="ltr">x = 0</span>, שיעור <span class="math-ltr" dir="ltr">y = 4</span> &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">K(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">L</span>: שיעור <span class="math-ltr" dir="ltr">x = 6</span>, שיעור <span class="math-ltr" dir="ltr">y = 0</span> &nbsp;←&nbsp; <span class="pair math-ltr" dir="ltr">L(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</div>
</div>
</section>
`,
});
