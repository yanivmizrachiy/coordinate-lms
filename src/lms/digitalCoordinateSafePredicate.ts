export const AXIS_POINT_MOVED_UP_FOUR = 'axis-point-moved-up-four';

interface CoordinateSafeBinding {
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

export function axisPointMovedUpFourMatches(values: readonly string[]): boolean {
  if (values.length !== 5) return false;
  const numbers = values.map(finiteNumber);
  if (numbers.some((value) => value === null)) return false;

  const [gx, gy, movedX, movedY, distance] = numbers as [
    number,
    number,
    number,
    number,
    number,
  ];

  return (
    gx >= 0 &&
    gx <= 8 &&
    gy === 0 &&
    movedX === gx &&
    movedY === 4 &&
    distance === 4
  );
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

export function hydrateDigitalCoordinateSafePredicate(
  root: ParentNode,
): () => void {
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
        heading.includes('סמנו נקודה משלכם') &&
        text.includes('נקודה G') &&
        text.includes('שממוקמת על ציר x') &&
        text.includes('4 יחידות למעלה') &&
        text.includes('המרחק שלה מציר x')
      );
    },
  );
  if (!card) return () => undefined;

  const pairTargets = Array.from(
    card.querySelectorAll<HTMLElement>('.pair-blank'),
  );
  const distanceTarget = card.querySelector<HTMLElement>(
    '.blank[data-missing="number"]',
  );
  const targets = distanceTarget ? [...pairTargets, distanceTarget] : [];
  if (
    targets.length !== 5 ||
    targets.some((target) => target.dataset['lmsGroup'])
  ) {
    return () => undefined;
  }

  const groupId = AXIS_POINT_MOVED_UP_FOUR + '-page42';
  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify([
    'predicate:' + AXIS_POINT_MOVED_UP_FOUR,
  ]);
  proxy.setAttribute(
    'aria-label',
    'בדיקה מתמטית של G על ציר x, הזזה 4 יחידות למעלה והמרחק הנגזר',
  );
  proxyHost.append(proxy);

  const onInput: EventListener = () => syncProxy(proxy, targets);
  for (const target of targets) {
    target.addEventListener('input', onInput);
    target.dataset['lmsGroup'] = groupId;
  }

  const observer = new MutationObserver(() =>
    mirrorGroupState(proxy, targets),
  );
  observer.observe(proxy, {
    attributes: true,
    attributeFilter: ['data-lms-state'],
  });
  syncProxy(proxy, targets);

  const binding: CoordinateSafeBinding = {
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

export function coordinateSafePredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): string | null {
  return pageNumber === 42 && /^p42-q1[2-6]$/.test(targetId)
    ? AXIS_POINT_MOVED_UP_FOUR
    : null;
}
