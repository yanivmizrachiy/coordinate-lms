function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function answerTargets(container: ParentNode): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('.pair-blank, .word-blank, .blank'),
  ).filter((target) => !target.dataset['lmsAnswers']);
}

function setAnswer(target: HTMLElement | undefined, answers: string | string[]): void {
  if (!target || target.dataset['lmsAnswers']) return;
  target.dataset['lmsAnswers'] = JSON.stringify(Array.isArray(answers) ? answers : [answers]);
}

function forceAnswer(target: HTMLElement | undefined, answers: string | string[]): void {
  if (!target) return;
  target.dataset['lmsAnswers'] = JSON.stringify(Array.isArray(answers) ? answers : [answers]);
}

function cardByHeading(root: ParentNode, needle: string): HTMLElement | undefined {
  return Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((card) =>
    normalizedText(card.querySelector('h3')).includes(needle),
  );
}

function hydrateRuleToGraph(root: ParentNode): void {
  const first = cardByHeading(root, 'y = 2x');
  if (first) {
    const targets = answerTargets(first);
    const expected: Array<string | string[]> = [
      '0', '2', '4', '6',
      '0', '2', '4', '6',
      ['ישר', 'ישר אחד', 'קו ישר'],
      'x',
    ];
    expected.forEach((answer, index) => setAnswer(targets[index], answer));
  }

  const second = cardByHeading(root, 'y = x + 2');
  if (second) {
    const targets = answerTargets(second);
    ['3', '4', '6', '2', '8'].forEach((answer, index) =>
      setAnswer(targets[index], answer),
    );
  }

  const third = cardByHeading(root, 'x = y + 4');
  if (third) {
    const targets = answerTargets(third);
    ['4', '5', '6', '7', 'x', '6'].forEach((answer, index) =>
      setAnswer(targets[index], answer),
    );
  }
}

function hydrateRectangleVertices(root: ParentNode): void {
  const build = cardByHeading(root, 'בונים מלבן');
  if (!build) return;
  const text = normalizedText(build);
  if (
    !text.includes('(2,1)') ||
    !text.includes('אורכו 4 יחידות') ||
    !text.includes('רוחבו 3 יחידות')
  ) return;

  const finals = Array.from(
    build.querySelectorAll<HTMLElement>('.calc-final .blank'),
  );
  setAnswer(finals[0], '14');
  setAnswer(finals[1], '12');
}

function hydrateSameAxisPrint(root: ParentNode): void {
  const ruleBox = root.querySelector<HTMLElement>('.rule-box');
  if (ruleBox) {
    const target = answerTargets(ruleBox)[0];
    setAnswer(target, ['אנכי', 'אנכית']);
  }

  const sameX = cardByHeading(root, 'אותו שיעור x');
  if (sameX) {
    const targets = answerTargets(sameX);
    const expected: Array<string | string[]> = [
      '2',
      ['אנכי', 'אנכית'],
      'ז',
      'ה',
    ];
    expected.forEach((answer, index) => setAnswer(targets[index], answer));
  }

  const sameY = cardByHeading(root, 'אותו שיעור y');
  if (sameY) {
    const targets = answerTargets(sameY);
    const expected: Array<string | string[]> = [
      '2',
      ['y', 'Y'],
      'י',
      'ם',
    ];
    expected.forEach((answer, index) => setAnswer(targets[index], answer));
  }

  const word = cardByHeading(root, 'מרכיבים את המילה');
  if (word) {
    const targets = Array.from(
      word.querySelectorAll<HTMLElement>('.blank, .word-blank'),
    );
    setAnswer(targets[0], 'זהים');
    // The aria label on this legacy word blank is descriptive ("שהתגלתה"),
    // not an answer. Override that inferred value with the real revealed word.
    forceAnswer(targets[1], 'זהים');
    setAnswer(targets[2], ['x', 'X']);
  }

  const noDrawing = cardByHeading(root, 'מזהים בלי סרטוט');
  if (noDrawing) {
    const targets = answerTargets(noDrawing);
    setAnswer(targets[0], '4');
  }
}

/** LMS-only deterministic answers for canonical rule/table tasks. */
export function hydrateDigitalRuleAnswers(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));

  if (sheetText.includes('מכלל לטבלה ולגרף')) {
    hydrateRuleToGraph(root);
  }

  if (sheetText.includes('קודקודים של מלבן')) {
    hydrateRectangleVertices(root);
  }

  if (sheetText.includes('אותו x או אותו y')) {
    hydrateSameAxisPrint(root);
  }
}
