import type { WorkbookPageContent } from '../types';
import { sheet, blank, wordBlank, ltr, pair } from '../authoring';

export const ORDERED_PAIR_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "הזוג הסדור",
  subtitle: "מה נכתב מצד שמאל ומה מצד ימין",
  content: `
<div class="rule-box completion-intro">
<div class="completion-sentence">בזוג הסדור ${ltr('(x,y)')} המספר שנכתב מצד ${wordBlank('medium', 'property', 'מקום להשלמת המילה שמאל')} הוא <b>ערך ${ltr('x')}</b>.</div>
<div class="completion-sentence">בזוג הסדור ${ltr('(x,y)')} המספר שנכתב מצד ימין הוא <b>שיעור ${wordBlank('short', 'letter', 'מקום להשלמת האות y')}</b>.</div>
<div class="completion-sentence">לדוגמה: בנקודה שערך ה־${ltr('x')} שלה 4 ושיעור ה־${ltr('y')} שלה 3, הזוג הסדור הוא ${pair()}.</div>
</div>
<section class="q-card">
<h3>א. השלימו את הזוג הסדור.</h3>
<div class="cols-2 task-grid">
<div><span class="math-ltr" dir="ltr">x=2, y=5</span> ← <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="math-ltr" dir="ltr">x=7, y=1</span> ← <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="math-ltr" dir="ltr">x=3, y=6</span> ← <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
<div><span class="math-ltr" dir="ltr">x=5, y=4</span> ← <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>
</div>
</div>
</section>
<section class="q-card">
<h3>ב. השלימו את השיעורים החסרים.</h3>
<div class="cols-2 task-grid">
<div><span class="math-ltr" dir="ltr">A(6,2)</span>: שיעור <span class="math-ltr" dir="ltr">x=</span><span class="blank" style="--blank-width:3ch"></span>, שיעור <span class="math-ltr" dir="ltr">y=</span><span class="blank" style="--blank-width:3ch"></span>
</div>
<div><span class="math-ltr" dir="ltr">B(1,5)</span>: שיעור <span class="math-ltr" dir="ltr">x=</span><span class="blank" style="--blank-width:3ch"></span>, שיעור <span class="math-ltr" dir="ltr">y=</span><span class="blank" style="--blank-width:3ch"></span>
</div>
<div><span class="math-ltr" dir="ltr">C(4,3)</span>: שיעור <span class="math-ltr" dir="ltr">x=</span><span class="blank" style="--blank-width:3ch"></span>, שיעור <span class="math-ltr" dir="ltr">y=</span><span class="blank" style="--blank-width:3ch"></span>
</div>
<div><span class="math-ltr" dir="ltr">D(7,6)</span>: שיעור <span class="math-ltr" dir="ltr">x=</span><span class="blank" style="--blank-width:3ch"></span>, שיעור <span class="math-ltr" dir="ltr">y=</span><span class="blank" style="--blank-width:3ch"></span>
</div>
</div>
</section>
<section class="q-card">
<h3>ג. חברו בקווים בין התיאור לזוג הסדור המתאים.</h3>
<div class="match">
<div><span class="math-ltr" dir="ltr">x=5, y=2</span><br><span class="math-ltr" dir="ltr">x=2, y=5</span><br><span class="math-ltr" dir="ltr">x=4, y=4</span>
</div>
<div><span class="math-ltr" dir="ltr">(4,4)</span><br><span class="math-ltr" dir="ltr">(2,5)</span><br><span class="math-ltr" dir="ltr">(5,2)</span>
</div>
</div>
</section>
<section class="q-card">
<h3>ד. מצאו ותקנו את הטעות.</h3>
<p>נועם התבקש לכתוב את הנקודה שבה ערך <span class="math-ltr" dir="ltr">x</span> הוא 3 ושיעור <span class="math-ltr" dir="ltr">y</span> הוא 5, והוא כתב <span class="math-ltr" dir="ltr">(5,3)</span>.</p>
<ul class="tasks">
<li>נועם החליף בין ערך <span class="math-ltr" dir="ltr">x</span> לבין <span class="blank" data-missing="concept" style="--blank-width:8ch"></span> <span class="math-ltr" dir="ltr">y</span>.</li>
<li>הזוג הסדור הנכון הוא <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>הנקודה שנועם כתב ממוקמת <span class="blank" data-missing="direction" style="--blank-width:6ch"></span> לנקודה הנכונה.</li>
</ul>
</section>
<section class="q-card">
<h3>ה. השלימו — למה הסדר קובע.</h3>
<ul class="tasks">
<li>אם מחליפים בין שני המספרים, מקבלים נקודה <span class="blank" data-missing="relation" style="--blank-width:5ch"></span>.</li>
<li>המספר שמצד שמאל אומר כמה זזים ${blank(6, 'direction')}.</li>
<li>המספר שמצד ימין הוא שיעור ${blank(3, 'letter')}, והוא אומר כמה זזים למעלה.</li>
<li>לכן שני מספרים באותו סדר מתארים תמיד <span class="blank" data-missing="number" style="--blank-width:5ch"></span> נקודה.</li>
</ul>
</section>
`,
});
