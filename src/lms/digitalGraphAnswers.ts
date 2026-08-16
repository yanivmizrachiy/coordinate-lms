function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function setAnswer(target: HTMLElement | undefined, answers: string | string[]): void {
  if (!target || target.dataset['lmsAnswers']) return;
  target.dataset['lmsAnswers'] = JSON.stringify(Array.isArray(answers) ? answers : [answers]);
}

function itemByText(root: ParentNode, needle: string): HTMLElement | undefined {
  return Array.from(root.querySelectorAll<HTMLElement>('li')).find((item) =>
    normalizedText(item).includes(needle),
  );
}

function hydrateGraphReadingIntro(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('דקות למידה') ||
    !sheetText.includes('שאלות שנפתרו') ||
    !sheetText.includes('D(4,5)')
  ) return;

  const ruleBox = root.querySelector<HTMLElement>('.rule-box');
  setAnswer(ruleBox?.querySelector<HTMLElement>('.blank[data-missing="concept"]') ?? undefined, ['התוצאה', 'תוצאה']);

  setAnswer(
    itemByText(root, 'לשתי הנקודות D ו־E')?.querySelector<HTMLElement>('.blank[data-missing="relation"]') ?? undefined,
    ['גדול יותר', 'גדול'],
  );

  setAnswer(
    itemByText(root, 'ככל ששיעור ה־x גדל')?.querySelector<HTMLElement>('.blank[data-missing="relation"]') ?? undefined,
    ['גדל', 'עולה'],
  );

  setAnswer(
    itemByText(root, 'הנקודה G ממוקמת מימין לנקודה D')?.querySelector<HTMLElement>('.blank[data-missing="direction"]') ?? undefined,
    ['מתחת', 'מתחתיה'],
  );
}

function hydrateGraphYears(root: ParentNode): void {
  const sheetText = normalizedText(root.querySelector('.sheet'));
  if (
    !sheetText.includes('שנים מאז הפתיחה') ||
    !sheetText.includes('נרשמים (עשרות)') ||
    !sheetText.includes('השנה השמינית')
  ) return;

  const ruleBox = root.querySelector<HTMLElement>('.rule-box');
  setAnswer(ruleBox?.querySelector<HTMLElement>('.blank[data-missing="concept"]') ?? undefined, ['שנים', 'שנה']);

  setAnswer(
    itemByText(root, 'הנקודה שסימנתם ממוקמת')?.querySelector<HTMLElement>('.blank[data-missing="direction"]') ?? undefined,
    ['מימין', 'ימינה'],
  );
}

/** Deterministic LMS-only answers for fixed graph-reading prompts. */
export function hydrateDigitalGraphAnswers(root: ParentNode): void {
  hydrateGraphReadingIntro(root);
  hydrateGraphYears(root);
}
