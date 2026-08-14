export type DigitalGroupRule = 'distinct-coordinate-pairs';

interface PredicateBinding {
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

export function evaluateDigitalGroupRule(
  rule: DigitalGroupRule,
  values: readonly string[],
): boolean {
  if (rule === 'distinct-coordinate-pairs') {
    if (values.length !== 4) return false;
    const numbers = values.map(finiteNumber);
    if (numbers.some((value) => value === null)) return false;
    const [x1, y1, x2, y2] = numbers as [number, number, number, number];

    // The workbook is about the first quadrant/axes: negative coordinates do
    // not satisfy the learning context of this task.
    if (numbers.some((value) => (value as number) < 0)) return false;

    // There is no single model answer. Any two points satisfying both
    // inequalities are mathematically correct.
    return x1 !== x2 && y1 !== y2;
  }

  return false;
}

function normalizedText(node: Element | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

function syncProxy(
  proxy: HTMLElement,
  targets: readonly HTMLElement[],
): void {
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

/**
 * Adds LMS-only mathematical grading to canonical worksheet targets.
 * Printable source markup is never changed. Matching is based on the stable
 * canonical prompt text, not a page number, so reordering pages cannot bind the
 * rule to another question.
 *
 * The four visible coordinate blanks remain the learner's interaction. A hidden
 * LMS proxy combines them into one logical answer, so scoring and attempts are
 * attached to the mathematical task rather than treating four coordinates as
 * four unrelated questions.
 */
export function hydrateDigitalPredicates(root: ParentNode): () => void {
  const bindings: PredicateBinding[] = [];

  // The coverage generator deliberately receives a Document. Its persisted
  // target-order snapshot stays canonical while runtime-only proxy targets are
  // being introduced; coverage support for logical group targets is added as a
  // separate audited change rather than silently renumbering every later target.
  if ((root as Node).nodeType === 9) return () => undefined;

  const proxyHost = root.querySelector<HTMLElement>('.sheet') ||
    (root instanceof HTMLElement ? root : null);
  if (!proxyHost) return () => undefined;

  for (const card of root.querySelectorAll<HTMLElement>('.q-card')) {
    const heading = normalizedText(card.querySelector('h3'));
    if (
      !heading.includes('תנו דוגמה לשתי נקודות') ||
      !heading.includes('ערך ה־x שלהן שונה') ||
      !heading.includes('שיעור ה־y שלהן שונה')
    ) {
      continue;
    }

    const targets = Array.from(
      card.querySelectorAll<HTMLElement>('.pair-blank'),
    );
    if (targets.length !== 4) continue;
    if (proxyHost.querySelector('.lms-group-proxy[data-lms-group="distinct-coordinate-pairs"]')) continue;

    const proxy = document.createElement('span');
    proxy.className = 'blank lms-group-proxy';
    proxy.hidden = true;
    proxy.dataset['lmsGroup'] = 'distinct-coordinate-pairs';
    proxy.dataset['lmsAnswers'] = JSON.stringify([
      'predicate:distinct-coordinate-pairs',
    ]);
    proxy.setAttribute(
      'aria-label',
      'בדיקה מתמטית של שתי הנקודות שנבחרו',
    );

    // Append after every canonical answer target so existing pN-qM IDs cannot
    // shift when a digital-only logical target is introduced.
    proxyHost.append(proxy);

    const onInput: EventListener = () => {
      syncProxy(proxy, targets);
    };
    for (const target of targets) {
      target.addEventListener('input', onInput);
      target.dataset['lmsGroup'] = 'distinct-coordinate-pairs';
    }

    const observer = new MutationObserver(() => {
      mirrorGroupState(proxy, targets);
    });
    observer.observe(proxy, {
      attributes: true,
      attributeFilter: ['data-lms-state'],
    });

    syncProxy(proxy, targets);
    bindings.push({ observer, targets, proxy, onInput });
  }

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
