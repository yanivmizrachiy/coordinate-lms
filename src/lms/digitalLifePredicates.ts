export const PHONE_SAME_COLUMN_WITH_DISTANCE =
  'phone-same-column-with-distance' as const;
export const HALL_SEAT_ABOVE_NOA_WITH_DISTANCE =
  'hall-seat-above-noa-with-distance' as const;

export type DigitalLifeRule =
  | typeof PHONE_SAME_COLUMN_WITH_DISTANCE
  | typeof HALL_SEAT_ABOVE_NOA_WITH_DISTANCE;

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

  // Maps is at (1,2). The new icon must stay in the same column and occupy a
  // different position; its vertical distance is determined by the chosen y.
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

  // Noa is at (5,1). The prompt explicitly asks for a free seat in a row above
  // hers. Existing occupied seats on rows above are Guy (2,4) and Uri (7,4).
  const occupiedAbove = (x === 2 && y === 4) || (x === 7 && y === 4);
  return y > 1 && !occupiedAbove && distance === y - 1;
}

export function lifeRuleMatches(
  rule: DigitalLifeRule,
  values: readonly string[],
): boolean {
  return rule === PHONE_SAME_COLUMN_WITH_DISTANCE
    ? phoneSameColumnWithDistanceMatches(values)
    : hallSeatAboveNoaWithDistanceMatches(values);
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

function bindLifeCard(
  root: ParentNode,
  proxyHost: HTMLElement,
  headingNeedle: string,
  rule: DigitalLifeRule,
): LifeBinding | null {
  const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((candidate) =>
    normalizedText(candidate.querySelector('h3')).includes(headingNeedle),
  );
  if (!card) return null;

  const coordinates = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank'));
  const distances = Array.from(
    card.querySelectorAll<HTMLElement>('.blank[data-missing="number"]'),
  );
  const targets = [...coordinates, ...distances];
  if (coordinates.length !== 2 || distances.length !== 1 || targets.length !== 3) {
    return null;
  }
  if (targets.some((target) => target.dataset['lmsGroup'])) return null;

  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = rule;
  proxy.dataset['lmsAnswers'] = JSON.stringify([`predicate:${rule}`]);
  proxy.setAttribute('aria-label', 'בדיקה מתמטית של הנקודה שנבחרה והמרחק ממנה');
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

/** Adds atomic LMS-only grading to the two real-life point-choice tasks. */
export function hydrateDigitalLifePredicates(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;
  const proxyHost = root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const bindings = [
    bindLifeCard(
      root,
      proxyHost,
      'הסדר קובע — גם בטלפון',
      PHONE_SAME_COLUMN_WITH_DISTANCE,
    ),
    bindLifeCard(
      root,
      proxyHost,
      'בחרו לעצמכם מקום',
      HALL_SEAT_ABOVE_NOA_WITH_DISTANCE,
    ),
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
