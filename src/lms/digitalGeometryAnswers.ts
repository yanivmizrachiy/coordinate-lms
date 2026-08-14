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

function setPageCalcFinals(root: ParentNode, values: readonly string[]): void {
  const finals = Array.from(root.querySelectorAll<HTMLElement>('.calc-final .blank'));
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

  setCalcFinals(cardByHeading(root, 'ד. חשבו את ההיקף והשטח'), ['18', '20']);
}

function hydrateRectanglesIntro(root: ParentNode): void {
  const lengths = cardByHeading(root, 'ב. אורכי הצלעות');
  const missing = cardByHeading(root, 'ג. משלימים את הקודקוד החסר');
  if (!lengths || !missing) return;

  const lengthsText = normalizedText(lengths);
  const missingText = normalizedText(missing);
  if (
    !lengthsText.includes('6 − 1') ||
    !lengthsText.includes('4 − 1') ||
    !missingText.includes('P(2,2)') ||
    !missingText.includes('Q(7,2)') ||
    !missingText.includes('R(7,5)')
  ) return;

  // Main rectangle: 5×3.
  setCalcFinals(lengths, ['16', '15']);

  // Missing-corner rectangle: S=(2,5), also 5×3.
  const coordinates = Array.from(missing.querySelectorAll<HTMLElement>('.pair-blank'));
  setAnswer(coordinates[0], '2');
  setAnswer(coordinates[1], '5');
  setCalcFinals(missing, ['16', '15']);
}

function hydrateSquaresSummary(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('A(2,2)') ||
    !sheetText.includes('B(2,6)') ||
    !sheetText.includes('C(7,6)') ||
    !sheetText.includes('אם מזיזים את המלבן יחידה אחת ימינה')
  ) return;

  setPageCalcFinals(root, ['18', '20']);
}

function hydrateSquaresPractice(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('A(2,1), B(6,1), C(6,5)') ||
    !sheetText.includes('קודקוד שמאלי־תחתון של ריבוע הוא (1,2)') ||
    !sheetText.includes('התחילו בנקודה P(1,1)')
  ) return;

  setPageCalcFinals(root, ['16', '16', '12', '9']);

  const summary = cardByHeading(root, 'משימת סיכום');
  setLastLooseNumbers(summary, ['14', '3']);
}

function hydrateShapeClaims(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (!sheetText.includes('טענות על נקודות, הזזות ושטחים')) return;

  setPageCalcFinals(root, ['16', '12', '14', '12']);
}

function hydrateHallSeats(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (!sheetText.includes('שורה ומקום — הכרטיס שלכם')) return;

  setCalcFinals(cardByHeading(root, 'ב. הכיתה מזמינה גוש כיסאות'), ['10', '6']);
}

function hydratePixelArt(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (!sheetText.includes('פיקסלים — כל מסך הוא מערכת צירים')) return;

  const coloring = cardByHeading(root, 'א. צבעו את הפיקסלים');
  setAnswer(coloring?.querySelector<HTMLElement>('.blank[data-missing="number"]') ?? undefined, '3');
  setCalcFinals(cardByHeading(root, 'ב. כמה פיקסלים צריך'), ['20', '24']);
}

/** Deterministic LMS-only geometry answers derived from canonical coordinates. */
export function hydrateDigitalGeometryAnswers(root: ParentNode): void {
  hydratePlotShape(root);
  hydrateRectanglesIntro(root);
  hydrateSquaresSummary(root);
  hydrateSquaresPractice(root);
  hydrateShapeClaims(root);
  hydrateHallSeats(root);
  hydratePixelArt(root);
}
