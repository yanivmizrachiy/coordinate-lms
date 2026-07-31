/* הנקודה החשודה — several clues; exactly one candidate point satisfies all of
   them. Find it in each round to reveal a letter. Clues carry predicates so the
   test suite can prove each round has a unique solution. */
import type { GameDefinition } from './types';
import { renderCoordinateGrid, type GridPoint } from '../lib/coordinateGrid';
import { elem, clear } from '../lib/dom';

export interface Candidate { label: string; x: number; y: number; }
export interface Clue { text: string; test: (p: Candidate) => boolean; }
export interface SuspectRound { candidates: Candidate[]; clues: Clue[]; token: string; }

export const suspectRounds: SuspectRound[] = [
  {
    token: 'א',
    candidates: [ { label: 'A', x: 2, y: 3 }, { label: 'B', x: 5, y: 3 }, { label: 'C', x: 5, y: 1 }, { label: 'D', x: 2, y: 1 } ],
    clues: [
      { text: 'שיעור x שווה ל־5', test: (p) => p.x === 5 },
      { text: 'שיעור y גדול מ־2', test: (p) => p.y > 2 },
    ],
  },
  {
    token: 'מ',
    candidates: [ { label: 'P', x: 1, y: 4 }, { label: 'Q', x: 4, y: 4 }, { label: 'R', x: 4, y: 2 }, { label: 'S', x: 6, y: 5 } ],
    clues: [
      { text: 'הנקודה ממוקמת על אותו קו אנכי כמו (4,0) — כלומר שיעור x שווה 4', test: (p) => p.x === 4 },
      { text: 'שיעור y קטן מ־3', test: (p) => p.y < 3 },
    ],
  },
  {
    token: 'ת',
    candidates: [ { label: 'K', x: 3, y: 5 }, { label: 'L', x: 7, y: 2 }, { label: 'M', x: 3, y: 2 }, { label: 'N', x: 7, y: 5 } ],
    clues: [
      { text: 'שיעור x שווה ל־7', test: (p) => p.x === 7 },
      { text: 'שיעור y שווה ל־2', test: (p) => p.y === 2 },
    ],
  },
];

/** The candidates satisfying every clue (must be exactly one per round). */
export function suspectsOf(round: SuspectRound): Candidate[] {
  return round.candidates.filter((c) => round.clues.every((clue) => clue.test(c)));
}

export const suspectSolution = suspectRounds.map((r) => r.token).join('');

export const suspectPointGame: GameDefinition = {
  id: 'suspect-point',
  title: 'הנקודה החשודה',
  icon: '🔎',
  short: 'לפי כמה רמזים מוצאים את הנקודה היחידה המתאימה.',
  skill: 'ניתוח שיעורים, אי-שוויונים וקווים',
  mount(root) {
    const solved = new Array<boolean>(suspectRounds.length).fill(false);
    const wrap = elem('div', { class: 'game' });
    wrap.append(elem('div', { class: 'game__intro' },
      elem('h2', { text: 'איזו נקודה אינה מתאימה?' }),
      elem('p', { text: 'בכל סיבוב יש כמה רמזים. רק נקודה אחת מתאימה לכל הרמזים יחד. בחרו אותה כדי לחשוף אות.' }),
    ));

    const slots = suspectRounds.map(() => elem('div', { class: 'word-slot' }, ''));
    const slotRow = elem('div', { class: 'game__row no-print' }, elem('span', { class: 'game__prompt', text: 'המילה:' }));
    const slotWrap = elem('div', { class: 'word-slots' });
    slots.forEach((s) => slotWrap.append(s));
    slotRow.append(slotWrap);
    wrap.append(slotRow);

    const finalMsg = elem('div', { class: 'reveal reveal--pending no-print', text: 'מצאו את כל הנקודות החשודות כדי לגלות את המילה.' });
    const board = elem('div', { class: 'game__board' });
    suspectRounds.forEach((round, i) => board.append(renderRound(round, i, (ok) => {
      solved[i] = ok;
      if (ok && slots[i]) { slots[i]!.textContent = round.token; slots[i]!.classList.add('is-filled'); }
      if (solved.every(Boolean)) { finalMsg.className = 'reveal'; finalMsg.textContent = `המילה: ${suspectSolution}`; }
    })));
    wrap.append(board, finalMsg);

    clear(root);
    root.append(wrap);
    return () => clear(root);
  },
};

function renderRound(round: SuspectRound, index: number, onResult: (ok: boolean) => void): HTMLElement {
  const answer = suspectsOf(round)[0]!;
  const card = elem('div', { class: 'game__row' });
  const body = elem('div', { style: 'flex:1 1 auto;min-width:0' });
  body.append(elem('p', { class: 'game__prompt', text: `סיבוב ${index + 1}: מי הנקודה החשודה?` }));

  const clueList = elem('ul', { class: 'game__hintlist' });
  round.clues.forEach((c) => clueList.append(elem('li', { text: c.text })));
  body.append(clueList);

  const gridPoints: GridPoint[] = round.candidates.map((p) => ({ x: p.x, y: p.y, label: p.label }));
  const holder = elem('div', { class: 'coordinate-grid grid-sm', style: 'max-width:360px' });
  holder.append(renderCoordinateGrid({ points: gridPoints, ariaLabel: `נקודות חשודות בסיבוב ${index + 1}` }));
  body.append(holder);

  const feedback = elem('span', { class: 'game__prompt' });
  const chipRow = elem('div', { class: 'choice-row' });
  const chips = round.candidates.map((p) => {
    const chip = elem('button', { class: 'chip-choice', type: 'button', 'aria-pressed': 'false', text: `${p.label} (${p.x},${p.y})` });
    chip.addEventListener('click', () => {
      const ok = p.label === answer.label;
      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      chip.classList.toggle('is-correct', ok);
      chip.classList.toggle('is-wrong', !ok);
      feedback.textContent = ok ? '✓ נכון' : '✗ נסו שוב';
      onResult(ok);
    });
    return chip;
  });
  chips.forEach((c) => chipRow.append(c));
  body.append(chipRow, elem('div', { class: 'choice-row' }, feedback));
  card.append(body);
  return card;
}
