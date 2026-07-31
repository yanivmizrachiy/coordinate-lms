import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const MISSING_COORD_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "משלימים שיעור חסר ודפוסים",
  subtitle: "לפי תיאור מילולי או חוקיות",
  content: `
<section class="q-card">
<h3>א. השלימו את השיעור החסר.</h3>
<div class="cols-2 task-grid">
<div><span class="pair math-ltr" dir="ltr">A(5,<span class="pair-blank"></span>)</span> על ציר x
</div>
<div><span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,4)</span> על ציר y
</div>
<div><span class="pair math-ltr" dir="ltr">C(3,<span class="pair-blank"></span>)</span> - שני השיעורים זהים
</div>
<div><span class="pair math-ltr" dir="ltr">D(<span class="pair-blank"></span>,6)</span> - שיעור y גדול פי 2 משיעור x
</div>
<div><span class="pair math-ltr" dir="ltr">E(2,<span class="pair-blank"></span>)</span> - שיעור y גדול ב־3 משיעור x
</div>
<div><span class="pair math-ltr" dir="ltr">F(<span class="pair-blank"></span>,3)</span> - שיעור x גדול ב־4 משיעור y
</div>
</div>
</section>
<section class="q-card">
<h3>ב. מי אני? כתבו את הזוג הסדור.</h3>
<ul class="tasks compact">
<li>על ציר x ושיעור x שלי 6: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,0)</span></li>
<li>על ציר y ושיעור y שלי 5: <span class="pair math-ltr" dir="ltr">(0,<span class="pair-blank"></span>)</span></li>
<li>שני שיעוריי 4: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>3 מימין לציר y ו־2 מעל ציר x: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>x כמו של <span class="math-ltr" dir="ltr">(5,1)</span> ו־y כמו של <span class="math-ltr" dir="ltr">(2,4)</span>: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
</ul>
</section>
<section class="q-card">
<h3>ג. דפוס: (2,1), (4,2), (6,3), (8,4).</h3>
<div class="cols-2 task-grid">
<div>מה משתנה בשיעור x? <span class="blank" style="--blank-width:8ch"></span>
</div>
<div>מה משתנה בשיעור y? <span class="blank" style="--blank-width:8ch"></span>
</div>
<div>מה הקשר בין שיעור x לשיעור y? <span class="blank" style="--blank-width:10ch"></span>
</div>
<div>האם <span class="math-ltr" dir="ltr">(6,4)</span> מתאים? <span class="blank" style="--blank-width:5ch"></span>
</div>
</div>
<p>כתבו כלל במילים:</p>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
<section class="q-card">
<h3>ד. דפוס: (1,3), (2,4), (3,5), (4,6).</h3>
<ul class="tasks compact">
<li>שיעור y גדול ב־<span class="blank" style="--blank-width:3ch"></span> משיעור x.</li>
<li>האם <span class="math-ltr" dir="ltr">(5,5)</span> מתאים? <span class="blank" style="--blank-width:5ch"></span></li>
</ul>
</section>
<section class="q-card">
<h3>ה. „מעל ציר <span class="math-ltr" dir="ltr">x</span> ומימין לציר <span class="math-ltr" dir="ltr">y</span>” — כמה נקודות מתאימות?</h3>
<ul class="tasks compact">
<li>התיאור הזה מתאים ל<span class="blank" data-missing="relation" style="--blank-width:6ch"></span> נקודות, ולא לנקודה אחת.</li>
<li>שתי נקודות שמתאימות לו: <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span> ו־<span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>
<li>כדי לקבוע נקודה **אחת** צריך לדעת גם את ערך ה־<span class="math-ltr" dir="ltr">x</span> וגם את שיעור ה־<span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
</ul>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
`,
});
