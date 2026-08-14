type Expected = string | readonly string[];

function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function answerTargets(container: ParentNode): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>('.pair-blank, .word-blank, .blank'),
  ).filter(
    (target) =>
      !target.classList.contains('lms-group-proxy') &&
      !target.classList.contains('lms-choice-proxy') &&
      !target.classList.contains('lms-grid-answer'),
  );
}

function setAnswers(target: HTMLElement, expected: Expected): void {
  if (target.dataset['lmsAnswers']) return;
  const answers = Array.isArray(expected) ? [...expected] : [expected];
  target.dataset['lmsAnswers'] = JSON.stringify(answers);
}

function annotateContainer(
  root: ParentNode,
  needle: string,
  answers: readonly Expected[],
): boolean {
  const candidates = root.querySelectorAll<HTMLElement>(
    'li, p, .rule-box, .calc-ltr, .calc-final',
  );
  for (const candidate of candidates) {
    if (!normalizedText(candidate).includes(needle)) continue;
    const targets = answerTargets(candidate);
    if (targets.length < answers.length) continue;
    answers.forEach((answer, index) => setAnswers(targets[index]!, answer));
    return true;
  }
  return false;
}

function pageContains(root: ParentNode, needle: string): boolean {
  return normalizedText(root.querySelector('.sheet')).includes(needle);
}

function canonicalNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 1e12) / 1e12);
}

/** Derive only a literal, one-step arithmetic expression printed beside one
 * answer blank. No algebraic guessing and no prose inference. */
function hydrateSimpleArithmetic(root: ParentNode): void {
  for (const candidate of root.querySelectorAll<HTMLElement>('.calc-ltr, .calc-final')) {
    const targets = answerTargets(candidate);
    if (targets.length !== 1 || targets[0]!.dataset['lmsAnswers']) continue;
    const text = normalizedText(candidate).replace(/,/g, '.');
    const match = text.match(/(-?\d+(?:\.\d+)?)\s*([+−-])\s*(-?\d+(?:\.\d+)?)/);
    if (!match?.[1] || !match[2] || !match[3]) continue;
    const left = Number(match[1]);
    const right = Number(match[3]);
    if (!Number.isFinite(left) || !Number.isFinite(right)) continue;
    const result = match[2] === '+' ? left + right : left - right;
    setAnswers(targets[0]!, canonicalNumber(result));
  }
}

function hydratePlotPractice(root: ParentNode): void {
  if (!pageContains(root, 'מסמנים ובודקים')) return;
  annotateContainer(root, 'מי הנקודה הגבוהה ביותר?', ['R']);
  annotateContainer(root, 'מי הנקודה הימנית ביותר?', ['Q']);
  annotateContainer(root, 'מי הנקודה השמאלית ביותר?', ['P']);
  annotateContainer(root, 'הנקודה הנמוכה ביותר היא', ['Q', '3']);
  annotateContainer(root, 'הנקודה R רחוקה מציר x', ['6']);
}

function hydrateHiddenDrawing(root: ParentNode): void {
  if (!pageContains(root, 'ציור נסתר')) return;
  annotateContainer(root, 'מה קיבלתם?', [['מפרשית', 'סירה']]);
  annotateContainer(root, 'תחתית הגוף', ['x']);
  annotateContainer(root, 'התורן מקביל לציר y', ['4']);
  annotateContainer(root, 'הנקודה הגבוהה ביותר בציור', ['4', '6']);
  annotateContainer(root, 'קצה המפרש', ['7']);
}

function hydrateColorDecode(root: ParentNode): void {
  if (!pageContains(root, 'פענוח צבעוני')) return;
  annotateContainer(root, 'מה קיבלתם?', ['חץ']);
  annotateContainer(root, 'הסמל הוא חץ שמצביע', [['גדל', 'עולה']]);
  annotateContainer(root, 'התא הנמוך ביותר שצבעתם', ['3', '0']);
  annotateContainer(root, 'כל תאי הגזע', ['3']);
  annotateContainer(root, 'לשני קצות בסיס הראש', [['שווה', 'זהה']]);
  annotateContainer(root, 'חוד החץ הוא התא הגבוה ביותר', ['3', '5']);
  annotateContainer(root, 'ההפרש בין שיעור ה־y של החוד', ['5']);
}

function hydrateEncryptedRoute(root: ParentNode): void {
  if (!pageContains(root, 'המסלול המוצפן')) return;
  annotateContainer(root, 'שלוש האותיות יחד הן ה', ['מילה']);
  annotateContainer(root, 'מסלול 1 נגמר בתחנה', ['5', '4', 'ק']);
  annotateContainer(root, 'מסלול 2 נגמר בתחנה', ['5', '1', ['למטה', 'מטה']]);
  annotateContainer(root, 'מסלול 3 חושף בלוח', ['ם', '6', '5']);
  annotateContainer(root, 'כתבו את שלוש האותיות', ['קסם']);
  annotateContainer(root, 'האות האמצעית במילה', ['ס', '2']);
  annotateContainer(root, 'לתחנה של מסלול 1 ולתחנה של מסלול 2', [['שווה', 'זהה']]);
  annotateContainer(root, 'התחנה של מסלול 3 ממוקמת', [['מימין', 'ימינה']]);
  annotateContainer(root, 'התחנה של מסלול 3 רחוקה מציר x', ['5']);
}

function hydrateCoordinateMaze(root: ParentNode): void {
  if (!pageContains(root, 'מבוך הקואורדינטות')) return;
  annotateContainer(root, 'צעד למעלה או', [['למטה', 'מטה'], 'y']);
  annotateContainer(root, 'המסלול מתחיל בנקודה', ['0', '0', '6', '4']);
  annotateContainer(root, 'בכל צעד ימינה או שמאלה', [['נשאר זהה', 'זהה', 'קבוע']]);
  annotateContainer(root, 'בכל צעד למעלה או', [['למטה', 'מטה']]);
  annotateContainer(root, 'שיעור ה־x הוא 2 אפשר לעבור', ['3']);
  annotateContainer(root, 'אפשר לעבור רק בשיעור y שקטן מ־3', ['5']);
  annotateContainer(root, 'מספר הצעדים במסלול שסימנתם', [['גדול', 'גדול יותר']]);
}

function hydrateCoordinateSafe(root: ParentNode): void {
  if (!pageContains(root, 'כספת הקואורדינטות')) return;
  annotateContainer(root, 'התוצאה של תרגיל', ['חיסור']);
  annotateContainer(root, 'שיעור ה־x של הנקודה C', ['7', 'y']);
  annotateContainer(root, 'הנקודה D(0,5) ממוקמת על ציר', ['y', '0']);
  annotateContainer(root, 'שיעור ה־x נשאר', [['זהה', 'קבוע']]);
  annotateContainer(root, 'כתבו את ארבע הספרות', ['4705']);
  annotateContainer(root, 'הספרה הקטנה ביותר בקוד', ['y']);
  annotateContainer(root, 'בכל נקודה שממוקמת על ציר y', ['0']);
  annotateContainer(root, 'בכל נקודה ששיעור ה־y שלה הוא 0', ['x']);
}

function hydrateSuspectPoint(root: ParentNode): void {
  if (!pageContains(root, 'הנקודה החשודה')) return;
  annotateContainer(root, 'ולכן היא הנקודה ה', ['חשודה']);
  annotateContainer(root, 'הרמז השני פוסל', [['קטן', 'קטן יותר']]);
  annotateContainer(root, 'הקיפו את הנקודה שנשארה', ['5', '3']);
  annotateContainer(root, 'לאותו קו אנכי יש שיעור', ['x']);
  annotateContainer(root, 'הקו האנכי שעובר דרך הנקודה', ['7']);
  annotateContainer(root, 'ערך ה־x שלה גדול יותר', [['מימין', 'ימינה'], '7', '2']);
  annotateContainer(root, 'שיעור ה־y שלה', [['גדול', 'גדול יותר']]);
}

function hydrateParkRoute(root: ParentNode): void {
  if (!pageContains(root, 'מסלולים במפת הפארק')) return;
  annotateContainer(root, 'פנס שממוקם על ציר y', ['0', '3']);
  annotateContainer(root, 'הפנס ממוקם מתחת לנדנדה', ['2']);
  annotateContainer(root, 'הנקודה שסימנתם רחוקה מציר y', ['3']);
  annotateContainer(root, '2 יחידות ימינה ואחר כך 2 יחידות', [['למעלה', 'מעלה']]);
}

function hydrateMissingCoordinatePatterns(root: ParentNode): void {
  if (!pageContains(root, 'שיעור חסר ודפוסים')) return;

  annotateContainer(root, 'A(', ['6']);
  annotateContainer(root, 'C(3,', ['5']);
  annotateContainer(root, 'E(', ['4', '0']);
  annotateContainer(root, 'G(', ['0', '2']);

  const patternCard = Array.from(root.querySelectorAll<HTMLElement>('.q-card'))
    .find((card) => normalizedText(card.querySelector('h3')).includes('דפוס של שיעורים זהים'));
  if (patternCard) {
    const targets = answerTargets(patternCard);
    const expected: Expected[] = ['5', '5', '6', '6', ['x = y', 'y = x', 'שיעור x שווה לשיעור y', 'שיעור y שווה לשיעור x']];
    expected.forEach((answer, index) => {
      if (targets[index]) setAnswers(targets[index]!, answer);
    });
  }

  const seriesCard = Array.from(root.querySelectorAll<HTMLElement>('.q-card'))
    .find((card) => normalizedText(card.querySelector('h3')).includes('משלימים סדרה'));
  if (seriesCard) {
    const targets = answerTargets(seriesCard);
    const expected: Expected[] = ['4', '5', '5', '5', ['y', 'שיעור y'], ['x', 'שיעור x']];
    expected.forEach((answer, index) => {
      if (targets[index]) setAnswers(targets[index]!, answer);
    });
  }

  const extraCard = Array.from(root.querySelectorAll<HTMLElement>('.q-card'))
    .find((card) => normalizedText(card.querySelector('h3')).includes('שאלה נוספת'));
  if (extraCard) {
    const targets = answerTargets(extraCard);
    const expected: Expected[] = ['3', '5', '5', '4', '7', '3', '1', '6', '5', '5'];
    expected.forEach((answer, index) => {
      if (targets[index]) setAnswers(targets[index]!, answer);
    });
  }
}

/**
 * Adds reviewed LMS-only answers that are stated or deterministically implied by
 * the canonical printable task. Matching is by canonical wording, never by page
 * number. Simple printed arithmetic is derived directly from the expression.
 */
export function hydrateDigitalCanonicalAnswers(root: ParentNode): void {
  hydrateSimpleArithmetic(root);
  hydratePlotPractice(root);
  hydrateHiddenDrawing(root);
  hydrateColorDecode(root);
  hydrateEncryptedRoute(root);
  hydrateCoordinateMaze(root);
  hydrateCoordinateSafe(root);
  hydrateSuspectPoint(root);
  hydrateParkRoute(root);
  hydrateMissingCoordinatePatterns(root);
}
