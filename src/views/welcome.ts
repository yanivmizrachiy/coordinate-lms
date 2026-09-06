import { elem } from '../lib/dom';
import { navigate } from '../router';
import type { ViewContext } from './context';

const choice = (
  variant: 'account' | 'free',
  title: string,
  description: string,
  onClick: () => void,
): HTMLElement => {
  const button = elem('button', {
    class: `lms-welcome__choice lms-welcome__choice--${variant}`,
    type: 'button',
    text: title,
  });
  button.addEventListener('click', onClick);

  return elem(
    'section',
    { class: `lms-welcome__card lms-welcome__card--${variant}` },
    button,
    elem('p', { class: 'lms-welcome__summary', text: description }),
  );
};

export function welcome({ outlet, setTitle }: ViewContext): void {
  setTitle('בחירת דרך תרגול');

  outlet.append(
    elem(
      'main',
      { class: 'lms-welcome' },
      elem(
        'section',
        { class: 'lms-welcome__hero' },
        elem('div', { class: 'lms-welcome__eyebrow', text: 'מערכת צירים — הרביע הראשון' }),
        elem('h1', { class: 'lms-welcome__title', text: 'איך תרצו לתרגל?' }),
        elem('p', {
          class: 'lms-welcome__lead',
          text: 'בחרו דרך אחת והתחילו מיד.',
        }),
      ),
      elem(
        'div',
        { class: 'lms-welcome__choices', 'aria-label': 'בחירת דרך תרגול' },
        choice(
          'account',
          'לתרגל עם רישום',
          'הציונים וההתקדמות נשמרים. אפשר להמשיך ממכשיר אחר והמורה יכול לראות את ההתקדמות.',
          () => navigate('#/login'),
        ),
        choice(
          'free',
          'לתרגל בלי רישום',
          'מתחילים מיד ומקבלים משוב וציון. הציון לא נשמר ולא מופיע אצל המורה.',
          () => {
            /* An explicit guest start is a learner boundary, not ordinary SPA
               navigation. Start the new guest identity, point the URL at page
               1, then reload the document once. Destroying the previous JS
               document guarantees that no delayed callback, timer or stale DOM
               reference from the previous learner can repaint their answers
               into the fresh learner view. sessionStorage survives this same-
               tab reload, so the new identity is retained and normal reload
               continuity after entry still works. */
            void import('../lms/guestPracticeSession').then(({ beginGuestPracticeSession }) => {
              beginGuestPracticeSession();
              navigate('#/workbook/1');
              window.location.reload();
            });
          },
        ),
      ),
      elem('p', {
        class: 'lms-welcome__footnote',
        text: 'בשני המצבים התרגול עצמו זהה.',
      }),
    ),
  );
}
