export const PHONE_SAME_COLUMN_WITH_DISTANCE =
  'phone-same-column-with-distance' as const;
export const HALL_SEAT_ABOVE_NOA_WITH_DISTANCE =
  'hall-seat-above-noa-with-distance' as const;
export const DELIVERY_SAME_STREET_WITH_DISTANCE_WORK =
  'delivery-same-street-with-distance-work' as const;

export type DigitalLifeRule =
  | typeof PHONE_SAME_COLUMN_WITH_DISTANCE
  | typeof HALL_SEAT_ABOVE_NOA_WITH_DISTANCE
  | typeof DELIVERY_SAME_STREET_WITH_DISTANCE_WORK;

interface LifeBinding {
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

function finiteInteger(raw: string): number | null {
  const normalized = raw.trim().replace(',', '.');
  if (!/^[+-]?\d+$/.test(normalized)) return null;
  const value = Number(normalized);
  return Number.isSafeInteger(value) ? value : null;
}

function subtractionOperands(raw: string): [number, number] | null {
  const normalized = raw
    .trim()
    .replace(/[−–—]/g, '-')
    .replace(/\s+/g, '');
  const match = normalized.match(/^([+]?\d+)-([+]?\d+)$/);
  if (!match?.[1] || !match[2]) return null;
  return [Number(match[1]), Number(match[2])];
}

function inDefaultGrid(x: number, y: number): boolean {
  return x >= 0 && x <= 8 && y >= 0 && y <= 6;
}

export function phoneSameColumnWithDistanceMatches(
  values: readonly string[],
): boolean {
  if (values.length !== 3) return false;
  const x = finiteInteger(values[0] || '');
  const y = finiteInteger(values[1] || '');
  const distance = finiteInteger(values[2] || '');
  if (x === null || y === null || distance === null || !inDefaultGrid(x, y)) {
    return false;
  }
  return x === 1 && y !== 2 && distance === Math.abs(y - 2);
}

export function hallSeatAboveNoaWithDistanceMatches(
  values: readonly string[],
): boolean {
  if (values.length !== 3) return false;
  const x = finiteInteger(values[0] || '');
  const y = finiteInteger(values[1] || '');
  const distance = finiteInteger(values[2] || '');
  if (x === null || y === null || distance === null || !inDefaultGrid(x, y)) {
    return false;
  }

  const occupiedAbove = (x === 2 && y === 4) || (x === 7 && y === 4);
  return y > 1 && !occupiedAbove && distance === y - 1;
}

export function deliverySameStreetWithDistanceWorkMatches(
  values: readonly string[],
): boolean {
  if (values.length !== 5) return false;
  const x = finiteInteger(values[0] || '');
  const y = finiteInteger(values[1] || '');
  const result = finiteInteger(values[3] || '');
  const finalLength = finiteInteger(values[4] || '');
  if (
    x === null ||
    y === null ||
    result === null ||
    finalLength === null ||
    !inDefaultGrid(x, y)
  ) {
    return false;
  }

  if (y !== 1 || x === 1) return false;
  const highX = Math.max(x, 1);
  const lowX = Math.min(x, 1);
  const distance = highX - lowX;
  const subtraction = subtractionOperands(values[2] || '');
  return Boolean(
    subtraction &&
    subtraction[0] === highX &&
    subtraction[1] === lowX &&
    result === distance &&
    finalLength === distance,
  );
}

export function lifeRuleMatches(
  rule: DigitalLifeRule,
  values: readonly string[],
): boolean {
  if (rule === PHONE_SAME_COLUMN_WITH_DISTANCE) {
    return phoneSameColumnWithDistanceMatches(values);
  }
  if (rule === HALL_SEAT_ABOVE_NOA_WITH_DISTANCE) {
    return hallSeatAboveNoaWithDistanceMatches(values);
  }
  return deliverySameStreetWithDistanceWorkMatches(values);
}

export function lifePredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): DigitalLifeRule | null {
  if (pageNumber === 59 && /^p59-q(?:1[5-7])$/.test(targetId)) {
    return PHONE_SAME_COLUMN_WITH_DISTANCE;
  }
  if (pageNumber === 60 && /^p60-q(?:1[3-5])$/.test(targetId)) {
    return HALL_SEAT_ABOVE_NOA_WITH_DISTANCE;
  }
  if (pageNumber === 62 && /^p62-q(?:1[1-5])$/.test(targetId)) {
    return DELIVERY_SAME_STREET_WITH_DISTANCE_WORK;
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

function createBinding(
  proxyHost: HTMLElement,
  targets: HTMLElement[],
  rule: DigitalLifeRule,
  ariaLabel: string,
): LifeBinding | null {
  if (targets.length === 0 || targets.some((target) => target.dataset['lmsGroup'])) {
    return null;
  }

  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = rule;
  proxy.dataset['lmsAnswers'] = JSON.stringify([`predicate:${rule}`]);
  proxy.setAttribute('aria-label', ariaLabel);
  proxyHost.append(proxy);

  const onInput: EventListener = () => syncProxy(proxy, targets);
  for (const target of targets) {
    target.dataset['lmsGroup'] = rule;
    target.addEventListener('input', onInput);
  }

  const observer = new MutationObserver(() => mirrorGroupState(proxy, targets));
  observer.observe(proxy, { attributes: true, attributeFilter: ['data-lms-state'] });
  syncProxy(proxy, targets);
  return { observer, targets, proxy, onInput };
}

function cardByHeading(root: ParentNode, headingNeedle: string): HTMLElement | null {
  return Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((candidate) =>
    normalizedText(candidate.querySelector('h3')).includes(headingNeedle),
  ) || null;
}

function bindPointAndDistanceCard(
  root: ParentNode,
  proxyHost: HTMLElement,
  headingNeedle: string,
  rule: DigitalLifeRule,
): LifeBinding | null {
  const card = cardByHeading(root, headingNeedle);
  if (!card) return null;

  const coordinates = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank'));
  const numberTargets = Array.from(
    card.querySelectorAll<HTMLElement>('.blank[data-missing="number"]'),
  );
  const distance = numberTargets.at(-1);
  if (coordinates.length !== 2 || !distance) return null;
  return createBinding(
    proxyHost,
    [...coordinates, distance],
    rule,
    'בדיקה מתמטית של הנקודה שנבחרה והמרחק ממנה',
  );
}

function bindDeliveryCard(
  root: ParentNode,
  proxyHost: HTMLElement,
): LifeBinding | null {
  const card = cardByHeading(root, 'תכננו משלוח משלכם');
  if (!card) return null;

  const coordinates = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank'));
  const work = Array.from(
    card.querySelectorAll<HTMLElement>('.calc-pair .blank[data-missing="number"]'),
  );
  if (coordinates.length !== 2 || work.length !== 3) return null;
  return createBinding(
    proxyHost,
    [...coordinates, ...work],
    DELIVERY_SAME_STREET_WITH_DISTANCE_WORK,
    'בדיקה מתמטית של הכתובת שנבחרה, תרגיל החיסור ואורך המסלול',
  );
}

export function hydrateDigitalLifePredicates(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;
  const proxyHost = root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const bindings = [
    bindPointAndDistanceCard(
      root,
      proxyHost,
      'הסדר קובע — גם בטלפון',
      PHONE_SAME_COLUMN_WITH_DISTANCE,
    ),
    bindPointAndDistanceCard(
      root,
      proxyHost,
      'בחרו לעצמכם מקום',
      HALL_SEAT_ABOVE_NOA_WITH_DISTANCE,
    ),
    bindDeliveryCard(root, proxyHost),
  ].filter((binding): binding is LifeBinding => binding !== null);

  return () => {
    for (const binding of bindings) {
      binding.observer.disconnect();
      for (const target of binding.targets) {
        target.removeEventListener('input', binding.onInput);
      }
      binding.proxy.remove();
    }
  };
}
