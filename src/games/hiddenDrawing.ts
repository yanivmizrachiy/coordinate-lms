/* ציור נסתר — follow the plan of ordered pairs, plot each next point, and watch
   the picture appear segment by segment. The finished drawing is not shown in
   advance; it emerges as the learner plots the plan correctly.

   The plan comes in STROKES, the way anyone actually draws: the pencil lifts
   between the hull and the mast, so the picture can be something worth getting
   rather than one closed outline. And because the finished drawing is a real
   figure, it can be asked about — a horizontal keel, a vertical mast and a
   slanted sail are three different answers to „מקביל לאיזה ציר?”. */
import type { GameDefinition } from './types';
import { renderCoordinateGrid, type GridSegment } from '../lib/coordinateGrid';
import { isFirstQuadrant, type Point } from '../lib/coordinateMath';
import { normalizeAnswer } from './revealEngine';
import { elem, clear, fromHTML } from '../lib/dom';

/** The drawing plan, one array per stroke of the pencil. */
export const drawingStrokes: Point[][] = [
  // גוף המפרשית — טרפז שצלעותיו העליונה והתחתונה מקבילות לציר x
  [{ x: 1, y: 2 }, { x: 7, y: 2 }, { x: 6, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
  // התורן והמפרש — קו אנכי, ואז משולש ישר־זווית
  [{ x: 4, y: 2 }, { x: 4, y: 6 }, { x: 7, y: 3 }, { x: 4, y: 3 }],
];

/** Every point in plotting order — what the learner is asked for, one at a time. */
export const drawingPlan: Point[] = drawingStrokes.flat();
export const drawingTitle = 'מפרשית';

export const hiddenDrawingGame: GameDefinition = {
  id: 'hidden-drawing',
  title: 'ציור נסתר',
  icon: '🖼️',
  short: 'מחברים זוגות סדורים לפי התוכנית ומגלים ציור.',
  skill: 'סימון נקודות וחיבור זוגות סדורים',
  mount(root) {
    let solvedTo = 0; // how many points of the plan are confirmed
    const wrap = elem('div', { class: 'game' });
    wrap.append(elem('div', { class: 'game__intro' },
      elem('h2', { text: 'מה מסתתר בציור?' }),
      elem('p', { text: 'לפניכם תוכנית בשני קווים. סמנו כל נקודה לפי הסדר, והקו ייחבר מנקודה לנקודה. בין הקו הראשון לשני מרימים את העיפרון — ובסוף יתגלה הציור.' }),
    ));

    for (const [i, stroke] of drawingStrokes.entries()) {
      const text = stroke.map((p) => `(${p.x},${p.y})`).join('  →  ');
      wrap.append(elem('div', { class: 'game__row' },
        elem('span', { class: 'game__prompt', text: `קו ${i + 1}: ${text}` })));
    }

    const holder = elem('div', { class: 'coordinate-grid grid-lg', style: 'max-width:520px' });
    wrap.append(holder);

    const promptRow = elem('div', { class: 'game__row' });
    wrap.append(promptRow);

    const finalMsg = elem('div', { class: 'reveal reveal--pending no-print', text: 'סמנו את כל הנקודות כדי לגלות את הציור.' });
    wrap.append(finalMsg);

    /* Asked about the drawing they just produced — Yaniv's pattern: what the
       learner made is what the learner is questioned on. Printed as well, so a
       photocopied sheet carries the thinking and not only the plotting. */
    wrap.append(fromHTML(
      '<section class="q-card">' +
      '<h3>אחרי שהציור התגלה — השלימו עליו.</h3>' +
      '<ul class="tasks compact">' +
      '<li>תחתית הגוף, הקטע שבין <span class="math-ltr" dir="ltr">(2,1)</span> ובין <span class="math-ltr" dir="ltr">(6,1)</span>, מקביל לציר <span class="blank" data-missing="letter" style="--blank-width:3ch"></span>.</li>' +
      '<li>התורן מקביל לציר <span class="math-ltr" dir="ltr">y</span>, ואורכו <span class="blank" data-missing="number" style="--blank-width:3ch"></span> יחידות.</li>' +
      '<li>הנקודה הגבוהה ביותר בציור היא <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>.</li>' +
      '<li>קצה המפרש <span class="math-ltr" dir="ltr">(7,3)</span> רחוק מציר <span class="math-ltr" dir="ltr">y</span> <span class="blank" data-missing="number" style="--blank-width:3ch"></span> יחידות.</li>' +
      '<li>הקטע שבין <span class="math-ltr" dir="ltr">(4,6)</span> ובין <span class="math-ltr" dir="ltr">(7,3)</span> אינו מקביל לאף ציר, כי משתנים בו <span class="blank" data-missing="number" style="--blank-width:4ch"></span> השיעורים.</li>' +
      '<li>סמנו על הסרטוט נקודה משלכם שממוקמת בתוך גוף המפרשית, והשלימו את החסר: שיעוריה <span class="pair math-ltr" dir="ltr">(<span class="pair-blank"></span>,<span class="pair-blank"></span>)</span>, והמרחק שלה מציר <span class="math-ltr" dir="ltr">x</span> הוא <span class="blank" data-missing="number" style="--blank-width:3ch"></span> יחידות.</li>' +
      '</ul></section>',
    ));

    const draw = (): void => {
      const segments: GridSegment[] = [];
      const points: Array<{ x: number; y: number; label: string }> = [];
      let seen = 0;
      for (const stroke of drawingStrokes) {
        const done = stroke.slice(0, Math.max(0, Math.min(stroke.length, solvedTo - seen)));
        for (let i = 1; i < done.length; i++) {
          segments.push({ from: [done[i - 1]!.x, done[i - 1]!.y], to: [done[i]!.x, done[i]!.y], type: 'shape' });
        }
        for (const p of done) points.push({ x: p.x, y: p.y, label: '' });
        seen += stroke.length;
      }
      if (points[0]) points[0].label = 'התחלה';
      clear(holder);
      holder.append(renderCoordinateGrid({ points, segments, ariaLabel: 'ציור נסתר מתגלה' }));
    };

    /** Which stroke the next point belongs to, and its place inside it. */
    const place = (n: number): { stroke: number; index: number } => {
      let seen = 0;
      for (const [s, stroke] of drawingStrokes.entries()) {
        if (n < seen + stroke.length) return { stroke: s, index: n - seen };
        seen += stroke.length;
      }
      return { stroke: drawingStrokes.length - 1, index: 0 };
    };

    const renderPrompt = (): void => {
      clear(promptRow);
      if (solvedTo >= drawingPlan.length) {
        finalMsg.className = 'reveal';
        finalMsg.textContent = `✓ הציור שהתגלה: ${drawingTitle}`;
        return;
      }
      const target = drawingPlan[solvedTo]!;
      const { stroke, index } = place(solvedTo);
      const ordinal =
        index === 0
          ? `את נקודת ההתחלה של קו ${stroke + 1}`
          : `את הנקודה ה־${index + 1} בקו ${stroke + 1}`;
      const input = elem('input', { class: 'answer-input', type: 'text', inputmode: 'numeric', placeholder: '(x,y)', 'aria-label': 'הנקודה הבאה' }) as HTMLInputElement;
      const feedback = elem('span', { class: 'game__prompt' });
      const check = elem('button', { class: 'iconbtn iconbtn--primary', type: 'button', text: 'סמנו' });
      const evaluate = (): void => {
        const ok = normalizeAnswer('point', input.value) === `${target.x},${target.y}`;
        if (ok) { solvedTo += 1; draw(); renderPrompt(); }
        else { input.classList.add('is-wrong'); feedback.textContent = '✗ נסו שוב'; }
      };
      check.addEventListener('click', evaluate);
      input.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') evaluate(); });
      promptRow.append(elem('span', { class: 'game__prompt', text: `סמנו ${ordinal}:` }), input, check, feedback);
    };

    draw();
    renderPrompt();

    clear(root);
    root.append(wrap);
    return () => clear(root);
  },
};

/** Exposed for tests: every stroke stays in the first quadrant, the outline that
    encloses the hull closes on itself, and no stroke is a single stray point. */
export function planIsWellFormed(): boolean {
  if (drawingStrokes.length < 2) return false;
  if (!drawingPlan.every(isFirstQuadrant)) return false;
  if (drawingStrokes.some((s) => s.length < 2)) return false;
  const hull = drawingStrokes[0]!;
  const first = hull[0]!;
  const last = hull[hull.length - 1]!;
  return first.x === last.x && first.y === last.y;
}
