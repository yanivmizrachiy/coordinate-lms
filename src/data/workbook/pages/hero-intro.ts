import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const HERO_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided dense",
  title: "מערכת הצירים והזוג הסדור",
  subtitle: "ערך x מצד שמאל, שיעור y מצד ימין",
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">כל נקודה נכתבת כ<b>זוג סדור</b> בתוך סוגריים: <span class="math-ltr" dir="ltr">(x,y)</span>.
</div>
<div class="completion-sentence">ערך <span class="word-blank word-short" aria-label="מקום להשלמת האות x"></span> נכתב מצד שמאל, ושיעור <span class="math-ltr" dir="ltr">y</span> נכתב מצד <span class="word-blank word-short" aria-label="מקום להשלמת המילה ימין"></span>.
</div>
<div class="completion-sentence">מכיוון שיש סֵדֶר, קוראים לזה זוג <span class="word-blank word-medium" aria-label="מקום להשלמת המילה סדור"></span>.
</div>
</div>
<section class="q-card">
<h3>לפניכם מערכת הצירים. השלימו לפיה את הסעיפים שמתחת.</h3>
<div aria-label="מערכת צירים גדולה ובה הנקודות A B C D" class="coordinate-grid grid-hero" data-arrows="[]" data-labelboxes="[]" data-points='[{"x": 2, "y": 5, "label": "A"}, {"x": 6, "y": 3, "label": "B"}, {"x": 4, "y": 0, "label": "C"}, {"x": 0, "y": 4, "label": "D"}]' data-polygons="[]" data-segments="[]" role="img">
</div>
</section>
<div class="cols-2">
<section class="q-card">
<h3>א. כתבו את שיעורי הנקודות כזוג סדור.</h3>
<div class="cols-2 task-grid">
<div><span class="pair math-ltr" dir="ltr">A(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="pair math-ltr" dir="ltr">C(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
</div>
</section>
<section class="q-card">
<h3>ב. בנקודה <span class="math-ltr" dir="ltr">A</span>.</h3>
<ul class="tasks compact">
<li>ערך <span class="math-ltr" dir="ltr">x</span> (מצד שמאל) הוא <span class="blank" style="--blank-width:4ch"></span>.</li>
<li>שיעור <span class="math-ltr" dir="ltr">y</span> (מצד ימין) הוא <span class="blank" style="--blank-width:4ch"></span>.</li>
</ul>
</section>
</div>
<div class="cols-2">
<section class="q-card">
<h3>ג. נקודות שעל הצירים.</h3>
<ul class="tasks compact">
<li>איזו נקודה ממוקמת על ציר <span class="math-ltr" dir="ltr">x</span>? <span class="blank" data-missing="letter" style="--blank-width:4ch"></span></li>
<li>נקודה <span class="math-ltr" dir="ltr">D</span> ממוקמת על ציר <span class="blank" data-missing="letter" style="--blank-width:4ch"></span>.</li>
<li>בנקודה <span class="math-ltr" dir="ltr">C</span> שיעור <span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:4ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ד. השלימו לפי הסרטוט.</h3>
<ul class="tasks compact">
<li>בנקודה <span class="math-ltr" dir="ltr">B</span> ערך <span class="math-ltr" dir="ltr">x</span> הוא <span class="blank" style="--blank-width:4ch"></span> ושיעור <span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" style="--blank-width:4ch"></span>.</li>
<li>בנקודה <span class="math-ltr" dir="ltr">C</span>, שממוקמת על ציר <span class="math-ltr" dir="ltr">x</span>, שיעור <span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" style="--blank-width:4ch"></span>.</li>
<li>בנקודה <span class="math-ltr" dir="ltr">D</span>, שממוקמת על ציר <span class="math-ltr" dir="ltr">y</span>, ערך <span class="math-ltr" dir="ltr">x</span> הוא <span class="blank" style="--blank-width:4ch"></span>.</li>
</ul>
</section>
</div>
`,
});
