/* ===========================================================================
   revealEngine — the shared machinery for "answer questions → reveal a hidden
   result" games (secret word, coordinate safe, encrypted route). Answer
   checking is pure and exported so tests can prove every puzzle is solvable and
   that the correct answers assemble exactly the intended word/code.
   =========================================================================== */
import type { GameDefinition, RevealPuzzle, RevealStep } from './types';
import { renderCoordinateGrid } from '../lib/coordinateGrid';
import { elem, clear } from '../lib/dom';

/** Canonicalise a learner answer for comparison. */
export function normalizeAnswer(kind: RevealStep['kind'], raw: string): string {
  const s = raw.trim();
  if (kind === 'point') {
    // Accept "(5,3)", "5,3", "5 3", "5 , 3" → "5,3"
    const nums = s.match(/-?\d+/g);
    if (!nums || nums.length < 2) return s.replace(/\s+/g, '');
    return `${nums[0]},${nums[1]}`;
  }
  // text / choice: collapse whitespace, drop surrounding punctuation
  return s.replace(/\s+/g, ' ').replace(/[.,;]+$/, '').trim();
}

/** Is a learner answer correct for this step? */
export function isStepCorrect(step: RevealStep, raw: string): boolean {
  const got = normalizeAnswer(step.kind, raw);
  const candidates = [step.answer, ...(step.accept ?? [])].map((a) => normalizeAnswer(step.kind, a));
  return candidates.includes(got);
}

/** The assembled reveal (word / code) for a fully-solved puzzle. */
export function solutionOf(puzzle: RevealPuzzle): string {
  return puzzle.steps.map((s) => s.token).join('');
}

/* ---- UI ---------------------------------------------------------------- */

export function createRevealGame(puzzle: RevealPuzzle): GameDefinition {
  return {
    id: puzzle.id,
    title: puzzle.title,
    icon: puzzle.icon,
    short: puzzle.short,
    skill: puzzle.skill,
    mount: (root) => mountReveal(root, puzzle),
  };
}

function mountReveal(root: HTMLElement, puzzle: RevealPuzzle): () => void {
  const solved = new Array<boolean>(puzzle.steps.length).fill(false);
  const solution = solutionOf(puzzle);

  const wrap = elem('div', { class: 'game' });

  wrap.append(
    elem('div', { class: 'game__intro' },
      elem('h2', { text: puzzle.question }),
      elem('p', { text: puzzle.intro }),
    ),
  );

  // Reveal slots
  const slotsRow = elem('div', { class: 'game__row no-print' });
  slotsRow.append(elem('span', { class: 'game__prompt', text: puzzle.revealLabel + ':' }));
  const slots = elem('div', { class: 'word-slots' });
  const slotEls = puzzle.steps.map(() => elem('div', { class: 'word-slot' }, ''));
  slotEls.forEach((s) => slots.append(s));
  slotsRow.append(slots);
  wrap.append(slotsRow);

  const board = elem('div', { class: 'game__board' });
  wrap.append(board);

  const finalMsg = elem('div', { class: 'reveal reveal--pending no-print', text: 'פתרו את כל המשימות כדי לגלות את התשובה.' });

  function refreshReveal(): void {
    puzzle.steps.forEach((step, i) => {
      const slot = slotEls[i];
      if (!slot) return;
      if (solved[i]) {
        slot.textContent = step.token;
        slot.classList.add('is-filled');
      }
    });
    if (solved.every(Boolean)) {
      finalMsg.className = 'reveal';
      finalMsg.textContent = `${puzzle.revealLabel}: ${solution}`;
    }
  }

  puzzle.steps.forEach((step, i) => {
    board.append(renderStep(step, i, (correct) => {
      solved[i] = correct;
      refreshReveal();
    }));
  });

  wrap.append(finalMsg);
  clear(root);
  root.append(wrap);

  return () => clear(root);
}

function renderStep(step: RevealStep, index: number, onResult: (correct: boolean) => void): HTMLElement {
  const card = elem('div', { class: 'game__row' });
  const body = elem('div', { style: 'flex:1 1 auto; min-width:0' });
  body.append(elem('p', { class: 'game__prompt', text: `${index + 1}. ${step.prompt}` }));

  if (step.grid) {
    const holder = elem('div', { class: 'coordinate-grid grid-sm', style: 'max-width:360px' });
    holder.append(renderCoordinateGrid(step.grid));
    body.append(holder);
  }

  const feedback = elem('span', { class: 'game__prompt', style: 'margin-inline-start:8px' });

  if (step.kind === 'choice' && step.choices) {
    const row = elem('div', { class: 'choice-row' });
    const chips = step.choices.map((choice) => {
      const chip = elem('button', { class: 'chip-choice', type: 'button', 'aria-pressed': 'false', text: choice });
      chip.addEventListener('click', () => {
        const correct = normalizeAnswerEquals(step, choice);
        chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
        chip.setAttribute('aria-pressed', 'true');
        chip.classList.toggle('is-correct', correct);
        chip.classList.toggle('is-wrong', !correct);
        feedback.textContent = correct ? '✓ נכון' : '✗ נסו שוב';
        onResult(correct);
      });
      return chip;
    });
    chips.forEach((c) => row.append(c));
    body.append(row);
  } else {
    const input = elem('input', {
      class: 'answer-input',
      type: 'text',
      inputmode: step.kind === 'point' ? 'numeric' : 'text',
      placeholder: step.kind === 'point' ? '(x,y)' : '',
      'aria-label': step.prompt,
    }) as HTMLInputElement;
    const check = elem('button', { class: 'iconbtn iconbtn--primary', type: 'button', text: 'בדקו' });
    const evaluate = (): void => {
      const correct = isStepCorrect(step, input.value);
      input.classList.toggle('is-correct', correct);
      input.classList.toggle('is-wrong', !correct && input.value.trim() !== '');
      feedback.textContent = input.value.trim() === '' ? '' : correct ? '✓ נכון' : '✗ נסו שוב';
      onResult(correct);
    };
    check.addEventListener('click', evaluate);
    input.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') evaluate(); });
    const row = elem('div', { class: 'choice-row' }, input, check, feedback);
    body.append(row);
  }

  card.append(body);
  return card;
}

function normalizeAnswerEquals(step: RevealStep, choice: string): boolean {
  return isStepCorrect(step, choice);
}
