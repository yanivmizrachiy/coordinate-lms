import {
  HEBREW_DIRECTION,
  move,
  type Direction,
} from '../lib/coordinateMath';

export const OWN_ENCRYPTED_ROUTE = 'own-encrypted-route';

interface RouteBinding {
  observer: MutationObserver;
  targets: HTMLElement[];
  proxy: HTMLElement;
  onInput: EventListener;
}

function integerValue(raw: string): number | null {
  const value = raw.trim();
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function directionValue(raw: string): Direction | null {
  const normalized = raw.trim().replace(/\s+/g, ' ');
  return HEBREW_DIRECTION[normalized] || null;
}

export function ownEncryptedRouteMatches(values: readonly string[]): boolean {
  if (values.length !== 6) return false;
  const startX = integerValue(values[0] || '');
  const startY = integerValue(values[1] || '');
  const steps = integerValue(values[2] || '');
  const direction = directionValue(values[3] || '');
  const endX = integerValue(values[4] || '');
  const endY = integerValue(values[5] || '');

  if (
    startX === null ||
    startY === null ||
    steps === null ||
    direction === null ||
    endX === null ||
    endY === null
  ) {
    return false;
  }

  if (startX !== 2 || startY < 0 || startY > 6 || steps <= 0) return false;

  const endpoint = move({ x: startX, y: startY }, direction, steps);
  if (
    endpoint.x < 0 || endpoint.x > 8 ||
    endpoint.y < 0 || endpoint.y > 6
  ) {
    return false;
  }

  return endX === endpoint.x && endY === endpoint.y;
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

export function hydrateDigitalEncryptedRoutePredicate(root: ParentNode): () => void {
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
        heading.includes('מסלול משלכם') &&
        text.includes('נקודת התחלה D') &&
        text.includes('רחוקה מציר y 2 יחידות') &&
        text.includes('פקודת תנועה משלכם') &&
        text.includes('התחנה שאליה הגעתם')
      );
    },
  );
  if (!card) return () => undefined;

  const pairTargets = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank'));
  const commandItem = Array.from(card.querySelectorAll<HTMLElement>('li')).find(
    (candidate) => normalizedText(candidate).includes('פקודת תנועה משלכם'),
  );
  const amount = commandItem?.querySelector<HTMLElement>(
    '.blank[data-missing="number"]',
  );
  const direction = commandItem?.querySelector<HTMLElement>(
    '.blank[data-missing="direction"]',
  );
  const targets = amount && direction
    ? [pairTargets[0], pairTargets[1], amount, direction, pairTargets[2], pairTargets[3]]
        .filter((target): target is HTMLElement => Boolean(target))
    : [];

  if (
    targets.length !== 6 ||
    targets.some((target) => target.dataset['lmsGroup'])
  ) {
    return () => undefined;
  }

  const groupId = OWN_ENCRYPTED_ROUTE + '-page37';
  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify([
    'predicate:' + OWN_ENCRYPTED_ROUTE,
  ]);
  proxy.setAttribute(
    'aria-label',
    'בדיקה מתמטית של נקודת התחלה, פקודת תנועה והתחנה שנגזרת ממנה',
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

  const binding: RouteBinding = {
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

export function encryptedRoutePredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): string | null {
  return pageNumber === 37 && /^p37-q(?:1[7-9]|2[0-2])$/.test(targetId)
    ? OWN_ENCRYPTED_ROUTE
    : null;
}
