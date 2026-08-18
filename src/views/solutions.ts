import { SOLUTION_PAGES } from '../data/solutions';
import { TOTAL_PAGES } from '../data/workbook';
import { elem } from '../lib/dom';
import { navigate } from '../router';
import { isAdminSession } from '../lms/auth';
import type { ViewContext } from './context';

const normalize = (value: string): string => value.trim().toLocaleLowerCase('he');

export function solutions({ outlet, setTitle }: ViewContext): void {
  setTitle('פתרונות — מערכת צירים');

  /* הפתרונות הם מפתח התשובות המלא של החוברת. במערכת המתוקשבת, שבה תלמיד
     נבדק עם עד 3 ניסיונות, פתיחתם לכולם הייתה מרוקנת את התרגול; לכן המסך
     נפתח רק בכניסת מורה/מנהל. (החלטת שכבת LMS — התוכן עצמו קנוני ומשותף.) */
  if (!isAdminSession()) {
    outlet.append(
      elem('section', { class: 'lms-gate no-print', role: 'region', 'aria-label': 'כניסת מורה נדרשת' },
        elem('div', { class: 'lms-gate__icon', text: '🔐', 'aria-hidden': 'true' }),
        elem('h1', { text: 'הפתרונות זמינים למורה בלבד' }),
        elem('p', { text: 'יש להתחבר בחשבון מנהל כדי לצפות בפתרונות המלאים של החוברת.' }),
        elem('div', { class: 'lms-gate__actions' },
          (() => {
            const b = elem('button', { class: 'btn btn--gold', type: 'button', text: 'התחברות' });
            b.addEventListener('click', () => navigate('#/login'));
            return b;
          })(),
        ),
      ),
    );
    return;
  }

  const root = elem('div', { class: 'container solutions' });
  const head = elem('header', { class: 'solutions__head' },
    elem('div', {},
      elem('h1', { class: 'solutions__title', text: 'פתרונות לחוברת — הרביע הראשון' }),
      elem('p', {
        class: 'solutions__sub',
        text: `הפתרונות מחוברים ישירות לסדר החוברת · ${SOLUTION_PAGES.length} מתוך ${TOTAL_PAGES} עמודים מאומתים כעת`,
      }),
    ),
  );

  const search = elem('input', {
    class: 'solutions__search',
    type: 'search',
    placeholder: 'חיפוש לפי עמוד, נושא, תרגיל או תשובה',
    'aria-label': 'חיפוש בפתרונות',
  }) as HTMLInputElement;

  const pageSelect = elem('select', {
    class: 'solutions__select',
    'aria-label': 'מעבר לעמוד פתרונות',
  }) as HTMLSelectElement;
  pageSelect.append(elem('option', { value: '', text: 'מעבר מהיר לעמוד…' }) as HTMLOptionElement);
  for (const entry of SOLUTION_PAGES) {
    pageSelect.append(elem('option', {
      value: String(entry.page.n),
      text: `עמוד ${entry.page.n} — ${entry.page.subtitle || entry.page.title}`,
    }) as HTMLOptionElement);
  }

  const tools = elem('div', { class: 'solutions__tools' }, search, pageSelect);
  const results = elem('div', { class: 'solutions__results', 'aria-live': 'polite' });
  const empty = elem('p', { class: 'solutions__empty', text: 'לא נמצאו פתרונות מתאימים לחיפוש.' });

  const render = (): void => {
    const q = normalize(search.value);
    results.replaceChildren();

    let shown = 0;
    let activeTopic = '';
    for (const entry of SOLUTION_PAGES) {
      const haystack = normalize([
        String(entry.page.n),
        entry.topic.title,
        entry.page.title,
        entry.page.subtitle,
        ...entry.exercises.flatMap((exercise) => [exercise.label, exercise.answer, exercise.method ?? '']),
      ].join(' '));
      if (q && !haystack.includes(q)) continue;

      if (entry.topic.id !== activeTopic) {
        activeTopic = entry.topic.id;
        results.append(elem('h2', { class: 'solutions__topic', text: entry.topic.title }));
      }

      const exerciseList = elem('div', { class: 'solutions__exercises' });
      for (const exercise of entry.exercises) {
        const answer = elem('div', { class: 'solutions__answer' },
          elem('div', { class: 'solutions__exercise-label', text: `תרגיל ${exercise.label}` }),
          elem('p', { class: 'solutions__answer-text', text: exercise.answer }),
        );
        if (exercise.method) {
          answer.append(elem('p', { class: 'solutions__method', text: `דרך: ${exercise.method}` }));
        }
        exerciseList.append(answer);
      }

      const card = elem('article', {
        class: 'solutions__page',
        id: `solution-page-${entry.page.n}`,
      },
        elem('header', { class: 'solutions__page-head' },
          elem('div', { class: 'solutions__page-number', text: `עמוד ${entry.page.n}` }),
          elem('div', {},
            elem('h3', { class: 'solutions__page-title', text: entry.page.subtitle || entry.page.title }),
            entry.page.subtitle ? elem('p', { class: 'solutions__page-chapter', text: entry.page.title }) : null,
          ),
          elem('button', {
            class: 'solutions__open-page',
            type: 'button',
            text: 'פתיחת העמוד בחוברת',
            onclick: () => navigate(`#/workbook/${entry.page.n}`),
          }),
        ),
        exerciseList,
      );
      results.append(card);
      shown += 1;
    }

    if (!shown) results.append(empty);
  };

  search.addEventListener('input', render);
  pageSelect.addEventListener('change', () => {
    const n = Number(pageSelect.value);
    if (!n) return;
    const target = document.getElementById(`solution-page-${n}`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    target?.focus({ preventScroll: true });
  });

  root.append(head, tools, results);
  outlet.append(root);
  render();
}
