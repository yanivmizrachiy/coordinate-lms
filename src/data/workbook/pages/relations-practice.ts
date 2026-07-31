import type { WorkbookPageContent } from '../types';
import { sheet } from '../authoring';

export const RELATIONS_PRACTICE: WorkbookPageContent = sheet({
  sectionClass: "sheet practice",
  title: "יחסים בין שיעורים",
  subtitle: "גדול ב־, קטן ב־, גדול פי ומחצית",
  content: `
<div class="two-col">
<section class="q-card">
<h3>גדול ב־ וקטן ב־</h3>
<ul class="tasks">
<li>הנקודה <span class="math-ltr" dir="ltr">A(2,3)</span>. לנקודה <span class="math-ltr" dir="ltr">B</span> אותו שיעור <span class="math-ltr" dir="ltr">y</span>, ושיעור <span class="math-ltr" dir="ltr">x</span> גדול ב־4. כתבו <span class="math-ltr" dir="ltr">B</span>: <span class="blank" style="--blank-width:10ch"></span></li>
<li>הנקודה <span class="math-ltr" dir="ltr">C(7,5)</span>. לנקודה <span class="math-ltr" dir="ltr">D</span> אותו שיעור <span class="math-ltr" dir="ltr">x</span>, ושיעור <span class="math-ltr" dir="ltr">y</span> קטן ב־3. כתבו <span class="math-ltr" dir="ltr">D</span>: <span class="blank" style="--blank-width:10ch"></span></li>
<li>הנקודה <span class="math-ltr" dir="ltr">E(6,2)</span>. שיעור <span class="math-ltr" dir="ltr">x</span> של <span class="math-ltr" dir="ltr">F</span> קטן ב־5, ושיעור <span class="math-ltr" dir="ltr">y</span> זהה. <span class="blank" style="--blank-width:10ch"></span></li>
</ul>
</section>
<section class="q-card">
<h3>גדול פי ומחצית</h3>
<div class="note-box"><b>דיוק:</b> במקום “קטן פי 2” נכתוב “מחצית ממנו”.
</div>
<ul class="tasks">
<li>הנקודה <span class="math-ltr" dir="ltr">P(2,3)</span>. שיעור <span class="math-ltr" dir="ltr">x</span> של <span class="math-ltr" dir="ltr">Q</span> גדול פי 3, ושיעור <span class="math-ltr" dir="ltr">y</span> זהה. <span class="blank" style="--blank-width:10ch"></span></li>
<li>הנקודה <span class="math-ltr" dir="ltr">R(8,4)</span>. שיעור <span class="math-ltr" dir="ltr">x</span> של <span class="math-ltr" dir="ltr">S</span> הוא מחצית ממנו, ושיעור <span class="math-ltr" dir="ltr">y</span> זהה. <span class="blank" style="--blank-width:10ch"></span></li>
<li>הנקודה <span class="math-ltr" dir="ltr">T(4,2)</span>. שיעור <span class="math-ltr" dir="ltr">y</span> של <span class="math-ltr" dir="ltr">U</span> גדול פי 3, ושיעור <span class="math-ltr" dir="ltr">x</span> זהה. <span class="blank" style="--blank-width:10ch"></span></li>
</ul>
</section>
<section class="q-card span-2">
<h3>טבלת יחסים</h3>
<table class="work-table center">
<thead>
<tr><th>נקודת התחלה</th><th>הקשר</th><th>נקודה חדשה</th></tr>
</thead>
<tbody>
<tr><td><span class="math-ltr" dir="ltr">(1,5)</span></td><td><span class="math-ltr" dir="ltr">x</span> גדול ב־6; <span class="math-ltr" dir="ltr">y</span> זהה</td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">(6,1)</span></td><td><span class="math-ltr" dir="ltr">x</span> מחצית; <span class="math-ltr" dir="ltr">y</span> גדול פי 4</td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">(3,2)</span></td><td><span class="math-ltr" dir="ltr">x</span> גדול פי 2; <span class="math-ltr" dir="ltr">y</span> גדול ב־3</td><td></td></tr>
<tr><td><span class="math-ltr" dir="ltr">(8,6)</span></td><td><span class="math-ltr" dir="ltr">x</span> קטן ב־3; <span class="math-ltr" dir="ltr">y</span> מחצית</td><td></td></tr>
</tbody>
</table>
</section>
<section class="q-card span-2">
<h3>שאלה נוספת</h3>
<p>נקודה חדשה מתקבלת מ־<span class="math-ltr" dir="ltr">(2,2)</span> כך ששיעור <span class="math-ltr" dir="ltr">x</span> גדול פי 3 ושיעור <span class="math-ltr" dir="ltr">y</span> גדול ב־3.</p>
<ul class="tasks compact">
<li>מהם השיעורים החדשים? <span class="blank" style="--blank-width:10ch"></span></li>
<li>האם הנקודה החדשה מקיימת <span class="math-ltr" dir="ltr">x=y</span>? <span class="blank" style="--blank-width:8ch"></span></li>
</ul>
</section>
</div>
<section class="q-card">
<h3>ד. סמנו על הסרטוט, וכתבו כל נקודה כזוג סדור.</h3>
<ul class="tasks">
<li>נקודה <span class="math-ltr" dir="ltr">A</span> כבר מסומנת. סמנו נקודה <span class="math-ltr" dir="ltr">B</span> שבה שיעור <span class="math-ltr" dir="ltr">x</span> גדול ב־4 משל <span class="math-ltr" dir="ltr">A</span>, ושיעור <span class="math-ltr" dir="ltr">y</span> זהה: <span class="pair math-ltr" dir="ltr">B(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>סמנו נקודה <span class="math-ltr" dir="ltr">C</span> שבה שיעור <span class="math-ltr" dir="ltr">y</span> גדול פי 2 משל <span class="math-ltr" dir="ltr">A</span>, ושיעור <span class="math-ltr" dir="ltr">x</span> זהה: <span class="pair math-ltr" dir="ltr">C(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span></li>
<li>נקודה <span class="math-ltr" dir="ltr">B</span> ממוקמת <span class="blank" data-missing="direction" style="--blank-width:6ch"></span> לנקודה <span class="math-ltr" dir="ltr">A</span>.</li>
<li>נקודה <span class="math-ltr" dir="ltr">C</span> ממוקמת מעל <span class="math-ltr" dir="ltr">A</span>, כי גדל רק שיעור <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>
</ul>
<div class="coordinate-grid grid-sm" role="img" aria-label="מערכת צירים ובה נקודה A שתיים שלוש" data-points='[{"x":2,"y":3,"label":"A"}]' data-segments='[]' data-polygons='[]' data-arrows='[]' data-labelboxes='[]'></div>
</section>
`,
});
