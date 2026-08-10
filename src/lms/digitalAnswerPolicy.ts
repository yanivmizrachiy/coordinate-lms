import { answersMatch } from './answerValidation';

const TARGET_SELECTOR = '.blank, .word-blank, .pair-blank';

type AnswerSlot = readonly string[];
type ValidSequence = readonly AnswerSlot[];

function targetsIn(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTOR));
}

function pageNumber(root: ParentNode): number | null {
  const sheet = root.querySelector<HTMLElement>('.sheet[id^="page-"]');
  const match = sheet?.id.match(/^page-(\d+)$/);
  return match?.[1] ? Number(match[1]) : null;
}

function targetAt(targets: HTMLElement[], oneBasedIndex: number): HTMLElement | null {
  return targets[oneBasedIndex - 1] || null;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function setAnswers(target: HTMLElement | null, answers: readonly string[]): void {
  if (!target || answers.length === 0) return;
  target.dataset['lmsAnswers'] = JSON.stringify(unique(answers));
}

function textValue(target: HTMLElement): string {
  return (target.textContent || '').trim();
}

function bindSequenceGroup(
  targets: HTMLElement[],
  positions: readonly number[],
  sequences: readonly ValidSequence[],
): void {
  const group = positions.map((position) => targetAt(targets, position));
  if (group.some((target) => !target) || sequences.length === 0) return;

  const concrete = group as HTMLElement[];
  if (sequences.some((sequence) => sequence.length !== concrete.length)) return;

  const refresh = (): void => {
    const current = concrete.map(textValue);

    concrete.forEach((target, index) => {
      const compatible = sequences.filter((sequence) =>
        current.every((value, otherIndex) =>
          otherIndex === index ||
          value === '' ||
          answersMatch(value, sequence[otherIndex] || []),
        ),
      );

      const allowed = unique(
        compatible.flatMap((sequence) => sequence[index] || []),
      );

      // If the already-entered values cannot belong to any valid complete
      // arrangement, deliberately expose an impossible answer. This makes the
      // current entry fail instead of accidentally accepting a duplicate.
      setAnswers(target, allowed.length > 0 ? allowed : ['__invalid_sequence__']);
    });
  };

  for (const target of concrete) {
    target.addEventListener('input', refresh);
  }
  refresh();
}

function permutations<T>(items: readonly T[]): T[][] {
  if (items.length <= 1) return [Array.from(items)];
  return items.flatMap((item, index) =>
    permutations(items.filter((_, candidateIndex) => candidateIndex !== index))
      .map((rest) => [item, ...rest]),
  );
}

function pairPermutations(
  first: readonly [AnswerSlot, AnswerSlot],
  second: readonly [AnswerSlot, AnswerSlot],
): ValidSequence[] {
  const pairOrders = [
    [first, second] as const,
    [second, first] as const,
  ];

  return pairOrders.flatMap(([left, right]) => [
    [left[0], left[1], right[0], right[1]],
    [left[1], left[0], right[0], right[1]],
    [left[0], left[1], right[1], right[0]],
    [left[1], left[0], right[1], right[0]],
  ]);
}

function letter(value: string): AnswerSlot {
  return [value.toUpperCase(), value.toLowerCase()];
}

function coordinate(x: number, y: number): AnswerSlot {
  return [
    `(${x},${y})`,
    `${x},${y}`,
    `${x} ${y}`,
    `${x};${y}`,
  ];
}

function replaceSingleBlankPrompt(
  target: HTMLElement | null,
  before: string,
  after = '',
): void {
  if (!target) return;
  const container = target.closest('li, p');
  if (!container) return;

  container.replaceChildren(
    document.createTextNode(before),
    target,
    document.createTextNode(after),
  );
}

/**
 * Digital-only adaptations for questions whose printed wording is either
 * order-dependent or unsuitable for deterministic immediate grading.
 *
 * This function mutates only the rendered DOM. It never changes the canonical
 * workbook HTML, so the printable workbook remains byte-for-byte untouched.
 * It is also invoked by the answer-coverage generator, keeping the live checker
 * and the generated evidence on the same digital contract.
 */
export function applyDigitalAnswerPolicy(root: ParentNode): void {
  const page = pageNumber(root);
  if (!page) return;

  const sheet = root.querySelector<HTMLElement>('.sheet[id^="page-"]');
  if (!sheet || sheet.dataset['digitalAnswerPolicy'] === 'ready') return;
  sheet.dataset['digitalAnswerPolicy'] = 'ready';

  const targets = targetsIn(root);

  switch (page) {
    case 14:
      // O lies on both axes. Either x,y or y,x order is mathematically valid.
      bindSequenceGroup(targets, [9, 10], [
        [['x', 'X', 'ציר x'], ['y', 'Y', 'ציר y']],
        [['y', 'Y', 'ציר y'], ['x', 'X', 'ציר x']],
      ]);
      break;

    case 17:
      // Same weight: B/C and D/E. Accept either pair first and either order
      // inside each pair, while rejecting duplicates and mixed invalid pairs.
      bindSequenceGroup(
        targets,
        [11, 12, 13, 14],
        pairPermutations([letter('B'), letter('C')], [letter('D'), letter('E')]),
      );
      // Same price: A/B and D/F, with the same order flexibility.
      bindSequenceGroup(
        targets,
        [15, 16, 17, 18],
        pairPermutations([letter('A'), letter('B')], [letter('D'), letter('F')]),
      );
      break;

    case 18:
      // The source explicitly documents the decoded word and the first letter's
      // coordinate. The final free-form "new word" prompt is replaced only in
      // the digital render by an equivalent coordinate fact with one answer.
      setAnswers(targetAt(targets, 6), ['נקודה']);
      setAnswers(targetAt(targets, 7), ['3']);
      setAnswers(targetAt(targets, 8), ['2']);
      replaceSingleBlankPrompt(
        targetAt(targets, 14),
        'הנקודה החדשה של האות ם נמצאת בשיעור y=6. מה המרחק שלה מציר x? ',
        ' יחידות.',
      );
      setAnswers(targetAt(targets, 14), ['6', 'שש']);
      break;

    case 49:
      // From (3,2), moving four units right gives (7,2).
      setAnswers(targetAt(targets, 9), ['7']);
      setAnswers(targetAt(targets, 10), ['2']);
      break;

    case 51:
      // Replace broad prose prompts in the digital render with two precise
      // consequences of the stated translation: +1 in x and +2 in y.
      replaceSingleBlankPrompt(
        targetAt(targets, 18),
        'בהזזה הזאת ערך x של כל קודקוד גדל ב־',
        '.',
      );
      setAnswers(targetAt(targets, 18), ['1', 'אחת']);
      replaceSingleBlankPrompt(
        targetAt(targets, 19),
        'בהזזה הזאת שיעור y של כל קודקוד גדל ב־',
        '.',
      );
      setAnswers(targetAt(targets, 19), ['2', 'שתיים']);
      break;

    case 53:
      // Opposite vertices are (1,2) and (7,5); the other two are (1,5) and
      // (7,2). Either whole-pair order is valid, but x/y inside a pair is not.
      bindSequenceGroup(targets, [1, 2, 3, 4], [
        [['1'], ['5'], ['7'], ['2']],
        [['7'], ['2'], ['1'], ['5']],
      ]);
      break;

    case 56: {
      // Lower-left (1,2), side 3: the three remaining vertices can be listed
      // in any order. Each coordinate itself must remain ordered (x,y).
      const vertices = [coordinate(4, 2), coordinate(4, 5), coordinate(1, 5)];
      bindSequenceGroup(
        targets,
        [7, 8, 9],
        permutations(vertices),
      );
      break;
    }
  }
}
