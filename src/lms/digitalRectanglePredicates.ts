export const OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK =
  'own-axis-aligned-rectangle-with-work' as const;

function normalizedText(node: Element | null): string {
  return (node?.textContent || '')
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

function sideLength(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number | null {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  if (nearlyEqual(dx, 0) === nearlyEqual(dy, 0)) return null;
  return dx + dy;
}

function correctDifferenceExpression(
  raw: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): boolean {
  const horizontal = nearlyEqual(y1, y2) && !nearlyEqual(x1, x2);
  const high = horizontal ? Math.max(x1, x2) : Math.max(y1, y2);
  const low = horizontal ? Math.min(x1, x2) : Math.min(y1, y2);
  const operands = subtractionOperands(raw);
  return Boolean(
    operands &&
    nearlyEqual(operands[0], high) &&
    nearlyEqual(operands[1], low),
  );
}

/**
 * Page 53 asks the learner to choose any non-square rectangle whose sides are
 * parallel to the axes, then show both side calculations and compute P and S.
 * This validates the mathematical relationship among all 16 learner fields;
 * it never substitutes a model rectangle.
 */
export function ownAxisAlignedRectangleWithWorkMatches(
  values: readonly string[],
): boolean {
  if (values.length !== 16) return false;

  const coordinates = values.slice(0, 8).map(finiteNumber);
  if (coordinates.some((value) => value === null)) return false;
  const [ax, ay, bx, by, cx, cy, dx, dy] = coordinates as [
    number, number, number, number, number, number, number, number,
  ];

  const coordinateValues = [ax, ay, bx, by, cx, cy, dx, dy];
  if (coordinateValues.some((value) => !Number.isInteger(value))) return false;
  for (let index = 0; index < coordinateValues.length; index += 2) {
    const x = coordinateValues[index]!;
    const y = coordinateValues[index + 1]!;
    if (x < 0 || x > 8 || y < 0 || y > 6) return false;
  }

  const ab = sideLength(ax, ay, bx, by);
  const bc = sideLength(bx, by, cx, cy);
  if (ab === null || bc === null) return false;

  const abHorizontal = nearlyEqual(ay, by);
  const bcHorizontal = nearlyEqual(by, cy);
  if (abHorizontal === bcHorizontal) return false;

  // A-B-C-D must be consecutive vertices, not merely the same point set.
  if (!nearlyEqual(dx, ax + (cx - bx)) || !nearlyEqual(dy, ay + (cy - by))) {
    return false;
  }
  if (nearlyEqual(ab, bc)) return false; // "האורך גדול מהרוחב" excludes a square.

  const abExpression = values[8] || '';
  const abResult = finiteNumber(values[9] || '');
  const abFinal = finiteNumber(values[10] || '');
  const bcExpression = values[11] || '';
  const bcResult = finiteNumber(values[12] || '');
  const bcFinal = finiteNumber(values[13] || '');
  const perimeter = finiteNumber(values[14] || '');
  const area = finiteNumber(values[15] || '');

  return correctDifferenceExpression(abExpression, ax, ay, bx, by) &&
    abResult !== null &&
    abFinal !== null &&
    nearlyEqual(abResult, ab) &&
    nearlyEqual(abFinal, ab) &&
    correctDifferenceExpression(bcExpression, bx, by, cx, cy) &&
    bcResult !== null &&
    bcFinal !== null &&
    nearlyEqual(bcResult, bc) &&
    nearlyEqual(bcFinal, bc) &&
    perimeter !== null &&
    area !== null &&
    nearlyEqual(perimeter, 2 * (ab + bc)) &&
    nearlyEqual(area, ab * bc);
}

export function rectanglePredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): typeof OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK | null {
  return pageNumber === 53 && /^p53-q(?:1[3-9]|2[0-8])$/.test(targetId)
    ? OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK
    : null;
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

/** Adds one atomic LMS-only checker to the learner-created rectangle task. */
export function hydrateDigitalRectanglePredicates(root: ParentNode): () => void {
  if ((root as Node).nodeType === 9) return () => undefined;
  const proxyHost = root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  const card = Array.from(root.querySelectorAll<HTMLElement>('.q-card')).find((candidate) => {
    const heading = normalizedText(candidate.querySelector('h3'));
    const text = normalizedText(candidate);
    return heading.includes('סמנו מלבן משלכם') &&
      text.includes('מלבן ABCD') &&
      text.includes('האורך שלו גדול מהרוחב');
  });
  if (!card) return () => undefined;

  const coordinates = Array.from(card.querySelectorAll<HTMLElement>('.pair-blank'));
  const sideWork = Array.from(
    card.querySelectorAll<HTMLElement>('.calc-pair .blank[data-missing="number"]'),
  );
  const finalMeasures = Array.from(
    card.querySelectorAll<HTMLElement>('.calc-final .blank[data-missing="number"]'),
  );
  const targets = [...coordinates, ...sideWork, ...finalMeasures];
  if (coordinates.length !== 8 || sideWork.length !== 6 || finalMeasures.length !== 2) {
    return () => undefined;
  }
  if (targets.some((target) => target.dataset['lmsGroup'])) return () => undefined;

  const groupId = OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK;
  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify([
    `predicate:${OWN_AXIS_ALIGNED_RECTANGLE_WITH_WORK}`,
  ]);
  proxy.setAttribute(
    'aria-label',
    'בדיקה מתמטית של המלבן שנבחר, חישובי הצלעות, ההיקף והשטח',
  );
  proxyHost.append(proxy);

  const onInput: EventListener = () => syncProxy(proxy, targets);
  for (const target of targets) {
    target.dataset['lmsGroup'] = groupId;
    target.addEventListener('input', onInput);
  }

  const observer = new MutationObserver(() => mirrorGroupState(proxy, targets));
  observer.observe(proxy, { attributes: true, attributeFilter: ['data-lms-state'] });
  syncProxy(proxy, targets);

  return () => {
    observer.disconnect();
    for (const target of targets) target.removeEventListener('input', onInput);
    proxy.remove();
  };
}
