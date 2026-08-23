export function refineQuestionSubmitControls(root: ParentNode): void {
  const buttons = root.querySelectorAll<HTMLButtonElement>('.lms-qcheck__btn');

  for (const button of buttons) {
    button.textContent = 'להגיש ←';
    button.setAttribute('aria-label', 'להגיש שאלה לבדיקה');
    button.title = 'להגיש שאלה לבדיקה';
  }
}
