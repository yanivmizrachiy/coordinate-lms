interface ExplanationSpec {
  sheetIncludes: string;
  headingIncludes: string;
  explanationIndex: number;
  prompt: string;
  options: readonly string[];
  correct: string;
}

interface ExplanationBinding {
  blank: HTMLElement;
  fieldset: HTMLFieldSetElement;
  radios: HTMLInputElement[];
  onChange: EventListener;
  observer: MutationObserver;
}

const SPECS: readonly ExplanationSpec[] = [
  {
    sheetIncludes: 'הזוג הסדור',
    headingIncludes: 'הסדר משנה',
    explanationIndex: 0,
    prompt: 'מדוע (2,5) ו־(5,2) הן שתי נקודות שונות?',
    correct: 'כי בזוג סדור המספר הראשון הוא ערך x והשני הוא שיעור y, ולכן החלפת הסדר מחליפה את תפקידי המספרים ואת מיקום הנקודה.',
    options: [
      'כי סכום שני השיעורים משתנה כשמחליפים את הסדר.',
      'כי בזוג סדור המספר הראשון הוא ערך x והשני הוא שיעור y, ולכן החלפת הסדר מחליפה את תפקידי המספרים ואת מיקום הנקודה.',
      'כי שיעור y קובע גם את המיקום האופקי של הנקודה.',
      'כי שם הנקודה הוא שקובע את מיקומה במערכת הצירים.',
    ],
  },
  {
    sheetIncludes: 'הזוג הסדור',
    headingIncludes: 'הסדר משנה',
    explanationIndex: 1,
    prompt: 'מדוע (5,2) נמצאת ימינה יותר מ־(2,5)?',
    correct: 'כי ערך ה־x שלה הוא 5 לעומת 2, וערך x קובע את המיקום האופקי.',
    options: [
      'כי שיעור ה־y שלה הוא 2, ושיעור y קובע את המיקום האופקי.',
      'כי סכום השיעורים של (5,2) גדול יותר מסכום השיעורים של (2,5).',
      'כי ערך ה־x שלה הוא 5 לעומת 2, וערך x קובע את המיקום האופקי.',
      'כי המספר השני בזוג הסדור תמיד קובע מי נמצאת ימינה יותר.',
    ],
  },
  {
    sheetIncludes: 'קוראים שיעורי נקודות',
    headingIncludes: 'שאלה נוספת',
    explanationIndex: 0,
    prompt: 'מדוע שיעור ה־x של הנקודה הוא 6?',
    correct: 'כי הנקודה נמצאת באותו קו אנכי כמו M, ולכן שיעור ה־x שלה זהה לשיעור ה־x של M והוא 6.',
    options: [
      'כי הנקודה נמצאת באותו גובה כמו L, ולכן שיעור ה־x שלה שווה ל־6.',
      'כי הנקודה נמצאת באותו קו אנכי כמו M, ולכן שיעור ה־x שלה זהה לשיעור ה־x של M והוא 6.',
      'כי כל נקודה שממוקמת מעל M חייבת להיות בעלת שיעור x שווה ל־6.',
      'כי שיעור ה־y של M הוא 1, ולכן מוסיפים לו 5 ומקבלים את שיעור ה־x.',
    ],
  },
  {
    sheetIncludes: 'קוראים שיעורי נקודות',
    headingIncludes: 'שאלה נוספת',
    explanationIndex: 1,
    prompt: 'מדוע שיעור ה־y של הנקודה הוא 6?',
    correct: 'כי הנקודה נמצאת בגובה של L, ולכן שיעור ה־y שלה זהה לשיעור ה־y של L והוא 6.',
    options: [
      'כי הנקודה נמצאת בגובה של L, ולכן שיעור ה־y שלה זהה לשיעור ה־y של L והוא 6.',
      'כי הנקודה נמצאת באותו קו אנכי כמו M, ולכן שיעור ה־y שלה שווה ל־6.',
      'כי שיעור ה־x שלה הוא 6 ולכן גם שיעור ה־y חייב להיות 6.',
      'כי כל נקודה ברביע הראשון שנמצאת גבוה מ־M חייבת להיות בגובה 6.',
    ],
  },
  {
    sheetIncludes: 'נקודות שעל הצירים',
    headingIncludes: 'נקודה מיוחדת',
    explanationIndex: 0,
    prompt: 'מדוע רק ראשית הצירים נמצאת גם על ציר x וגם על ציר y?',
    correct: 'כי על ציר x שיעור y הוא 0 ועל ציר y ערך x הוא 0, ולכן נקודה שעל שני הצירים יחד חייבת להיות (0,0).',
    options: [
      'כי על ציר x שיעור y הוא 0 ועל ציר y ערך x הוא 0, ולכן נקודה שעל שני הצירים יחד חייבת להיות (0,0).',
      'כי בכל נקודה על אחד הצירים שני השיעורים שווים זה לזה.',
      'כי כל נקודה ששיעור ה־x שלה 0 נמצאת גם על ציר x וגם על ציר y.',
      'כי ראשית הצירים היא הנקודה היחידה ששני השיעורים שלה חיוביים.',
    ],
  },
  {
    sheetIncludes: 'משלימים שיעור חסר ודפוסים',
    headingIncludes: 'ג. דפוס: (2,1)',
    explanationIndex: 0,
    prompt: 'איזה כלל מתאר את כל הנקודות בדפוס (2,1), (4,2), (6,3), (8,4)?',
    correct: 'בכל נקודה ערך ה־x גדול פי 2 משיעור ה־y.',
    options: [
      'בכל נקודה שיעור ה־y גדול פי 2 מערך ה־x.',
      'בכל נקודה ערך ה־x גדול ב־1 משיעור ה־y.',
      'בכל נקודה ערך ה־x גדול פי 2 משיעור ה־y.',
      'בכל נקודה ההפרש בין ערך ה־x לשיעור ה־y נשאר קבוע.',
    ],
  },
  {
    sheetIncludes: 'משלימים שיעור חסר ודפוסים',
    headingIncludes: 'ה. „מעל ציר',
    explanationIndex: 0,
    prompt: 'מדוע „מעל ציר x ומימין לציר y” מתאים להרבה נקודות ולא לנקודה אחת?',
    correct: 'כי התנאים אומרים רק ש־x>0 ו־y>0, ויש הרבה זוגות סדורים שונים שמקיימים את שניהם.',
    options: [
      'כי התנאים אומרים רק ש־x>0 ו־y>0, ויש הרבה זוגות סדורים שונים שמקיימים את שניהם.',
      'כי בכל נקודה ברביע הראשון ערך ה־x ושיעור ה־y חייבים להיות שווים.',
      'כי כל הנקודות שמעל ציר x נמצאות על ציר y.',
      'כי מספיק לדעת רק את שיעור ה־y כדי לקבוע נקודה יחידה.',
    ],
  },
];

function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function explanationBlanks(card: HTMLElement): HTMLElement[] {
  return Array.from(card.querySelectorAll<HTMLElement>('li'))
    .filter((item) => normalizedText(item).startsWith('ההסבר:'))
    .map((item) => item.querySelector<HTMLElement>('.blank'))
    .filter((blank): blank is HTMLElement => Boolean(blank));
}

function syncFromBlank(binding: ExplanationBinding): void {
  const value = (binding.blank.textContent || '').trim();
  for (const radio of binding.radios) {
    radio.checked = value !== '' && radio.value === value;
    radio.disabled =
      binding.blank.dataset['lmsState'] === 'correct' ||
      binding.blank.dataset['lmsState'] === 'locked';
  }
  binding.fieldset.dataset['lmsState'] = binding.blank.dataset['lmsState'] || 'empty';
}

function bindExplanation(
  blank: HTMLElement,
  spec: ExplanationSpec,
  ordinal: number,
): ExplanationBinding | null {
  if (blank.dataset['lmsExplanationChoice'] === 'ready') return null;
  if (!spec.options.includes(spec.correct) || spec.options.length !== 4) return null;

  blank.dataset['lmsExplanationChoice'] = 'ready';
  blank.dataset['lmsAnswers'] = JSON.stringify([spec.correct]);
  blank.classList.add('lms-explanation-proxy');
  blank.hidden = true;

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'lms-explanation-options no-print';
  fieldset.setAttribute('aria-label', spec.prompt);

  const legend = document.createElement('legend');
  legend.textContent = spec.prompt;
  fieldset.append(legend);

  const radios: HTMLInputElement[] = [];
  const name = 'lms-explanation-' + String(ordinal);
  spec.options.forEach((option, index) => {
    const label = document.createElement('label');
    label.className = 'lms-explanation-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = name;
    radio.value = option;
    radio.setAttribute('aria-label', 'אפשרות ' + String(index + 1) + ': ' + option);
    const text = document.createElement('span');
    text.textContent = option;
    label.append(radio, text);
    fieldset.append(label);
    radios.push(radio);
  });

  blank.insertAdjacentElement('beforebegin', fieldset);

  const onChange: EventListener = () => {
    const selected = radios.find((radio) => radio.checked)?.value || '';
    blank.textContent = selected;
    blank.dispatchEvent(new Event('input', { bubbles: true }));
  };
  radios.forEach((radio) => radio.addEventListener('change', onChange));

  const binding: ExplanationBinding = {
    blank,
    fieldset,
    radios,
    onChange,
    observer: new MutationObserver(() => undefined),
  };
  binding.observer.disconnect();
  binding.observer = new MutationObserver(() => syncFromBlank(binding));
  binding.observer.observe(blank, {
    attributes: true,
    attributeFilter: ['data-lms-state'],
    childList: true,
    characterData: true,
    subtree: true,
  });
  syncFromBlank(binding);
  return binding;
}

/** Adds four-option, misconception-aware LMS adaptations to reviewed explanation prompts. */
export function hydrateDigitalExplanationChoices(root: ParentNode): () => void {
  const bindings: ExplanationBinding[] = [];
  const sheetText = normalizedText(root.querySelector('.sheet'));
  let ordinal = 0;

  for (const spec of SPECS) {
    if (!sheetText.includes(spec.sheetIncludes)) continue;
    const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((candidate) =>
      normalizedText(candidate.querySelector('h3')).includes(spec.headingIncludes),
    );
    if (!card) continue;
    const blanks = explanationBlanks(card);
    const blank = blanks[spec.explanationIndex];
    if (!blank) continue;
    ordinal += 1;
    const binding = bindExplanation(blank, spec, ordinal);
    if (binding) bindings.push(binding);
  }

  return () => {
    for (const binding of bindings) {
      binding.observer.disconnect();
      binding.radios.forEach((radio) => radio.removeEventListener('change', binding.onChange));
      binding.fieldset.remove();
      binding.blank.hidden = false;
      binding.blank.classList.remove('lms-explanation-proxy');
      delete binding.blank.dataset['lmsExplanationChoice'];
    }
  };
}
