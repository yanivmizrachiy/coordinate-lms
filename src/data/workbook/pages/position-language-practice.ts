import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const POSITION_LANGUAGE_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "שפת מיקום",
  subtitle: "ימין, שמאל, מעל, מתחת ושיעורים זהים",
  content: `
<div class="two-col">
<section class="q-card span-2">
<div class="rule-box completion-intro">
<div class="completion-sentence">בכל נקודה שממוקמת מעל ציר <span class="math-ltr" dir="ltr">x</span> שיעור ה־<span class="math-ltr" dir="ltr">y</span> גדול מ־<span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</div>
<div class="completion-sentence">בכל נקודה שממוקמת מימין לציר <span class="math-ltr" dir="ltr">y</span> ערך ה־<span class="blank" data-missing="letter" style="--blank-width:3ch"></span> גדול מ־0.</div>
<div class="completion-sentence">בכל נקודה ששיעוריה שווים, ערך ה־<span class="math-ltr" dir="ltr">x</span> <span class="blank" data-missing="relation" style="--blank-width:5ch"></span> לשיעור ה־<span class="math-ltr" dir="ltr">y</span>.</div>
</div>
<div aria-label="מערכת צירים ובה הנקודות A עד E" class="coordinate-grid grid-large" data-arrows="[]" data-points='[{"x": 2, "y": 2, "label": "A", "dx": 10, "dy": -10}, {"x": 5, "y": 2, "label": "B", "dx": 10, "dy": -10}, {"x": 5, "y": 5, "label": "C", "dx": 10, "dy": -10}, {"x": 1, "y": 5, "label": "D", "dx": 10, "dy": -10}, {"x": 4, "y": 4, "label": "E", "dx": 10, "dy": -10}]' data-polygons="[]" data-segments="[]" role="img">
</div>
</section>
<section class="q-card">
<h3>ימין, שמאל, מעל ומתחת</h3>
<ul class="tasks">
<li>הנקודה שממוקמת מימין לנקודה <span class="math-ltr" dir="ltr">A</span> ובאותו גובה היא <span class="blank" style="--blank-width:5ch"></span></li>
<li>מעל הנקודה <span class="math-ltr" dir="ltr">B</span> ובאותו קו אנכי ממוקמת הנקודה <span class="blank" style="--blank-width:5ch"></span></li>
<li>הנקודה שממוקמת משמאל לנקודה <span class="math-ltr" dir="ltr">C</span> ובאותו גובה היא <span class="blank" style="--blank-width:5ch"></span></li>
<li>מתחת לנקודה <span class="math-ltr" dir="ltr">C</span> ובאותו קו אנכי ממוקמת הנקודה <span class="blank" style="--blank-width:5ch"></span></li>
</ul>
</section>
<section class="q-card">
<h3>נקודות ששיעוריהן זהים</h3>
<ul class="tasks compact">
<li>הנקודות שבהן שיעור ה־<span class="math-ltr" dir="ltr">x</span> ושיעור ה־<span class="math-ltr" dir="ltr">y</span> <b>זהים</b> הן <span class="blank" data-missing="letter" style="--blank-width:10ch"></span>.</li>
</ul>
<p>כתבו שתי נקודות נוספות ברביע הראשון ששיעוריהן <b>שווים</b>:</p>
<ul class="tasks compact">
<li><span class="blank" style="--blank-width:9ch"></span> &nbsp;&nbsp; <span class="blank" style="--blank-width:9ch"></span></li>
<li>גם בנקודה <span class="math-ltr" dir="ltr">(0,0)</span> ערך ה־<span class="math-ltr" dir="ltr">x</span> ושיעור ה־<span class="math-ltr" dir="ltr">y</span> שווים, ושניהם <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</li>
</ul>
</section>
<section class="q-card span-2">
<h3>מתיאור לזוג סדור</h3>
<p>נקודה ממוקמת מימין לציר <span class="math-ltr" dir="ltr">y</span> במרחק 6 יחידות ומעל ציר <span class="math-ltr" dir="ltr">x</span> במרחק 3 יחידות.</p>
<ul class="tasks compact">
<li>שיעוריה: <span class="blank" style="--blank-width:10ch"></span></li>
</ul>
</section>
</div>
`,
});
