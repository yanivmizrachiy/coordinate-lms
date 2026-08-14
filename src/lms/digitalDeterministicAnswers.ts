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

function setSequential(targets: HTMLElement[], values: readonly (string | string[])[]): void {
  values.forEach((value, index) => setAnswer(targets[index], value));
}

function blanks(container: ParentNode | undefined, selector = '.blank, .pair-blank, .word-blank'): HTMLElement[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

function hydrateOrderedPairIntro(root: ParentNode): void {
  const text = normalizedText(root.querySelector('.sheet'));
  if (
    !text.includes('הזוג הסדור') ||
    !text.includes('x=2, y=5') ||
    !text.includes('x=7, y=1') ||
    !text.includes('x=3, y=6') ||
    !text.includes('x=5, y=4')
  ) return;

  const orderedPairs = blanks(cardByHeading(root, 'א. השלימו את הזוג הסדור'), '.pair-blank');
  setSequential(orderedPairs, ['2', '5', '7', '1', '3', '6', '5', '4']);

  const knownCoordinates = blanks(cardByHeading(root, 'ב. השלימו את השיעורים החסרים'), '.blank');
  setSequential(knownCoordinates, ['6', '2', '1', '5', '4', '3', '7', '6']);

  const correction = blanks(cardByHeading(root, 'ד. מצאו ותקנו את הטעות'));
  setSequential(correction, [
    ['שיעור', 'שיעור ה־'],
    '3',
    '5',
    ['ימינה', 'מימין'],
  ]);

  const whyOrder = blanks(cardByHeading(root, 'ה. השלימו'));
  setSequential(whyOrder, [
    ['שונה', 'אחרת'],
    ['ימינה', 'ימין'],
    ['y', 'Y'],
    ['אחת', '1'],
  ]);
}

function hydrateOnAxesIntro(root: ParentNode): void {
  const text = normalizedText(root.querySelector('.sheet'));
  if (
    !text.includes('נקודות שעל הצירים') ||
    !text.includes('A(4,0)') ||
    !text.includes('B(0,5)') ||
    !text.includes('O(0,0)')
  ) return;

  const originRule = Array.from(root.querySelectorAll<HTMLElement>('.rule-box.completion-intro'))[2];
  setSequential(blanks(originRule, '.pair-blank'), ['0', '0']);

  const complete = blanks(cardByHeading(root, 'ג. השלימו'), '.pair-blank');
  setSequential(complete, ['0', '0', '2', '6']);

  const origin = blanks(cardByHeading(root, 'ד. הנקודה שממוקמת על שני הצירים'));
  setSequential(origin, [
    ['x', 'X'],
    ['y', 'Y'],
    '0',
    ['ראשית', 'ראשית הצירים'],
    ['צירים', 'הצירים'],
  ]);
}

function hydrateMissingCoordinateIntro(root: ParentNode): void {
  const text = normalizedText(root.querySelector('.sheet'));
  if (
    !text.includes('A(5,') ||
    !text.includes('C(3,') ||
    !text.includes('שני השיעורים זהים') ||
    !text.includes('שיעור y גדול פי 2 משיעור x') ||
    !text.includes('שיעור x גדול ב־4 משיעור y')
  ) return;

  const missing = blanks(cardByHeading(root, 'א. השלימו את השיעור החסר'), '.pair-blank');
  setSequential(missing, ['0', '0', '3', '3', '5', '7']);

  const whoAmI = blanks(cardByHeading(root, 'ב. מי אני'), '.pair-blank');
  setSequential(whoAmI, ['6', '5', '4', '4', '3', '2', '5', '4']);

  const pattern = blanks(cardByHeading(root, 'ג. דפוס: (2,1)'));
  setSequential(pattern, [
    ['גדל ב־2', 'עולה ב־2', '+2'],
    ['גדל ב־1', 'עולה ב־1', '+1'],
    ['x=2y', 'x = 2y', 'x כפול 2 משיעור y'],
    ['לא', 'לא מתאים'],
  ]);

  const secondPattern = blanks(cardByHeading(root, 'ד. דפוס: (1,3)'));
  setSequential(secondPattern, ['2', ['לא', 'לא מתאים']]);

  const many = blanks(cardByHeading(root, 'ה. „מעל ציר'));
  if (many.length > 0) {
    setAnswer(many[0], ['הרבה', 'אינסוף', 'אינסוף נקודות']);
    // The four coordinate blanks are learner choices and are graded by a predicate.
    setAnswer(many[many.length - 2], ['y', 'Y']);
  }
}

function hydrateMoveIntro(root: ParentNode): void {
  const text = normalizedText(root.querySelector('.sheet'));
  if (
    !text.includes('הזזה של נקודות') ||
    !text.includes('(2,3) - 4 ימינה') ||
    !text.includes('(7,4) - 5 שמאלה') ||
    !text.includes('(5,1) - 4 למעלה') ||
    !text.includes('(3,6) - 3 למטה')
  ) return;

  const directMoves = blanks(cardByHeading(root, 'ב. השלימו את הנקודה שמתקבלת'), '.pair-blank');
  setSequential(directMoves, ['6', '3', '2', '4', '5', '5', '3', '3']);

  const route = blanks(cardByHeading(root, 'ג. מסלול'));
  setSequential(route, ['6', '1', '6', '4', ['x', 'X'], ['y', 'Y']]);

  const reverse = blanks(cardByHeading(root, 'ד. שאלה הפוכה'), '.pair-blank');
  setSequential(reverse, ['3', '5']);
}

function hydrateSameCoordinateIntro(root: ParentNode): void {
  const text = normalizedText(root.querySelector('.sheet'));
  if (
    !text.includes('שיעורים זהים וקטעים מקבילים') ||
    !text.includes('A ו־B') ||
    !text.includes('P(4,1)') ||
    !text.includes('Q(4,6)')
  ) return;

  const a = blanks(cardByHeading(root, 'א. הנקודות'));
  setSequential(a, [['x', 'X'], '2', ['y', 'Y']]);

  const b = blanks(cardByHeading(root, 'ב. הנקודות'));
  setAnswer(b[0], '5');

  const ruleBox = root.querySelector<HTMLElement>('.rule-box.completion-intro');
  setAnswer(ruleBox?.querySelector<HTMLElement>('.blank') ?? undefined, ['y', 'Y']);

  const c = blanks(cardByHeading(root, 'ג. השלימו'));
  setSequential(c, [['x', 'X'], ['x', 'X']]);
}

function hydrateErrorsIntro(root: ParentNode): void {
  const text = normalizedText(root.querySelector('.sheet'));
  if (
    !text.includes('מזהים ומתקנים טעויות') ||
    !text.includes('בקטע שקצותיו (1,3) ו־(4,3)')
  ) return;

  const cards = Array.from(root.querySelectorAll<HTMLElement>('.mist-card'));
  const last = cards[cards.length - 1];
  setAnswer(last?.querySelector<HTMLElement>('.blank') ?? undefined, ['x', 'X']);
}

function hydrateErrorsPractice(root: ParentNode): void {
  const text = normalizedText(root.querySelector('.sheet'));
  if (
    !text.includes('זיהוי ותיקון טעויות') ||
    !text.includes('שלושה קודקודים של מלבן הם (1,1), (6,1), (6,4)') ||
    !text.includes('הנקודה (0,7)')
  ) return;

  const rectangle = blanks(cardByHeading(root, 'טעות במלבן'));
  setSequential(rectangle, [
    ['(1,4)', '1,4'],
    ['ארוכה', 'ארוך'],
    ['y', 'Y'],
  ]);

  const wording = blanks(cardByHeading(root, 'בודקים ניסוח'));
  setAnswer(wording[0], [
    'שיעור y הוא מחצית משיעור x',
    'שיעור y שווה למחצית משיעור x',
    'שיעור y שווה לחצי משיעור x',
  ]);

  const axis = blanks(cardByHeading(root, 'טעות בנקודה שעל ציר'));
  setSequential(axis, [
    ['y', 'Y'],
    '0',
    ['ראשית', 'ראשית הצירים'],
  ]);
}

/**
 * Deterministic LMS-only answers derived directly from visible canonical data.
 * Learner-choice responses remain untouched and are handled by mathematical predicates.
 */
export function hydrateDigitalDeterministicAnswers(root: ParentNode): void {
  hydrateOrderedPairIntro(root);
  hydrateOnAxesIntro(root);
  hydrateMissingCoordinateIntro(root);
  hydrateMoveIntro(root);
  hydrateSameCoordinateIntro(root);
  hydrateErrorsIntro(root);
  hydrateErrorsPractice(root);
}
