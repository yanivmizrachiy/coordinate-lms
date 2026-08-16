interface ExplanationSpec {
  headingIncludes: string;
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
    headingIncludes: 'ו. בנקודה (2,4)',
    prompt: 'מדוע העובדה ששיעור y גדול ב־2 מערך x וגם גדול ממנו פי 2 אינה נכונה לכל נקודה?',
    correct: 'כי חיבור 2 וכפל ב־2 הן פעולות שונות; כש־x שווה 2 שתיהן נותנות 4, אבל לא לכל ערך x.',
    options: [
      'כי חיבור 2 וכפל ב־2 הן פעולות שונות; כש־x שווה 2 שתיהן נותנות 4, אבל לא לכל ערך x.',
      'כי בכל נקודה ברביע הראשון שיעור y תמיד כפול מערך x.',
      'כי אם שיעור y גדול ב־2 מערך x, הוא תמיד גם גדול ממנו פי 2.',
      'כי הקשר בין x ל־y נקבע רק לפי המרחק של הנקודה מראשית הצירים.',
    ],
  },
  {
    headingIncludes: 'ה. נקודה שמרחקה זהה',
    prompt: 'מדוע בנקודה שמרחקה זהה משני הצירים שני השיעורים חייבים להיות שווים?',
    correct: 'כי המרחק מציר y הוא ערך x והמרחק מציר x הוא שיעור y; מרחקים שווים מחייבים x ו־y שווים.',
    options: [
      'כי המרחק מציר y הוא ערך x והמרחק מציר x הוא שיעור y; מרחקים שווים מחייבים x ו־y שווים.',
      'כי בכל נקודה ברביע הראשון ערך x ושיעור y שווים.',
      'כי המרחק משני הצירים נקבע רק מערך x.',
      'כי שתי נקודות באותו גובה תמיד נמצאות במרחק שווה משני הצירים.',
    ],
  },
  {
    headingIncludes: 'ה. המסלול הקצר',
    prompt: 'מדוע המסלול הקצר מהנקודה M הוא אל ציר y ובכמה הוא קצר יותר?',
    correct: 'כי M נמצאת במרחק 3 מציר y ובמרחק 5 מציר x, ולכן הדרך לציר y קצרה ב־2 יחידות.',
    options: [
      'כי M נמצאת במרחק 3 מציר y ובמרחק 5 מציר x, ולכן הדרך לציר y קצרה ב־2 יחידות.',
      'כי M נמצאת במרחק 5 מציר y ובמרחק 3 מציר x, ולכן הדרך לציר x קצרה ב־2 יחידות.',
      'כי המרחק מכל נקודה אל ציר y תמיד קטן מהמרחק אל ציר x.',
      'כי מחברים את שני שיעורי הנקודה ומחלקים את הסכום ב־2.',
    ],
  },
  {
    headingIncludes: 'ו. האם יכולות להיות שתי נקודות שונות',
    prompt: 'מדוע לא יכולות להיות שתי נקודות שונות עם אותו שיעור x וגם אותו שיעור y?',
    correct: 'לא. אותו ערך x ואותו שיעור y יוצרים אותו זוג סדור, ולכן זו אותה נקודה ולא שתי נקודות שונות.',
    options: [
      'לא. אותו ערך x ואותו שיעור y יוצרים אותו זוג סדור, ולכן זו אותה נקודה ולא שתי נקודות שונות.',
      'כן. מספיק ששמות הנקודות שונים כדי שמיקומן יהיה שונה.',
      'כן. אותו ערך x קובע שהנקודות שונות גם אם שיעור y זהה.',
      'לא. שתי נקודות שונות חייבות תמיד להיות על שני צירים שונים.',
    ],
  },
  {
    headingIncludes: 'ד. הקיפו את הקודקוד הרביעי',
    prompt: 'מדוע (2,5) הוא הקודקוד הרביעי של המלבן?',
    correct: 'כי הקודקוד הרביעי צריך ערך x כמו A ושיעור y כמו C, ולכן שיעוריו (2,5).',
    options: [
      'כי הקודקוד הרביעי צריך ערך x כמו A ושיעור y כמו C, ולכן שיעוריו (2,5).',
      'כי הקודקוד הרביעי צריך להחליף בין השיעורים של B ולכן הוא (2,7).',
      'כי בכל מלבן כל ארבעת הקודקודים חייבים להיות בעלי אותו ערך x.',
      'כי הקודקוד הרביעי מתקבל מחיבור שני השיעורים של A ושל C.',
    ],
  },
];

function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function explanationBlank(card: HTMLElement): HTMLElement | null {
  const item = Array.from(card.querySelectorAll<HTMLElement>('li')).find((candidate) =>
    normalizedText(candidate).startsWith('ההסבר:'),
  );
  return item?.querySelector<HTMLElement>('.blank') || null;
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
  if (spec.options.length !== 4 || !spec.options.includes(spec.correct)) return null;

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
  const name = 'lms-explanation-extension-' + String(ordinal);
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

/** Adds reviewed four-option LMS adaptations to the remaining fixed explanation prompts. */
export function hydrateDigitalExplanationExtensions(root: ParentNode): () => void {
  const bindings: ExplanationBinding[] = [];
  let ordinal = 0;

  for (const spec of SPECS) {
    const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((candidate) =>
      normalizedText(candidate.querySelector('h3')).includes(spec.headingIncludes),
    );
    if (!card) continue;
    const blank = explanationBlank(card);
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
      delete binding.blank.dataset['lmsAnswers'];
    }
  };
}
