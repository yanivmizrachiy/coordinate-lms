import { elem } from '../lib/dom';
import { currentSession } from './auth';
import { clearEditableAnswers } from './pageRun';
import { loadDraft, saveDraft } from './repository';
import { restartSubmittedPage } from './pageRunPersistence';

export function installPageRunControls(
  panel: HTMLElement,
  scoreBanner: HTMLElement,
  pageNumber: number,
): () => void {
  const uid = currentSession()?.uid || 'guest';
  const host = elem('div', {
    class: 'lms-page-run-actions no-print',
    role: 'group',
    'aria-label': 'פעולות עמוד',
  });
  const clearButton = elem('button', {
    class: 'btn btn--ghost btn--sm',
    type: 'button',
    text: 'ניקוי התשובות בעמוד',
  }) as HTMLButtonElement;
  const retryButton = elem('button', {
    class: 'btn btn--ghost btn--sm',
    type: 'button',
    text: 'לתרגל שוב מההתחלה',
  }) as HTMLButtonElement;
  const message = elem('div', {
    class: 'lms-page-run-actions__message',
    role: 'status',
    'aria-live': 'polite',
  });

  host.append(clearButton, retryButton, message);
  panel.append(host);

  let disposed = false;

  const refresh = async (): Promise<void> => {
    const draft = await loadDraft(uid, pageNumber);
    if (disposed) return;
    const submitted = Boolean(draft?.submitted);
    clearButton.hidden = submitted;
    retryButton.hidden = !submitted;
  };

  clearButton.addEventListener('click', () => {
    void (async () => {
      const draft = await loadDraft(uid, pageNumber);
      if (!draft || draft.submitted) {
        await refresh();
        return;
      }
      if (!window.confirm('לנקות את התשובות שעדיין ניתנות לעריכה בעמוד? ניסיונות שכבר נבדקו לא יתאפסו.')) return;

      clearButton.disabled = true;
      message.textContent = 'מנקה את התשובות…';
      const outcome = await saveDraft(clearEditableAnswers(draft));
      if (outcome.central === 'failed') {
        clearButton.disabled = false;
        message.textContent = outcome.error || 'הניקוי נשמר במכשיר, אך הסנכרון המרכזי נכשל.';
        return;
      }
      location.reload();
    })();
  });

  retryButton.addEventListener('click', () => {
    void (async () => {
      const draft = await loadDraft(uid, pageNumber);
      if (!draft?.submitted) {
        await refresh();
        return;
      }
      if (!window.confirm('להתחיל את העמוד מחדש? הציון שכבר הוגש יישמר.')) return;

      retryButton.disabled = true;
      message.textContent = 'פותח ניסיון חדש…';
      const outcome = await restartSubmittedPage(draft);
      if (outcome.central === 'failed') {
        retryButton.disabled = false;
        message.textContent = outcome.error || 'לא ניתן היה לפתוח ניסיון חדש. הנתונים הקיימים לא שונו.';
        return;
      }
      location.reload();
    })();
  });

  const observer = new MutationObserver(() => {
    void refresh();
  });
  observer.observe(scoreBanner, { childList: true, subtree: true });
  void refresh();

  return () => {
    disposed = true;
    observer.disconnect();
    host.remove();
  };
}
