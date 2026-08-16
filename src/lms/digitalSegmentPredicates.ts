import type { DigitalGroupRule } from './digitalPredicates';

export const HORIZONTAL_LENGTH_FOUR_WITH_WORK =
  'horizontal-segment-length-4-with-work' as const;

type SegmentCoverageRule =
  | DigitalGroupRule
  | typeof HORIZONTAL_LENGTH_FOUR_WITH_WORK;

interface SegmentBinding {
  observer: MutationObserver;
  targets: HTMLElement[];
  proxy: HTMLElement;
  onInput: EventListener;
}

function normalizedText(node: Element | null): string {
  return (node?.textContent || '')
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizedContext(context: string): string {
  return context
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function finiteNumber(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 1e-12;
}

function subtractionOperands(raw: string): [number, number] | null {
  const normalized = raw
    .trim()
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, '');
  const match = normalized.match(
    /^([+]?(?:\d+\.?\d*|\.\d+))-([+]?(?:\d+\.?\d*|\.\d+))$/,
  );
  if (!match?.[1] || !match[2]) return null;
  const left = finiteNumber(match[1]);
  const right = finiteNumber(match[2]);
  return left === null || right === null ? null : [left, right];
}

/**
 * Page 47 lets the learner choose any horizontal KL of length 4. The answer is
 * valid only when the chosen endpoints, the written subtraction, its result,
 * and the stated length all agree. No model coordinates are invented.
 */
export function horizontalLengthFourWithWorkMatches(
  values: readonly string[],
): boolean {
  if (values.length !== 7) return false;
  const coordinates = values.slice(0, 4).map(finiteNumber);
  if (coordinates.some((value) => value === null)) return false;
  const [x1, y1, x2, y2] = coordinates as [number, number, number, number];
  if ([x1, y1, x2, y2].some((value) => value < 0)) return false;
  if (!nearlyEqual(y1, y2) || nearlyEqual(x1, x2)) return false;

  const highX = Math.max(x1, x2);
  const lowX = Math.min(x1, x2);
  if (!nearlyEqual(highX - lowX, 4)) return false;

  const subtraction = subtractionOperands(values[4] || '');
  if (!subtraction) return false;
  if (!nearlyEqual(subtraction[0], highX) || !nearlyEqual(subtraction[1], lowX)) {
    return false;
  }

  const result = finiteNumber(values[5] || '');
  const finalLength = finiteNumber(values[6] || '');
  return result !== null &&
    finalLength !== null &&
    nearlyEqual(result, 4) &&
    nearlyEqual(finalLength, 4);
}

export function segmentPredicateRuleForCoverage(
  context: string,
  inputType: string,
  pageNumber?: number,
  targetId?: string,
): SegmentCoverageRule | null {
  if (
    pageNumber === 47 &&
    targetId !== undefined &&
    /^p47-q(?:1[6-9]|2[0-2])$/.test(targetId)
  ) {
    return HORIZONTAL_LENGTH_FOUR_WITH_WORK;
  }

  if (inputType !== 'ordered-pair-coordinate') return null;
  const text = normalizedContext(context);

  if (
    text.includes('שתי נקודות') &&
    text.includes('זהה') &&
    /שיעור(?: ה־)?\s*y/.test(text)
  ) {
    return 'same-y-coordinate-pairs';
  }

  if (
    text.includes('שתי נקודות') &&
    text.includes('זהה') &&
    /שיעור(?: ה־)?\s*x/.test(text)
  ) {
    return 'same-x-coordinate-pairs';
  }

  if (
    text.includes('קטע EF') &&
    text.includes('מקביל לציר y') &&
    text.includes('שיעורי קצותיו')
  ) {
    return 'same-x-coordinate-pairs';
  }

  return null;
}

function rawValues(targets: readonly HTMLElement[]): string[] {
  return targets.map((target) => (target.textContent || '').trim());
}

function syncProxy(proxy: HTMLElement, targets: readonly HTMLElement[]): void {
  proxy.textContent = rawValues(targets).join('|');
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

function createProxy(
  proxyHost: HTMLElement,
  targets: HTMLElement[],
  groupId: string,
  ariaLabel: string,
  onInput: EventListener,
): SegmentBinding | null {
  if (targets.length === 0 || targets.some((target) => target.dataset['lmsGroup'])) return null;

  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.setAttribute('aria-label', ariaLabel);
  proxyHost.append(proxy);

  for (const target of targets) {
    target.addEventListener('input', onInput);
    target.dataset['lmsGroup'] = groupId;
  }

  const observer = new MutationObserver(() => mirrorGroupState(proxy, targets));
  observer.observe(proxy, { attributes: true, attributeFilter: ['data-lms-state'] });
  return { observer, targets, proxy, onInput };
}

function bindPredicateGroup(
  proxyHost: HTMLElement,
  targets: HTMLElement[],
  rule: DigitalGroupRule,
  ordinal: number,
): SegmentBinding | null {
  if (targets.length !== 4) return null;
  const groupId = `segment-${rule}-${ordinal}`;
  let proxy: HTMLElement | null = null;
  const onInput: EventListener = () => {
    if (proxy) syncProxy(proxy, targets);
  };
  const binding = createProxy(
    proxyHost,
    targets,
    groupId,
    'בדיקה מתמטית של שני קצות הקטע לפי תנאי השאלה',
    onInput,
  );
  if (!binding) return null;
  proxy = binding.proxy;
  proxy.dataset['lmsAnswers'] = JSON.stringify([`predicate:${rule}`]);
  syncProxy(proxy, targets);
  return binding;
}

function bindLengthFourWithWork(
  proxyHost: HTMLElement,
  targets: HTMLElement[],
  ordinal: number,
): SegmentBinding | null {
  if (targets.length !== 7) return null;
  const groupId = `segment-${HORIZONTAL_LENGTH_FOUR_WITH_WORK}-${ordinal}`;
  let proxy: HTMLElement | null = null;
  const onInput: EventListener = () => {
    if (proxy) syncProxy(proxy, targets);
  };
  const binding = createProxy(
    proxyHost,
    targets,
    groupId,
    'בדיקה מתמטית של קטע KL, תרגיל החיסור והאורך 4',
    onInput,
  );
  if (!binding) return null;
  proxy = binding.proxy;
  proxy.dataset['lmsAnswers'] = JSON.stringify([
    `predicate:${HORIZONTAL_LENGTH_FOUR_WITH_WORK}`,
  ]);
  syncProxy(proxy, targets);
  return binding;
}

/** Runtime binding for learner-created axis-parallel segments. */
export function hydrateDigitalSegmentPredicates(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;
  const proxyHost = root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const bindings: SegmentBinding[] = [];
  let ordinal = 0;

  for (const card of root.querySelectorAll<HTMLElement>('.q-card')) {
    const heading = normalizedText(card.querySelector('h3'));
    const cardText = normalizedText(card);
    if (
      !heading.includes('סמנו קטע משלכם') ||
      !cardText.includes('קטע KL') ||
      !cardText.includes('אורכו 4')
    ) continue;

    const coordinates = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank'));
    const calculation = Array.from(
      card.querySelectorAll<HTMLElement>('.calc-pair .blank[data-missing="number"]'),
    );
    const targets = [...coordinates, ...calculation];
    if (coordinates.length !== 4 || calculation.length !== 3 || targets.length !== 7) continue;
    ordinal += 1;
    const binding = bindLengthFourWithWork(proxyHost, targets, ordinal);
    if (binding) bindings.push(binding);
  }

  for (const item of root.querySelectorAll<HTMLElement>('li')) {
    const targets = Array.from(item.querySelectorAll<HTMLElement>('.pair-blank'));
    if (targets.length !== 4) continue;
    const rule = segmentPredicateRuleForCoverage(
      normalizedText(item),
      'ordered-pair-coordinate',
    );
    if (!rule || rule === HORIZONTAL_LENGTH_FOUR_WITH_WORK) continue;
    ordinal += 1;
    const binding = bindPredicateGroup(proxyHost, targets, rule, ordinal);
    if (binding) bindings.push(binding);
  }

  return () => {
    for (const binding of bindings) {
      binding.observer.disconnect();
      for (const target of binding.targets) target.removeEventListener('input', binding.onInput);
      binding.proxy.remove();
    }
  };
}
