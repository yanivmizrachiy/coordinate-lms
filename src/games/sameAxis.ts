/* אותו x או אותו y — pick every point that shares a vertical line (same x) or a
   horizontal line (same y) with the target. Each correct round reveals a letter;
   together they spell a word. */
import type { GameDefinition } from './types';
import { renderCoordinateGrid, type GridPoint } from '../lib/coordinateGrid';
import { sameX, sameY } from '../lib/coordinateMath';
import { elem, clear } from '../lib/dom';

export interface SameAxisRound {
  points: { label: string; x: number; y: number }[];
  targetLabel: string;
  /** 'x' → same x (vertical line); 'y' → same y (horizontal line). */
  axis: 'x' | 'y';
  token: string;
}

export const sameAxisRounds: SameAxisRound[] = [
  {
    axis: 'x', token: 'י', targetLabel: 'A',
    points: [
      { label: 'A', x: 3, y: 1 }, { label: 'B', x: 3, y: 4 }, { label: 'C', x: 6, y: 2 },
      { label: 'D', x: 3, y: 5 }, { label: 'E', x: 5, y: 4 },
    ],
  },
  {
    axis: 'y', token: 'ש', targetLabel: 'M',
    points: [
      { label: 'M', x: 2, y: 2 }, { label: 'N', x: 5, y: 2 }, { label: 'P', x: 2, y: 5 },
      { label: 'Q', x: 7, y: 2 }, { label: 'R', x: 4, y: 6 },
    ],
  },
  {
    axis: 'x', token: 'ר', targetLabel: 'K',
    points: [
      { label: 'K', x: 6, y: 1 }, { label: 'L', x: 6, y: 3 }, { label: 'S', x: 1, y: 4 },
      { label: 'T', x: 6, y: 5 }, { label: 'U', x: 3, y: 3 },
    ],
  },
];

/** The set of labels the learner must select for a round (excludes the target). */
export function correctSelection(round: SameAxisRound): string[] {
  const target = round.points.find((p) => p.label === round.targetLabel)!;
  return round.points
    .filter((p) => p.label !== round.targetLabel && (round.axis === 'x' ? sameX(p, target) : sameY(p, target)))
    .map((p) => p.label)
    .sort();
}

export const sameAxisSolution = sameAxisRounds.map((r) => r.token).join('');

export const sameAxisGame: GameDefinition = {
  id: 'same-axis',
  title: 'אותו x או אותו y',
  icon: '📏',
  short: 'מזהים נקודות על אותו קו אנכי או אופקי ומגלים מילה.',
  skill: 'שיעורים זהים וקווים מקבילים לצירים',
  mount(root) {
    const solved = new Array<boolean>(sameAxisRounds.length).fill(false);
    const wrap = elem('div', { class: 'game' });
    wrap.append(elem('div', { class: 'game__intro' },
      elem('h2', { text: 'אילו נקודות חולקות שיעור?' }),
      elem('p', { text: 'בכל שרטוט בחרו את כל הנקודות שממוקמות על אותו קו כמו הנקודה המסומנת. אותו שיעור x — קו אנכי; אותו שיעור y — קו אופקי. כל תשובה נכונה חושפת אות.' }),
    ));

    const slots = sameAxisRounds.map(() => elem('div', { class: 'word-slot' }, ''));
    const slotRow = elem('div', { class: 'game__row no-print' }, elem('span', { class: 'game__prompt', text: 'המילה:' }));
    const slotWrap = elem('div', { class: 'word-slots' });
    slots.forEach((s) => slotWrap.append(s));
    slotRow.append(slotWrap);
    wrap.append(slotRow);

    const finalMsg = elem('div', { class: 'reveal reveal--pending no-print', text: 'פתרו את כל הסיבובים כדי לגלות את המילה.' });

    const board = elem('div', { class: 'game__board' });
    sameAxisRounds.forEach((round, i) => board.append(renderRound(round, i, (ok) => {
      solved[i] = ok;
      if (ok && slots[i]) { slots[i]!.textContent = round.token; slots[i]!.classList.add('is-filled'); }
      if (solved.every(Boolean)) { finalMsg.className = 'reveal'; finalMsg.textContent = `המילה: ${sameAxisSolution}`; }
    })));
    wrap.append(board, finalMsg);

    clear(root);
    root.append(wrap);
    return () => clear(root);
  },
};

function renderRound(round: SameAxisRound, index: number, onResult: (ok: boolean) => void): HTMLElement {
  const target = round.points.find((p) => p.label === round.targetLabel)!;
  const correct = correctSelection(round);
  const selected = new Set<string>();

  const card = elem('div', { class: 'game__row' });
  const body = elem('div', { style: 'flex:1 1 auto;min-width:0' });
  const axisText = round.axis === 'x'
    ? `אותו שיעור x כמו הנקודה ${round.targetLabel} (קו אנכי)`
    : `אותו שיעור y כמו הנקודה ${round.targetLabel} (קו אופקי)`;
  body.append(elem('p', { class: 'game__prompt', text: `${index + 1}. בחרו את הנקודות שממוקמות על ${axisText}.` }));

  const gridPoints: GridPoint[] = round.points.map((p) => ({
    x: p.x, y: p.y, label: p.label, color: p.label === round.targetLabel ? '#dc2626' : '#1d4ed8',
  }));
  const holder = elem('div', { class: 'coordinate-grid grid-sm', style: 'max-width:360px' });
  holder.append(renderCoordinateGrid({ points: gridPoints, ariaLabel: `נקודות עבור סיבוב ${index + 1}` }));
  body.append(holder);

  const chipRow = elem('div', { class: 'choice-row' });
  const chips = round.points.filter((p) => p.label !== round.targetLabel).map((p) => {
    const chip = elem('button', { class: 'chip-choice', type: 'button', 'aria-pressed': 'false', text: `${p.label} (${p.x},${p.y})` });
    chip.addEventListener('click', () => {
      if (selected.has(p.label)) { selected.delete(p.label); chip.setAttribute('aria-pressed', 'false'); }
      else { selected.add(p.label); chip.setAttribute('aria-pressed', 'true'); }
    });
    return chip;
  });
  chips.forEach((c) => chipRow.append(c));
  body.append(chipRow);

  const feedback = elem('span', { class: 'game__prompt' });
  const check = elem('button', { class: 'iconbtn iconbtn--primary', type: 'button', text: 'בדקו' });
  check.addEventListener('click', () => {
    const chosen = [...selected].sort();
    const ok = chosen.length === correct.length && chosen.every((l, i) => l === correct[i]);
    feedback.textContent = ok ? '✓ נכון' : '✗ נסו שוב';
    chips.forEach((chip) => {
      const label = chip.textContent!.slice(0, chip.textContent!.indexOf(' '));
      chip.classList.toggle('is-correct', ok && selected.has(label));
      chip.classList.toggle('is-wrong', !ok && selected.has(label) && !correct.includes(label));
    });
    onResult(ok);
  });
  void target;
  body.append(elem('div', { class: 'choice-row' }, check, feedback));
  card.append(body);
  return card;
}
