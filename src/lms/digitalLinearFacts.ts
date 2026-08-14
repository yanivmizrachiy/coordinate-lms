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

function setBlankInItem(
  root: ParentNode,
  needle: string,
  answers: string | string[],
): void {
  const item = itemByText(root, needle);
  setAnswer(item?.querySelector<HTMLElement>('.blank') ?? undefined, answers);
}

/** Small, page-independent facts that are uniquely determined by visible coordinates. */
export function hydrateDigitalLinearFacts(root: ParentNode): void {
  setBlankInItem(
    root,
    'לשתי הנקודות E(2,5) ו־F(7,5) יש שיעור',
    ['y', 'Y'],
  );

  setBlankInItem(
    root,
    'לשתי הנקודות G(4,1) ו־H(4,6) יש שיעור',
    ['x', 'X'],
  );

  setBlankInItem(
    root,
    'אורי חישב את המרחק בין (2,5) ובין (7,5) וקיבל 9',
    ['חיבר', 'חיבר יחד'],
  );

  setBlankInItem(
    root,
    'לשתי נקודות שממוקמות על אותו קו אנכי יש שיעור',
    ['x', 'X'],
  );

  setBlankInItem(
    root,
    'לנקודות P(3,1) ו־Q(3,6) יש שיעור',
    ['x', 'X'],
  );
}
