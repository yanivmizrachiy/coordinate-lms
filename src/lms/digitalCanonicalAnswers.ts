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
  const candidates = root.querySelectorAll<HTMLElement>('li, p, .rule-box');
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

/**
 * Adds reviewed LMS-only answers that are stated or deterministically implied by
 * the canonical printable task. Matching is by canonical wording, never by page
 * number, so page insertion/reordering cannot attach an answer to another task.
 * No printable source node is added, removed or rewritten.
 */
export function hydrateDigitalCanonicalAnswers(root: ParentNode): void {
  hydratePlotPractice(root);
  hydrateHiddenDrawing(root);
  hydrateColorDecode(root);
  hydrateEncryptedRoute(root);
  hydrateCoordinateSafe(root);
  hydrateSuspectPoint(root);
  hydrateParkRoute(root);
}
