function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function setAnswer(target: HTMLElement | undefined, answers: string | string[]): void {
  if (!target || target.dataset['lmsAnswers']) return;
  target.dataset['lmsAnswers'] = JSON.stringify(Array.isArray(answers) ? answers : [answers]);
}

function cardByHeading(root: ParentNode, needle: string): HTMLElement | undefined {
  return Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((card) =>
    normalizedText(card.querySelector('h3')).includes(needle),
  );
}

function setCalcFinals(container: ParentNode | undefined, values: readonly string[]): void {
  if (!container) return;
  const finals = Array.from(container.querySelectorAll<HTMLElement>('.calc-final .blank'));
  values.forEach((value, index) => setAnswer(finals[index], value));
}

function hydratePlotShape(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('מסמנים, מחברים ומזהים צורה') ||
    !sheetText.includes('A(2,1)') ||
    !sheetText.includes('B(7,1)') ||
    !sheetText.includes('C(7,5)') ||
    !sheetText.includes('D(2,5)')
  ) return;

  // 5×4 rectangle.
  setCalcFinals(cardByHeading(root, 'ד. חשבו את ההיקף והשטח'), ['18', '20']);
}

function hydrateRectanglesIntro(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('קודקודים, צלעות מקבילות, היקף ושטח') ||
    !sheetText.includes('מלבן ABCD')
  ) return;

  // Main rectangle: A(1,1),B(6,1),C(6,4),D(1,4) => 5×3.
  setCalcFinals(cardByHeading(root, 'ב. אורכי הצלעות'), ['16', '15']);

  // Missing-corner rectangle: P(2,2),Q(7,2),R(7,5), so S=(2,5), also 5×3.
  const missing = cardByHeading(root, 'ג. משלימים את הקודקוד החסר');
  if (missing) {
    const coordinates = Array.from(missing.querySelectorAll<HTMLElement>('.pair-blank'));
    setAnswer(coordinates[0], '2');
    setAnswer(coordinates[1], '5');
    setCalcFinals(missing, ['16', '15']);
  }
}

/** Deterministic LMS-only geometry answers derived from canonical coordinates. */
export function hydrateDigitalGeometryAnswers(root: ParentNode): void {
  hydratePlotShape(root);
  hydrateRectanglesIntro(root);
}
