import type { WorkbookPageContent } from '../types';
import { sheet, grid } from '../authoring';

/* Split off שפה של מיקום: once the learner was asked to mark points of their own
   under two conditions, the sheet ran over — and the working matters more than
   saving a page. */
export const POSITION_LANGUAGE_OWN: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "מסמנים נקודות לפי תיאור",
  subtitle: "מתיאור אל זוג סדור, ואז נקודות משלכם",
  content: `
<section class="q-card">
<h3>א. כתבו זוג סדור אחד לכל תיאור. יש כמה תשובות אפשריות.</h3>
<div class="cols-2 task-grid">
<div>מעל ציר x: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div>מימין לציר y: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div>על ציר x: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div>על ציר y: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div>גם מעל וגם מימין: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
</div>
</section>
<section class="q-card">
<h3>ב. סמנו נקודות משלכם, ואז השלימו את החסר.</h3>
${grid({
  size: 'md',
  label: 'הנקודות A עד E, ומקום לסימון נקודות משלכם',
  points: [
    { x: 3, y: 4, label: 'A' },
    { x: 5, y: 0, label: 'B' },
    { x: 0, y: 3, label: 'C' },
    { x: 6, y: 2, label: 'D' },
    { x: 0, y: 6, label: 'E' },
  ],
})}
<ul class="tasks compact">
<li>סמנו על הסרטוט נקודה <span class="math-ltr" dir="ltr">F</span> שממוקמת <b>על ציר <span class="math-ltr" dir="ltr">x</span></b>. שיעוריה: <span class="pair math-ltr" dir="ltr">F(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
<li>סמנו נקודה <span class="math-ltr" dir="ltr">G</span> שממוקמת <b>על ציר <span class="math-ltr" dir="ltr">x</span> וגם מימין לנקודה <span class="math-ltr" dir="ltr">B</span></b>. שיעוריה: <span class="pair math-ltr" dir="ltr">G(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
<li>בשתי הנקודות שסימנתם שיעור ה־<span class="math-ltr" dir="ltr">y</span> הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>, כי שתיהן ממוקמות על ציר <span class="math-ltr" dir="ltr">x</span>.</li>
<li>ערך ה־<span class="math-ltr" dir="ltr">x</span> של הנקודה <span class="math-ltr" dir="ltr">G</span> <span class="blank" data-missing="relation" style="--blank-width:5ch"></span> מערך ה־<span class="math-ltr" dir="ltr">x</span> של הנקודה <span class="math-ltr" dir="ltr">B</span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ג. מה משותף לכל הנקודות שעל ציר?</h3>
<ul class="tasks compact">
<li>כל הנקודות שממוקמות על ציר <span class="math-ltr" dir="ltr">y</span> הן מהצורה <span class="pair math-ltr" dir="ltr">(0,<span class="pair-blank"></span>)</span>, כי ערך ה־<span class="math-ltr" dir="ltr">x</span> שלהן הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span>.</li>
<li>כל הנקודות שממוקמות על ציר <span class="math-ltr" dir="ltr">x</span> הן מהצורה <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,0)</span>, כי שיעור ה־<span class="blank" data-missing="letter" style="--blank-width:3ch"></span> שלהן הוא 0.</li>
<li>לכן הנקודה <span class="math-ltr" dir="ltr">(0,4)</span> ממוקמת מעל ציר <span class="math-ltr" dir="ltr">x</span>, אבל היא אינה מימין לציר <span class="math-ltr" dir="ltr">y</span> — היא <span class="blank" data-missing="property" style="--blank-width:6ch"></span> עליו.</li>
</ul>
</section>
`,
});
