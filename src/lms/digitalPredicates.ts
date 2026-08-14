export type DigitalGroupRule =
  | 'distinct-coordinate-pairs'
  | 'two-distinct-positive-points'
  | 'same-x-coordinate-pairs'
  | 'same-y-coordinate-pairs'
  | 'parallel-through-3-4-points'
  | 'point-above-x-axis'
  | 'point-right-of-y-axis'
  | 'point-on-x-axis'
  | 'point-on-y-axis'
  | 'point-above-and-right'
  | 'point-on-x-right-of-5'
  | 'point-right-of-2-below-6'
  | 'point-y-equals-6'
  | 'point-x-3-between-2-and-5'
  | 'same-weight-package-pairs'
  | 'same-price-package-pairs'
  | 'custom-y-equals-x-plus-k'
  | 'rectangle-missing-opposite-corners'
  | 'rectangle-from-corner-4x3'
  | 'nonnegative-number';

interface PredicateBinding {
  observer: MutationObserver;
  targets: HTMLElement[];
  proxy: HTMLElement;
  onInput: EventListener;
}

function finiteNumber(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function numericValues(values: readonly string[]): number[] | null {
  const numbers = values.map(finiteNumber);
  return numbers.some((value) => value === null)
    ? null
    : numbers as number[];
}

function firstQuadrantPoint(values: readonly string[]): [number, number] | null {
  if (values.length !== 2) return null;
  const numbers = numericValues(values);
  if (!numbers) return null;
  const [x, y] = numbers as [number, number];
  return x >= 0 && y >= 0 ? [x, y] : null;
}

function normalizedLabel(raw: string): string | null {
  const label = raw.trim().toUpperCase();
  return /^[A-F]$/.test(label) ? label : null;
}

function unorderedPairKey(a: string, b: string): string | null {
  const left = normalizedLabel(a);
  const right = normalizedLabel(b);
  if (!left || !right || left === right) return null;
  return [left, right].sort().join('');
}

function matchesTwoUnorderedPairs(
  values: readonly string[],
  expectedPairKeys: readonly string[],
): boolean {
  if (values.length !== 4) return false;
  const first = unorderedPairKey(values[0] || '', values[1] || '');
  const second = unorderedPairKey(values[2] || '', values[3] || '');
  if (!first || !second || first === second) return false;
  return [first, second].sort().join('|') === [...expectedPairKeys].sort().join('|');
}

function coordinateKey(x: number, y: number): string {
  return `${x},${y}`;
}

function coordinateSet(values: readonly string[]): Set<string> | null {
  if (values.length % 2 !== 0) return null;
  const numbers = numericValues(values);
  if (!numbers || numbers.some((value) => value < 0)) return null;
  const set = new Set<string>();
  for (let index = 0; index < numbers.length; index += 2) {
    set.add(coordinateKey(numbers[index]!, numbers[index + 1]!));
  }
  return set.size * 2 === values.length ? set : null;
}

function sameCoordinateSet(actual: Set<string> | null, expected: readonly string[]): boolean {
  if (!actual || actual.size !== expected.length) return false;
  return expected.every((point) => actual.has(point));
}

function sameCoordinatePairRule(
  values: readonly string[],
  coordinate: 'x' | 'y',
): boolean {
  if (values.length !== 4) return false;
  const numbers = numericValues(values);
  if (!numbers || numbers.some((value) => value < 0)) return false;
  const [x1, y1, x2, y2] = numbers as [number, number, number, number];
  if (x1 === x2 && y1 === y2) return false;
  return coordinate === 'x' ? x1 === x2 : y1 === y2;
}

export function evaluateDigitalGroupRule(
  rule: DigitalGroupRule,
  values: readonly string[],
): boolean {
  if (rule === 'nonnegative-number') {
    if (values.length !== 1) return false;
    const value = finiteNumber(values[0] || '');
    return value !== null && value >= 0;
  }

  if (rule === 'same-x-coordinate-pairs') {
    return sameCoordinatePairRule(values, 'x');
  }

  if (rule === 'same-y-coordinate-pairs') {
    return sameCoordinatePairRule(values, 'y');
  }

  if (rule === 'parallel-through-3-4-points') {
    if (values.length !== 4) return false;
    const numbers = numericValues(values);
    if (!numbers || numbers.some((value) => value < 0)) return false;
    const [xForHorizontal, yForHorizontal, xForVertical, yForVertical] = numbers as [number, number, number, number];
    const horizontalPointIsNew = xForHorizontal !== 3 || yForHorizontal !== 4;
    const verticalPointIsNew = xForVertical !== 3 || yForVertical !== 4;
    return yForHorizontal === 4 && horizontalPointIsNew && xForVertical === 3 && verticalPointIsNew;
  }

  if (rule === 'same-weight-package-pairs') {
    return matchesTwoUnorderedPairs(values, ['BC', 'DE']);
  }

  if (rule === 'same-price-package-pairs') {
    return matchesTwoUnorderedPairs(values, ['AB', 'DF']);
  }

  if (rule === 'rectangle-missing-opposite-corners') {
    return sameCoordinateSet(coordinateSet(values), ['1,5', '7,2']);
  }

  if (rule === 'rectangle-from-corner-4x3') {
    const actual = coordinateSet(values);
    return (
      sameCoordinateSet(actual, ['2,1', '6,1', '2,4', '6,4']) ||
      sameCoordinateSet(actual, ['2,1', '5,1', '2,5', '5,5'])
    );
  }

  if (rule === 'distinct-coordinate-pairs') {
    if (values.length !== 4) return false;
    const numbers = numericValues(values);
    if (!numbers || numbers.some((value) => value < 0)) return false;
    const [x1, y1, x2, y2] = numbers as [number, number, number, number];
    return x1 !== x2 && y1 !== y2;
  }

  if (rule === 'two-distinct-positive-points') {
    if (values.length !== 4) return false;
    const numbers = numericValues(values);
    if (!numbers) return false;
    const [x1, y1, x2, y2] = numbers as [number, number, number, number];
    return x1 > 0 && y1 > 0 && x2 > 0 && y2 > 0 && (x1 !== x2 || y1 !== y2);
  }

  if (rule === 'custom-y-equals-x-plus-k') {
    if (values.length !== 6) return false;
    const numbers = numericValues(values);
    if (!numbers) return false;
    const [k, x1, y1, x2, y2, difference] = numbers as [number, number, number, number, number, number];
    if ([x1, y1, x2, y2].some((value) => value < 0)) return false;
    if (x1 === x2 && y1 === y2) return false;
    return y1 - x1 === k && y2 - x2 === k && difference === k;
  }

  const point = firstQuadrantPoint(values);
  if (!point) return false;
  const [x, y] = point;

  switch (rule) {
    case 'point-above-x-axis': return y > 0;
    case 'point-right-of-y-axis': return x > 0;
    case 'point-on-x-axis': return y === 0;
    case 'point-on-y-axis': return x === 0;
    case 'point-above-and-right': return x > 0 && y > 0;
    case 'point-on-x-right-of-5': return y === 0 && x > 5;
    case 'point-right-of-2-below-6': return x > 2 && y < 6;
    case 'point-y-equals-6': return y === 6;
    case 'point-x-3-between-2-and-5': return x === 3 && y > 2 && y < 5;
    default: return false;
  }
}

function normalizedText(node: Element | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function syncProxy(proxy: HTMLElement, targets: readonly HTMLElement[]): void {
  proxy.textContent = targets.map((target) => (target.textContent || '').trim()).join('|');
  proxy.dispatchEvent(new Event('input', { bubbles: true }));
}

function mirrorGroupState(proxy: HTMLElement, targets: readonly HTMLElement[]): void {
  const state = proxy.dataset['lmsState'] || 'empty';
  for (const target of targets) {
    target.dataset['lmsGroupState'] = state;
    if (['correct', 'wrong', 'locked', 'missing'].includes(state)) {
      target.dataset['lmsState'] = state;
    }
    if (state === 'correct' || state === 'locked') target.contentEditable = 'false';
  }
}

function bindGroupPredicate(
  proxyHost: HTMLElement,
  targets: HTMLElement[],
  rule: DigitalGroupRule,
  label: string,
  ordinal: number,
): PredicateBinding | null {
  if (targets.length === 0) return null;
  const groupId = rule + '-' + String(ordinal);
  if (proxyHost.querySelector(`.lms-group-proxy[data-lms-group="${groupId}"]`)) return null;

  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify(['predicate:' + rule]);
  proxy.setAttribute('aria-label', label);
  proxyHost.append(proxy);

  const onInput: EventListener = () => syncProxy(proxy, targets);
  for (const target of targets) {
    target.addEventListener('input', onInput);
    target.dataset['lmsGroup'] = groupId;
  }

  const observer = new MutationObserver(() => mirrorGroupState(proxy, targets));
  observer.observe(proxy, { attributes: true, attributeFilter: ['data-lms-state'] });
  syncProxy(proxy, targets);
  return { observer, targets, proxy, onInput };
}

function pairRuleForContext(context: string): DigitalGroupRule | null {
  if (context.includes('נקודה G') && context.includes('מימין לנקודה B')) {
    return 'point-on-x-right-of-5';
  }
  if (context.includes('נקודה S') && context.includes('מימין לנקודה P') && context.includes('מתחת לנקודה R')) {
    return 'point-right-of-2-below-6';
  }
  if (context.includes('נקודה G') && context.includes('רחוקה מציר x') && context.includes('6 יחידות')) {
    return 'point-y-equals-6';
  }
  if (context.includes('שיעור ה־x שלה כמו של הספסל') && context.includes('מעל הספסל') && context.includes('מתחת לעץ')) {
    return 'point-x-3-between-2-and-5';
  }
  if (context.includes('גם מעל וגם מימין')) return 'point-above-and-right';
  if (context.includes('מעל ציר x')) return 'point-above-x-axis';
  if (context.includes('מימין לציר y')) return 'point-right-of-y-axis';
  if (context.includes('על ציר x')) return 'point-on-x-axis';
  if (context.includes('על ציר y')) return 'point-on-y-axis';
  return null;
}

function sameCoordinateRuleForContext(context: string): DigitalGroupRule | null {
  if (
    context.includes('שתי נקודות') &&
    /שיעור(?: ה־)?x/.test(context) &&
    context.includes('זהה')
  ) return 'same-x-coordinate-pairs';
  if (
    context.includes('שתי נקודות') &&
    /שיעור(?: ה־)?y/.test(context) &&
    context.includes('זהה')
  ) return 'same-y-coordinate-pairs';
  return null;
}

function isParallelThrough34Context(context: string): boolean {
  return context.includes('בינה לבין (3,4)') &&
    context.includes('מקביל לציר x') &&
    context.includes('ולציר y');
}

function isCustomRuleContext(context: string): boolean {
  return (
    context.includes('בחרו מספר והשלימו כלל') ||
    context.includes('כתבו שתי נקודות שמתאימות לכלל שלכם') ||
    context.includes('בשתי הנקודות שסימנתם, ההפרש בין שיעור ה־y ובין ערך ה־x')
  );
}

function isTwoPositivePointsContext(context: string): boolean {
  return context.includes('שתי נקודות שמתאימות לו') ||
    (context.includes('מעל ציר x') && context.includes('מימין לציר y') && context.includes('שתי נקודות'));
}

function rectangleRuleForCoverage(context: string, inputType: string): DigitalGroupRule | null {
  if (inputType !== 'ordered-pair-coordinate') return null;
  if (
    context.includes('שני קודקודים נגדיים הם') &&
    context.includes('(1,2)') &&
    context.includes('(7,5)')
  ) {
    return 'rectangle-missing-opposite-corners';
  }
  if (
    context.includes('כתבו את ארבעת הקודקודים כזוגות סדורים') &&
    context.includes('אורכו 4 יחידות') &&
    context.includes('רוחבו 3 יחידות')
  ) {
    return 'rectangle-from-corner-4x3';
  }
  return null;
}

/** The coverage report asks this same rule resolver instead of inventing a
 * second answer policy. It marks canonical fields covered by one reviewed
 * group predicate while runtime still grades the complete group atomically. */
export function predicateRuleForCoverage(
  context: string,
  inputType: string,
): DigitalGroupRule | null {
  const rectangleRule = rectangleRuleForCoverage(context, inputType);
  if (rectangleRule) return rectangleRule;
  if (isCustomRuleContext(context)) return 'custom-y-equals-x-plus-k';
  if (inputType === 'ordered-pair-coordinate' && isParallelThrough34Context(context)) {
    return 'parallel-through-3-4-points';
  }
  if (inputType === 'ordered-pair-coordinate' && isTwoPositivePointsContext(context)) {
    return 'two-distinct-positive-points';
  }
  if (
    inputType === 'ordered-pair-coordinate' &&
    context.includes('תנו דוגמה לשתי נקודות') &&
    context.includes('ערך ה־x שלהן שונה') &&
    context.includes('שיעור ה־y שלהן שונה')
  ) {
    return 'distinct-coordinate-pairs';
  }
  if (inputType === 'ordered-pair-coordinate') {
    const sameCoordinateRule = sameCoordinateRuleForContext(context);
    if (sameCoordinateRule) return sameCoordinateRule;
  }
  if (inputType.startsWith('text:') && context.includes('באותו משקל')) {
    return 'same-weight-package-pairs';
  }
  if (inputType.startsWith('text:') && context.includes('באותו מחיר')) {
    return 'same-price-package-pairs';
  }
  if (inputType === 'ordered-pair-coordinate') {
    const rule = pairRuleForContext(context);
    if (rule) return rule;
    if (
      (context.includes('כל הנקודות שממוקמות על ציר y') && context.includes('(0,')) ||
      (context.includes('כל הנקודות שממוקמות על ציר x') && context.includes(',0)'))
    ) {
      return 'nonnegative-number';
    }
  }
  return null;
}

/** Adds LMS-only mathematical grading to learner-choice tasks. */
export function hydrateDigitalPredicates(root: ParentNode): () => void {
  const bindings: PredicateBinding[] = [];
  if ((root as Node).nodeType === 9) return () => undefined;

  const proxyHost = root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;
  let ordinal = 0;

  for (const card of root.querySelectorAll<HTMLElement>('.q-card')) {
    const heading = normalizedText(card.querySelector('h3'));
    const cardText = normalizedText(card);

    if (
      heading.includes('מזהים קודקודים') &&
      cardText.includes('שני קודקודים נגדיים הם') &&
      cardText.includes('(1,2)') &&
      cardText.includes('(7,5)')
    ) {
      const targets = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank')).slice(0, 4);
      if (targets.length === 4) {
        ordinal += 1;
        const binding = bindGroupPredicate(
          proxyHost,
          targets,
          'rectangle-missing-opposite-corners',
          'בדיקה מתמטית של שני הקודקודים החסרים במלבן, ללא תלות בסדר',
          ordinal,
        );
        if (binding) bindings.push(binding);
      }
    }

    if (
      heading.includes('בונים מלבן') &&
      cardText.includes('אחד מקודקודיו הוא') &&
      cardText.includes('(2,1)') &&
      cardText.includes('אורכו 4 יחידות') &&
      cardText.includes('רוחבו 3 יחידות')
    ) {
      const targets = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank')).slice(0, 8);
      if (targets.length === 8) {
        ordinal += 1;
        const binding = bindGroupPredicate(
          proxyHost,
          targets,
          'rectangle-from-corner-4x3',
          'בדיקה מתמטית של ארבעת קודקודי המלבן, בכל סדר ובכל אוריינטציה חוקית',
          ordinal,
        );
        if (binding) bindings.push(binding);
      }
    }

    if (
      heading.includes('תנו דוגמה לשתי נקודות') &&
      heading.includes('ערך ה־x שלהן שונה') &&
      heading.includes('שיעור ה־y שלהן שונה')
    ) {
      const targets = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank'));
      if (targets.length === 4) {
        ordinal += 1;
        const binding = bindGroupPredicate(proxyHost, targets, 'distinct-coordinate-pairs', 'בדיקה מתמטית של שתי הנקודות שנבחרו', ordinal);
        if (binding) bindings.push(binding);
      }
    }

    if (isTwoPositivePointsContext(cardText)) {
      const targetRow = Array.from(card.querySelectorAll<HTMLElement>('li')).find((item) =>
        normalizedText(item).includes('שתי נקודות שמתאימות לו'),
      );
      const targets = targetRow
        ? Array.from(targetRow.querySelectorAll<HTMLElement>('.pair-blank'))
        : [];
      if (targets.length === 4 && targets.every((target) => !target.dataset['lmsGroup'])) {
        ordinal += 1;
        const binding = bindGroupPredicate(
          proxyHost,
          targets,
          'two-distinct-positive-points',
          'בדיקה של שתי נקודות שונות שמעל ציר x ומימין לציר y',
          ordinal,
        );
        if (binding) bindings.push(binding);
      }
    }

    if (heading.includes('כלל משלכם')) {
      if (
        cardText.includes('בחרו מספר והשלימו כלל') &&
        cardText.includes('כתבו שתי נקודות שמתאימות לכלל שלכם') &&
        cardText.includes('ההפרש בין שיעור ה־y ובין ערך ה־x')
      ) {
        const targets = Array.from(
          card.querySelectorAll<HTMLElement>('.blank, .pair-blank'),
        ).filter((target) => !target.classList.contains('lms-group-proxy'));
        if (targets.length === 6) {
          ordinal += 1;
          const binding = bindGroupPredicate(
            proxyHost,
            targets,
            'custom-y-equals-x-plus-k',
            'בדיקה מתמטית של הכלל שנבחר, שתי הנקודות וההפרש',
            ordinal,
          );
          if (binding) bindings.push(binding);
        }
      }
    }

    for (const item of card.querySelectorAll<HTMLElement>('li')) {
      const context = normalizedText(item);
      const blanks = Array.from(item.querySelectorAll<HTMLElement>('.blank'));
      let rule: DigitalGroupRule | null = null;
      if (blanks.length === 4 && context.includes('באותו משקל')) rule = 'same-weight-package-pairs';
      else if (blanks.length === 4 && context.includes('באותו מחיר')) rule = 'same-price-package-pairs';
      if (rule) {
        ordinal += 1;
        const binding = bindGroupPredicate(proxyHost, blanks, rule, 'בדיקה של שני זוגות החבילות ללא תלות בסדר הכתיבה', ordinal);
        if (binding) bindings.push(binding);
      }

      const pairBlanks = Array.from(item.querySelectorAll<HTMLElement>('.pair-blank'));
      if (
        pairBlanks.length === 4 &&
        isParallelThrough34Context(context) &&
        pairBlanks.every((target) => !target.dataset['lmsGroup'])
      ) {
        ordinal += 1;
        const binding = bindGroupPredicate(
          proxyHost,
          pairBlanks,
          'parallel-through-3-4-points',
          'בדיקה של שתי נקודות היוצרות דרך (3,4) קטע מקביל ל־x וקטע מקביל ל־y',
          ordinal,
        );
        if (binding) bindings.push(binding);
      }

      const sameCoordinateRule = pairBlanks.length === 4
        ? sameCoordinateRuleForContext(context)
        : null;
      if (sameCoordinateRule && pairBlanks.every((target) => !target.dataset['lmsGroup'])) {
        ordinal += 1;
        const binding = bindGroupPredicate(
          proxyHost,
          pairBlanks,
          sameCoordinateRule,
          sameCoordinateRule === 'same-x-coordinate-pairs'
            ? 'בדיקה מתמטית של שתי נקודות שונות בעלות אותו שיעור x'
            : 'בדיקה מתמטית של שתי נקודות שונות בעלות אותו שיעור y',
          ordinal,
        );
        if (binding) bindings.push(binding);
      }
    }

    for (const pair of card.querySelectorAll<HTMLElement>('.pair')) {
      const container = pair.closest('li') || pair.parentElement;
      const context = normalizedText(container);
      const rule = pairRuleForContext(context);
      const targets = Array.from(pair.querySelectorAll<HTMLElement>('.pair-blank'));
      if (!rule || targets.length !== 2 || targets.some((target) => target.dataset['lmsGroup'])) continue;
      ordinal += 1;
      const binding = bindGroupPredicate(proxyHost, targets, rule, 'בדיקה מתמטית של הזוג הסדור לפי תנאי השאלה', ordinal);
      if (binding) bindings.push(binding);
    }
  }

  for (const item of root.querySelectorAll<HTMLElement>('li')) {
    const context = normalizedText(item);
    const blanks = Array.from(item.querySelectorAll<HTMLElement>('.pair-blank'));
    if (blanks.length !== 1) continue;
    if (
      (context.includes('כל הנקודות שממוקמות על ציר y') && context.includes('(0,')) ||
      (context.includes('כל הנקודות שממוקמות על ציר x') && context.includes(',0)'))
    ) {
      blanks[0]!.dataset['lmsAnswers'] = JSON.stringify(['predicate:nonnegative-number']);
    }
  }

  return () => {
    for (const binding of bindings) {
      binding.observer.disconnect();
      for (const target of binding.targets) target.removeEventListener('input', binding.onInput);
      binding.proxy.remove();
    }
  };
}
