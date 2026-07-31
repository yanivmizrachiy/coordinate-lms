import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const RELATIONS_INTRO: WorkbookPageContent = sheet({
  sectionClass: "sheet guided",
  title: "גדול ב־, קטן ב־ וגדול פי",
  subtitle: "קשרים בין שיעור x לשיעור y",
  content: `
<div class="rule-box"><b>גדול ב־2</b> - מוסיפים 2. <b>גדול פי 2</b> - כופלים ב־2.
</div>
<section class="q-card">
<h3>א. הקיפו את הנקודה שבה y גדול ב־2 מ־x.</h3>
<div class="choice-row"><span class="choice"><span class="math-ltr" dir="ltr">(2,4)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(3,4)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(5,2)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(4,4)</span></span>
</div>
</section>
<section class="q-card">
<h3>ב. הקיפו את הנקודה שבה x גדול ב־3 מ־y.</h3>
<div class="choice-row"><span class="choice"><span class="math-ltr" dir="ltr">(5,2)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(3,5)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(4,2)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(6,4)</span></span>
</div>
</section>
<section class="q-card">
<h3>ג. הקיפו את כל הנקודות שבהן y קטן ב־2 מ־x.</h3>
<div class="choice-row"><span class="choice"><span class="math-ltr" dir="ltr">(4,2)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(6,4)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(3,1)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(2,4)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(5,5)</span></span>
</div>
</section>
<section class="q-card">
<h3>ד. הקיפו את כל הנקודות שבהן y גדול פי 2 מ־x.</h3>
<div class="choice-row"><span class="choice"><span class="math-ltr" dir="ltr">(1,2)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(2,4)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(3,5)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(3,6)</span></span><span class="choice"><span class="math-ltr" dir="ltr">(4,6)</span></span>
</div>
</section>
<section class="q-card">
<h3>ה. השלימו.</h3>
<div class="cols-2 task-grid">
<div><span class="pair math-ltr" dir="ltr">A(3,<span class="pair-blank"></span>)</span> - y גדול ב־2 מ־x
</div>
<div><span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,6)</span> - y גדול פי 2 מ־x
</div>
<div><span class="pair math-ltr" dir="ltr">C(7,<span class="pair-blank"></span>)</span> - x גדול ב־4 מ־y
</div>
<div><span class="pair math-ltr" dir="ltr">D(8,<span class="pair-blank"></span>)</span> - y הוא מחצית x
</div>
</div>
</section>
<section class="q-card">
<h3>ו. בנקודה <span class="math-ltr" dir="ltr">(2,4)</span>, y גם גדול ב־2 וגם גדול פי 2 מ־x. האם זה קורה תמיד?</h3>
<ul class="tasks compact">
<li>ההסבר: <span class="blank" data-missing="relation" style="--blank-width:24ch"></span>.</li>
</ul>
</section>
`,
});
