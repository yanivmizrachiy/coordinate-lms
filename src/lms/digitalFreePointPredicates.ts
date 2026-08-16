export const EQUAL_POSITIVE_COORDINATE_POINT = 'equal-positive-coordinate-point';

interface FreePointBinding {
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

export function equalPositiveCoordinatePointMatches(
  values: readonly string[],
): boolean {
  if (values.length !== 2) return false;
  const x = finiteNumber(values[0] || '');
  const y = finiteNumber(values[1] || '');
  return x !== null && y !== null && x > 0 && y > 0 && x === y;
}

function normalizedText(node: Element | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function syncProxy(proxy: HTMLElement, targets: readonly HTMLElement[]): void {
  proxy.textContent = targets
    .map((target) => (target.textContent || '').trim())
    .join('|');
  proxy.dispatchEvent(new Event('input', { bubbles: true }));
}

function mirrorGroupState(
  proxy: HTMLElement,
  targets: readonly HTMLElement[],
): void {
  const state = proxy.dataset['lmsState'] || 'empty';
  for (const target of targets) {
    target.dataset['lmsGroupState'] = state;
    if (['correct', 'wrong', 'locked', 'missing'].includes(state)) {
      target.dataset['lmsState'] = state;
    }
    if (state === 'correct' || state === 'locked') {
      target.contentEditable = 'false';
    }
  }
}

export function hydrateDigitalFreePointPredicates(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;

  const proxyHost =
    root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const item = Array.from(root.querySelectorAll<HTMLElement>('li')).find(
    (candidate) => {
      const text = normalizedText(candidate);
      return (
        text.includes('כתבו נקודה ששני שיעוריה זהים') &&
        text.includes('אינה ממוקמת על אף ציר')
      );
    },
  );
  if (!item) return () => undefined;

  const targets = Array.from(
    item.querySelectorAll<HTMLElement>('.pair-blank'),
  );
  if (
    targets.length !== 2 ||
    targets.some((target) => target.dataset['lmsGroup'])
  ) {
    return () => undefined;
  }

  const groupId = EQUAL_POSITIVE_COORDINATE_POINT + '-free-point';
  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify([
    'predicate:' + EQUAL_POSITIVE_COORDINATE_POINT,
  ]);
  proxy.setAttribute(
    'aria-label',
    'בדיקה מתמטית של נקודה ששני שיעוריה זהים ואינה על הצירים',
  );
  proxyHost.append(proxy);

  const onInput: EventListener = () => syncProxy(proxy, targets);
  for (const target of targets) {
    target.addEventListener('input', onInput);
    target.dataset['lmsGroup'] = groupId;
  }

  const observer = new MutationObserver(() => mirrorGroupState(proxy, targets));
  observer.observe(proxy, {
    attributes: true,
    attributeFilter: ['data-lms-state'],
  });
  syncProxy(proxy, targets);

  const binding: FreePointBinding = {
    observer,
    targets,
    proxy,
    onInput,
  };

  return () => {
    binding.observer.disconnect();
    for (const target of binding.targets) {
      target.removeEventListener('input', binding.onInput);
      delete target.dataset['lmsGroup'];
      delete target.dataset['lmsGroupState'];
    }
    binding.proxy.remove();
  };
}

export function freePointPredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): string | null {
  return pageNumber === 58 && /^p58-q[67]$/.test(targetId)
    ? EQUAL_POSITIVE_COORDINATE_POINT
    : null;
}
