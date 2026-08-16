export const AXIS_POINT_MOVED_UP_FOUR = 'axis-point-moved-up-four';
export const POINT_DISTANCE_TWO_FROM_Y_AXIS = 'point-distance-two-from-y-axis';

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

// In the first quadrant, distance from the y-axis is exactly the x-coordinate.
export function pointDistanceTwoFromYAxisMatches(values: readonly string[]): boolean {
  if (values.length !== 2) return false;
  const numbers = values.map(finiteNumber);
  if (numbers.some((value) => value === null)) return false;
  const [x, y] = numbers as [number, number];
  return x === 2 && y >= 0;
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

function bindPredicate(
  proxyHost: HTMLElement,
  targets: HTMLElement[],
  groupId: string,
  predicate: string,
  label: string,
): CoordinateSafeBinding | null {
  if (
    targets.length === 0 ||
    targets.some((target) => target.dataset['lmsGroup'])
  ) {
    return null;
  }

  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify(['predicate:' + predicate]);
  proxy.setAttribute('aria-label', label);
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

  return { observer, targets, proxy, onInput };
}

export function hydrateDigitalCoordinateSafePredicate(
  root: ParentNode,
): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;

  const proxyHost =
    root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const bindings: CoordinateSafeBinding[] = [];

  const movedCard = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find(
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
  if (movedCard) {
    const pairTargets = Array.from(
      movedCard.querySelectorAll<HTMLElement>('.pair-blank'),
    );
    const distanceTarget = movedCard.querySelector<HTMLElement>(
      '.blank[data-missing="number"]',
    );
    const targets = distanceTarget ? [...pairTargets, distanceTarget] : [];
    if (targets.length === 5) {
      const binding = bindPredicate(
        proxyHost,
        targets,
        AXIS_POINT_MOVED_UP_FOUR + '-page42',
        AXIS_POINT_MOVED_UP_FOUR,
        'בדיקה מתמטית של G על ציר x, הזזה 4 יחידות למעלה והמרחק הנגזר',
      );
      if (binding) bindings.push(binding);
    }
  }

  const distanceCard = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find(
    (candidate) => {
      const text = normalizedText(candidate);
      return (
        text.includes('נקודת התחלה D') &&
        text.includes('רחוקה מציר y 2 יחידות')
      );
    },
  );
  if (distanceCard) {
    const targets = Array.from(
      distanceCard.querySelectorAll<HTMLElement>('.pair-blank'),
    ).slice(0, 2);
    if (targets.length === 2) {
      const binding = bindPredicate(
        proxyHost,
        targets,
        POINT_DISTANCE_TWO_FROM_Y_AXIS + '-page37',
        POINT_DISTANCE_TWO_FROM_Y_AXIS,
        'בדיקה מתמטית של נקודה שמרחקה מציר y הוא 2 יחידות',
      );
      if (binding) bindings.push(binding);
    }
  }

  return () => {
    for (const binding of bindings) {
      binding.observer.disconnect();
      for (const target of binding.targets) {
        target.removeEventListener('input', binding.onInput);
        delete target.dataset['lmsGroup'];
        delete target.dataset['lmsGroupState'];
      }
      binding.proxy.remove();
    }
  };
}

export function coordinateSafePredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): string | null {
  if (pageNumber === 42 && /^p42-q1[2-6]$/.test(targetId)) {
    return AXIS_POINT_MOVED_UP_FOUR;
  }
  if (pageNumber === 37 && /^p37-q1[78]$/.test(targetId)) {
    return POINT_DISTANCE_TWO_FROM_Y_AXIS;
  }
  return null;
}
