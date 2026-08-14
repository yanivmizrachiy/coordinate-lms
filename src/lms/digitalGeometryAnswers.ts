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

function setLastLooseNumbers(container: ParentNode | undefined, values: readonly string[]): void {
  if (!container) return;
  const targets = Array.from(container.querySelectorAll<HTMLElement>('.blank[data-missing="number"]'));
  const start = Math.max(0, targets.length - values.length);
  values.forEach((value, index) => setAnswer(targets[start + index], value));
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

function hydrateSquaresSummary(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('משלימים קודקוד חסר, ומכריעים אם טענה נכונה בהכרח') ||
    !sheetText.includes('A(2,2)') ||
    !sheetText.includes('B(2,6)') ||
    !sheetText.includes('C(7,6)')
  ) return;

  // Rectangle is 5×4.
  setCalcFinals(cardByHeading(root, 'א. משלימים את הקודקוד החסר'), ['18', '20']);
}

function hydrateSquaresPractice(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('ריבוע ברביע הראשון') ||
    !sheetText.includes('יישום משולב של כל הכללים')
  ) return;

  // A(2,1),B(6,1),C(6,5): side 4.
  setCalcFinals(cardByHeading(root, 'משלימים ריבוע'), ['16', '16']);
  // Lower-left (1,2), side 3.
  setCalcFinals(cardByHeading(root, 'ריבוע מתיאור'), ['12', '9']);

  // Path from P(1,1): 5 right + 4 up + 2 left + 3 down = 14;
  // final x is 4, which is 3 greater than the starting x=1.
  const summary = cardByHeading(root, 'משימת סיכום');
  setLastLooseNumbers(summary, ['14', '3']);
}

function hydrateShapeClaims(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (!sheetText.includes('טענות על נקודות, הזזות ושטחים')) return;

  // First rectangle 6×2 => perimeter 16, area 12.
  setCalcFinals(cardByHeading(root, 'ג. המלבן הראשון'), ['16', '12']);
  // Second rectangle 4×3 => perimeter 14, area 12.
  setCalcFinals(cardByHeading(root, 'ד. המלבן השני'), ['14', '12']);
}

/** Deterministic LMS-only geometry answers derived from canonical coordinates. */
export function hydrateDigitalGeometryAnswers(root: ParentNode): void {
  hydratePlotShape(root);
  hydrateRectanglesIntro(root);
  hydrateSquaresSummary(root);
  hydrateSquaresPractice(root);
  hydrateShapeClaims(root);
}
