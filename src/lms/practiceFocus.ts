const ACCOUNT_LABELS = new Set([
  'הרשמה / התחברות',
  'החשבון שלי',
]);

/**
 * Keeps numbered workbook pages focused on learning only.
 * Account/registration explanations belong on the landing screen before
 * practice starts, never between a learner and the current exercise.
 */
export function focusPracticePanel(panel: HTMLElement): void {
  panel.querySelector<HTMLElement>('.lms-panel__identity')?.remove();

  for (const button of panel.querySelectorAll<HTMLButtonElement>('button')) {
    const label = (button.textContent || '').trim();
    if (ACCOUNT_LABELS.has(label)) button.remove();
  }
}
