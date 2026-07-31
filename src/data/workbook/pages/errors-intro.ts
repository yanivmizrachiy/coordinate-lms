import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const ERRORS_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided error-page",
  title: "מזהים ומתקנים טעויות",
  subtitle: "נכון או לא נכון, תיקון והסבר",
  content: `
<div class="error-grid">
<div class="mist-card" data-answer="false">
<div class="mist-head">מקרה 1<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-1" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-1" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>התקבל x=3, y=5 ונכתב (5,3).</p><small>התיקון:</small>
<ul class="tasks compact">
<li>הזוג הסדור הנכון הוא <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>, כי ערך ה־<span class="math-ltr" dir="ltr">x</span> נכתב מצד <span class="blank" data-missing="property" style="--blank-width:5ch"></span>.</li>
</ul>
</div>
<div class="mist-card" data-answer="true">
<div class="mist-head">מקרה 2<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-2" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-2" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>הנקודה (5,0) ממוקמת על ציר x.</p><small>התיקון:</small>
<ul class="tasks compact">
<li>בנקודה <span class="math-ltr" dir="ltr">(5,0)</span> שיעור ה־<span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>, ולכן היא אכן על ציר <span class="math-ltr" dir="ltr">x</span>.</li>
</ul>
</div>
<div class="mist-card" data-answer="false">
<div class="mist-head">מקרה 3<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-3" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-3" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>הנקודה (0,4) ממוקמת מימין לציר y.</p><small>התיקון:</small>
<ul class="tasks compact">
<li>בנקודה <span class="math-ltr" dir="ltr">(0,4)</span> ערך ה־<span class="math-ltr" dir="ltr">x</span> הוא 0, ולכן היא <span class="blank" data-missing="relation" style="--blank-width:5ch"></span> על ציר <span class="math-ltr" dir="ltr">y</span> ולא מימין לו.</li>
</ul>
</div>
<div class="mist-card" data-answer="true">
<div class="mist-head">מקרה 4<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-4" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-4" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>אותו שיעור x פירושו שהנקודות ממוקמות על אותו קו אנכי.</p><small>התיקון:</small>
<ul class="tasks compact">
<li>ערך <span class="math-ltr" dir="ltr">x</span> זהה פירושו שהנקודות ממוקמות על אותו קו <span class="blank" data-missing="property" style="--blank-width:5ch"></span>.</li>
</ul>
</div>
<div class="mist-card" data-answer="false">
<div class="mist-head">מקרה 5<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-5" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-5" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>בנקודה (3,6), שיעור y גדול ב־2 משיעור x.</p><small>התיקון:</small>
<ul class="tasks compact">
<li>בנקודה <span class="math-ltr" dir="ltr">(3,6)</span> שיעור ה־<span class="math-ltr" dir="ltr">y</span> גדול ב־<span class="blank" data-missing="number" style="--blank-width:3ch"></span> מערך ה־<span class="math-ltr" dir="ltr">x</span>.</li>
</ul>
</div>
<div class="mist-card" data-answer="true">
<div class="mist-head">מקרה 6<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-6" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-6" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>מזיזים את (2,4) שלוש יחידות ימינה ומקבלים (5,4).</p><small>התיקון:</small>
<ul class="tasks compact">
<li>הזזה של 3 יחידות ימינה מוסיפה לערך ה־<span class="math-ltr" dir="ltr">x</span>, ולכן מתקבלת הנקודה <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
</ul>
</div>
<div class="mist-card" data-answer="false">
<div class="mist-head">מקרה 7<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-7" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-7" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>בקטע המקביל לציר x, שיעור x זהה בשתי הנקודות.</p><small>התיקון:</small>
<ul class="tasks compact">
<li>בקטע המקביל לציר <span class="math-ltr" dir="ltr">x</span> דווקא שיעור ה־<span class="blank" data-missing="letter" style="--blank-width:3ch"></span> זהה בשתי הנקודות.</li>
</ul>
</div>
<div class="mist-card" data-answer="true">
<div class="mist-head">מקרה 8<span>נכון / לא נכון</span>
<div class="tf-options" role="group" aria-label="סמנו נכון או לא נכון"><label class="tf-option"><input type="radio" name="tf-error-8" value="true"><span>נכון</span></label><label class="tf-option"><input type="radio" name="tf-error-8" value="false"><span>לא נכון</span></label>
</div>
</div>
<p>קטע המקביל לציר <span class="math-ltr" dir="ltr">x</span> הוא מאונך לציר <span class="math-ltr" dir="ltr">y</span>.</p><small>התיקון:</small>
<ul class="tasks compact">
<li>קטע המקביל לציר <span class="math-ltr" dir="ltr">x</span> הוא <span class="blank" data-missing="relation" style="--blank-width:5ch"></span> לציר <span class="math-ltr" dir="ltr">y</span>, כי הצירים מאונכים זה לזה.</li>
</ul>
</div>
</div>
`,
});
