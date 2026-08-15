export const DESCRIBED_SQUARE_OTHER_VERTICES = 'described-square-other-vertices';

interface SquareVertexBinding {
  observer: MutationObserver;
  targets: HTMLElement[];
  proxy: HTMLElement;
  onInput: EventListener;
}

function parseIntegerPoint(raw: string): string | null {
  const match = raw
    .trim()
    .replace(/\s+/g, '')
    .match(/^\(?([+-]?\d+)[,،]([+-]?\d+)\)?$/);
  if (!match?.[1] || !match[2]) return null;
  return `${Number(match[1])},${Number(match[2])}`;
}

export function describedSquareOtherVerticesMatch(
  values: readonly string[],
): boolean {
  if (values.length !== 3) return false;
  const points = values.map(parseIntegerPoint);
  if (points.some((point) => point === null)) return false;
  const actual = new Set(points as string[]);
  if (actual.size !== 3) return false;
  return ['4,2', '4,5', '1,5'].every((point) => actual.has(point));
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

export function hydrateDigitalSquareVertexPredicate(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;

  const proxyHost =
    root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find(
    (candidate) => {
      const heading = normalizedText(candidate.querySelector('h3'));
      const text = normalizedText(candidate);
      return (
        heading.includes('ריבוע מתיאור') &&
        text.includes('קודקוד שמאלי־תחתון') &&
        text.includes('(1,2)') &&
        text.includes('אורך הצלע 3 יחידות') &&
        text.includes('כתבו את שלושת הקודקודים האחרים')
      );
    },
  );
  if (!card) return () => undefined;

  const row = Array.from(card.querySelectorAll<HTMLElement>('li')).find(
    (candidate) => candidate.querySelectorAll('.blank').length === 3,
  );
  if (!row) return () => undefined;

  const targets = Array.from(row.querySelectorAll<HTMLElement>('.blank'));
  if (
    targets.length !== 3 ||
    targets.some((target) => target.dataset['lmsGroup'])
  ) {
    return () => undefined;
  }

  const groupId = DESCRIBED_SQUARE_OTHER_VERTICES + '-page57';
  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify([
    'predicate:' + DESCRIBED_SQUARE_OTHER_VERTICES,
  ]);
  proxy.setAttribute(
    'aria-label',
    'בדיקה של שלושת קודקודי הריבוע האחרים ללא תלות בסדר',
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

  const binding: SquareVertexBinding = {
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

export function squareVertexPredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): string | null {
  return pageNumber === 57 && /^p57-q[789]$/.test(targetId)
    ? DESCRIBED_SQUARE_OTHER_VERTICES
    : null;
}
