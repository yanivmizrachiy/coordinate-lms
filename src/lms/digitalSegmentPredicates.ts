import type { DigitalGroupRule } from './digitalPredicates';

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

export function segmentPredicateRuleForCoverage(
  context: string,
  inputType: string,
): DigitalGroupRule | null {
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

function bindGroup(
  proxyHost: HTMLElement,
  targets: HTMLElement[],
  rule: DigitalGroupRule,
  ordinal: number,
): SegmentBinding | null {
  if (targets.length !== 4 || targets.some((target) => target.dataset['lmsGroup'])) return null;

  const groupId = `segment-${rule}-${ordinal}`;
  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify([`predicate:${rule}`]);
  proxy.setAttribute('aria-label', 'בדיקה מתמטית של שני קצות הקטע לפי תנאי השאלה');
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

/** Runtime binding for learner-created axis-parallel segments. */
export function hydrateDigitalSegmentPredicates(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;
  const proxyHost = root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const bindings: SegmentBinding[] = [];
  let ordinal = 0;
  for (const item of root.querySelectorAll<HTMLElement>('li')) {
    const targets = Array.from(item.querySelectorAll<HTMLElement>('.pair-blank'));
    if (targets.length !== 4) continue;
    const rule = segmentPredicateRuleForCoverage(
      normalizedText(item),
      'ordered-pair-coordinate',
    );
    if (!rule) continue;
    ordinal += 1;
    const binding = bindGroup(proxyHost, targets, rule, ordinal);
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
