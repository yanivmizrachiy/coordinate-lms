export type DigitalGroupRule =
  | 'distinct-coordinate-pairs'
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

export function evaluateDigitalGroupRule(
  rule: DigitalGroupRule,
  values: readonly string[],
): boolean {
  if (rule === 'nonnegative-number') {
    if (values.length !== 1) return false;
    const value = finiteNumber(values[0] || '');
    return value !== null && value >= 0;
  }

  if (rule === 'same-weight-package-pairs') {
    return matchesTwoUnorderedPairs(values, ['BC', 'DE']);
  }

  if (rule === 'same-price-package-pairs') {
    return matchesTwoUnorderedPairs(values, ['AB', 'DF']);
  }

  if (rule === 'distinct-coordinate-pairs') {
    if (values.length !== 4) return false;
    const numbers = numericValues(values);
    if (!numbers || numbers.some((value) => value < 0)) return false;
    const [x1, y1, x2, y2] = numbers as [number, number, number, number];
    return x1 !== x2 && y1 !== y2;
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

function isCustomRuleContext(context: string): boolean {
  return (
    context.includes('בחרו מספר והשלימו כלל') ||
    context.includes('כתבו שתי נקודות שמתאימות לכלל שלכם') ||
    context.includes('בשתי הנקודות שסימנתם, ההפרש בין שיעור ה־y ובין ערך ה־x')
  );
}

/** The coverage report asks this same rule resolver instead of inventing a
 * second answer policy. It marks canonical fields covered by one reviewed
 * group predicate while runtime still grades the complete group atomically. */
export function predicateRuleForCoverage(
  context: string,
  inputType: string,
): DigitalGroupRule | null {
  if (isCustomRuleContext(context)) return 'custom-y-equals-x-plus-k';
  if (
    inputType === 'ordered-pair-coordinate' &&
    context.includes('תנו דוגמה לשתי נקודות') &&
    context.includes('ערך ה־x שלהן שונה') &&
    context.includes('שיעור ה־y שלהן שונה')
  ) {
    return 'distinct-coordinate-pairs';
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

    if (heading.includes('כלל משלכם')) {
      const cardText = normalizedText(card);
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
