import { elem } from '../lib/dom';
import { navigate } from '../router';
import type { ViewContext } from './context';

const bullet = (text: string): HTMLElement =>
  elem('li', { class: 'lms-welcome__bullet', text });

export function welcome({ outlet, setTitle }: ViewContext): void {
  setTitle('בחירת דרך תרגול');

  const freeButton = elem('button', {
    class: 'btn btn--gold lms-welcome__primary',
    type: 'button',
    text: 'התחלת תרגול חופשי — בלי רישום',
  });
  freeButton.addEventListener('click', () => navigate('#/workbook/1'));

  const registerButton = elem('button', {
    class: 'btn btn--gold lms-welcome__primary',
    type: 'button',
    text: 'הרשמה ושמירת ציונים',
  });
  registerButton.addEventListener('click', () => navigate('#/login'));

  const loginButton = elem('button', {
    class: 'btn btn--ghost',
    type: 'button',
    text: 'כבר נרשמתי — התחברות',
  });
  loginButton.addEventListener('click', () => navigate('#/login'));

  const materialsButton = elem('button', {
    class: 'lms-welcome__materials',
    type: 'button',
    text: 'לחוברת, לסרטון ולחומרי הלימוד ←',
  });
  materialsButton.addEventListener('click', () => navigate('#/home'));

  outlet.append(
    elem(
      'div',
      { class: 'lms-welcome' },
      elem(
        'section',
        { class: 'lms-welcome__hero' },
        elem('div', { class: 'lms-welcome__eyebrow', text: 'מערכת צירים — הרביע הראשון' }),
        elem('h1', { class: 'lms-welcome__title', text: 'איך תרצו לתרגל?' }),
        elem('p', {
          class: 'lms-welcome__lead',
          text: 'אפשר להתחיל מיד גם בלי רישום. לפני שמתחילים, חשוב לדעת בפשטות מה נשמר ומה לא.',
        }),
      ),
      elem(
        'div',
        { class: 'lms-welcome__grid' },
        elem(
          'section',
          { class: 'lms-welcome__card lms-welcome__card--free' },
          elem('div', { class: 'lms-welcome__icon', text: '▶', 'aria-hidden': 'true' }),
          elem('div', { class: 'lms-welcome__kicker', text: 'תרגול חופשי' }),
          elem('h2', { text: 'בלי רישום' }),
          elem('p', {
            class: 'lms-welcome__summary',
            text: 'נכנסים ומתחילים לפתור. אין צורך בשם, באימייל או בסיסמה.',
          }),
          elem(
            'ul',
            { class: 'lms-welcome__list' },
            bullet('כל עמודי התרגול פתוחים.'),
            bullet('מקבלים בדיקה ומשוב מיידי.'),
            bullet('לכל תשובה יש עד 3 ניסיונות.'),
            bullet('אפשר לראות ציון בסיום העמוד.'),
          ),
          elem(
            'div',
            { class: 'lms-welcome__notice', role: 'note' },
            elem('strong', { text: 'חשוב: ' }),
            elem('span', {
              text: 'הציון בתרגול חופשי אינו נשמר. הוא לא עובר למכשיר אחר ולא מופיע אצל המורה.',
            }),
          ),
          freeButton,
        ),
        elem(
          'section',
          { class: 'lms-welcome__card lms-welcome__card--account' },
          elem('div', { class: 'lms-welcome__icon', text: '✓', 'aria-hidden': 'true' }),
          elem('div', { class: 'lms-welcome__kicker', text: 'תרגול עם שמירה' }),
          elem('h2', { text: 'עם רישום' }),
          elem('p', {
            class: 'lms-welcome__summary',
            text: 'נרשמים פעם אחת עם שם מלא, בית ספר, אימייל וסיסמה.',
          }),
          elem(
            'ul',
            { class: 'lms-welcome__list' },
            bullet('הציונים נשמרים בחשבון.'),
            bullet('ההתקדמות נשמרת ואפשר להמשיך אחר כך.'),
            bullet('אפשר להמשיך גם ממכשיר אחר לאחר התחברות.'),
            bullet('המורה יכול לראות את התוצאות וההתקדמות.'),
          ),
          elem('p', {
            class: 'lms-welcome__plain',
            text: 'התרגול עצמו נשאר אותו תרגול. הרישום פשוט מוסיף שמירה של הציונים וההתקדמות.',
          }),
          registerButton,
          loginButton,
        ),
      ),
      materialsButton,
    ),
  );
}
