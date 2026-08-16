export const SUSPECT_X_FIVE_LABEL_PAIR = 'suspect-x-five-label-pair';

interface SuspectBinding {
  observer: MutationObserver;
  targets: HTMLElement[];
  proxy: HTMLElement;
  onInput: EventListener;
}

function normalizedLetter(raw: string): string | null {
  const letter = raw.trim().toUpperCase();
  return /^[A-F]$/.test(letter) ? letter : null;
}

export function suspectXFiveLabelPairMatches(
  values: readonly string[],
): boolean {
  if (values.length !== 2) return false;
  const first = normalizedLetter(values[0] || '');
  const second = normalizedLetter(values[1] || '');
  if (!first || !second || first === second) return false;
  return [first, second].sort().join('|') === 'B|C';
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

export function hydrateDigitalSuspectPredicate(root: ParentNode): () => void {
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
        heading.includes('סיבוב 1') &&
        text.includes('שיעור ה־x שווה 5') &&
        text.includes('לרמז הראשון מתאימות שתי נקודות בלבד')
      );
    },
  );
  if (!card) return () => undefined;

  const row = Array.from(card.querySelectorAll<HTMLElement>('li')).find(
    (candidate) =>
      normalizedText(candidate).includes(
        'לרמז הראשון מתאימות שתי נקודות בלבד',
      ),
  );
  if (!row) return () => undefined;

  const targets = Array.from(
    row.querySelectorAll<HTMLElement>('.blank[data-missing="letter"]'),
  );
  if (
    targets.length !== 2 ||
    targets.some((target) => target.dataset['lmsGroup'])
  ) {
    return () => undefined;
  }

  const groupId = SUSPECT_X_FIVE_LABEL_PAIR + '-page45';
  const proxy = document.createElement('span');
  proxy.className = 'blank lms-group-proxy';
  proxy.hidden = true;
  proxy.dataset['lmsGroup'] = groupId;
  proxy.dataset['lmsAnswers'] = JSON.stringify([
    'predicate:' + SUSPECT_X_FIVE_LABEL_PAIR,
  ]);
  proxy.setAttribute(
    'aria-label',
    'בדיקה מתמטית של שתי הנקודות שמקיימות x שווה 5, ללא תלות בסדר',
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

  const binding: SuspectBinding = {
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

export function suspectPredicateRuleForCoverage(
  pageNumber: number,
  targetId: string,
): string | null {
  return pageNumber === 45 && /^p45-q[23]$/.test(targetId)
    ? SUSPECT_X_FIVE_LABEL_PAIR
    : null;
}
