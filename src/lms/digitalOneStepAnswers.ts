function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

/** Tiny LMS-only fixes for answers that are literally determined by the canonical sentence. */
export function hydrateDigitalOneStepAnswers(root: ParentNode): void {
  for (const item of root.querySelectorAll<HTMLElement>('li')) {
    const text = normalizedText(item);
    if (!text.includes('כדי לקבוע נקודה אחת צריך לדעת גם את ערך ה־x וגם את שיעור ה־')) continue;
    const blank = item.querySelector<HTMLElement>('.blank[data-missing="letter"]');
    if (blank && !blank.dataset['lmsAnswers']) {
      blank.dataset['lmsAnswers'] = JSON.stringify(['y']);
    }
  }
}
