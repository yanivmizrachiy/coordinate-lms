/*
 * Digital-only question adaptations live here, but they must never be bound to
 * a page number alone. The canonical printed workbook can insert/reorder pages,
 * so a rule such as "page 17, answer 11" can silently move onto a different
 * question and award an incorrect mark.
 *
 * The previous 77-page audit used page-number-bound overrides. After syncing the
 * current 78-page canonical workbook those overrides are intentionally retired.
 * New adaptations are added only after the regenerated coverage identifies the
 * current target and the rule can be tied to stable question evidence/content.
 */
export function applyDigitalAnswerPolicy(root: ParentNode): void {
  const sheet = root.querySelector<HTMLElement>('.sheet[id^="page-"]');
  if (!sheet || sheet.dataset['digitalAnswerPolicy'] === 'ready') return;
  sheet.dataset['digitalAnswerPolicy'] = 'ready';
}
