import { armExplicitAnswerCheck } from './liveFeedback';

const TARGET_SELECTOR = '.blank, .word-blank, .pair-blank';

interface CheckUnit {
  targets: HTMLElement[];
  anchor: HTMLElement;
  key: string;
}

function visibleTargets(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTOR)).filter(
    (target) => !target.classList.contains('lms-group-proxy'),
  );
}

function groupTargets(root: ParentNode, groupId: string): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(`[data-lms-group="${CSS.escape(groupId)}"]`),
  ).filter((target) => !target.classList.contains('lms-group-proxy'));
}

function proxyForGroup(root: ParentNode, groupId: string): HTMLElement | null {
  return root.querySelector<HTMLElement>(
    `.lms-group-proxy[data-lms-group="${CSS.escape(groupId)}"]`,
  );
}

function unitForTarget(
  root: ParentNode,
  target: HTMLElement,
  index: number,
): CheckUnit {
  if (target.classList.contains('lms-choice-proxy')) {
    const options = target.previousElementSibling;
    return {
      targets: [target],
      anchor: options instanceof HTMLElement ? options : target,
      key: 'choice-' + String(index),
    };
  }

  const groupId = target.dataset['lmsGroup'];
  if (groupId) {
    const members = groupTargets(root, groupId);
    const last = members.at(-1) || target;
    return {
      targets: members,
      anchor: last.closest<HTMLElement>('.pair') || last,
      key: 'group-' + groupId,
    };
  }

  const pair = target.closest<HTMLElement>('.pair');
  if (pair) {
    return {
      targets: Array.from(pair.querySelectorAll<HTMLElement>('.pair-blank')),
      anchor: pair,
      key: 'pair-' + String(index),
    };
  }

  return {
    targets: [target],
    anchor: target,
    key: 'single-' + String(index),
  };
}

function gradingTargets(root: ParentNode, unit: CheckUnit): HTMLElement[] {
  const groupId = unit.targets.find((target) => target.dataset['lmsGroup'])
    ?.dataset['lmsGroup'];
  if (!groupId) return unit.targets;
  const proxy = proxyForGroup(root, groupId);
  return proxy ? [proxy] : unit.targets;
}

function dispatchExplicitCheck(target: HTMLElement): void {
  armExplicitAnswerCheck();
  target.dispatchEvent(new Event('input', { bubbles: true }));
}

function updateButtonState(
  button: HTMLButtonElement,
  targets: readonly HTMLElement[],
): void {
  const states = targets.map((target) => target.dataset['lmsState'] || 'empty');
  const correct = states.length > 0 && states.every((state) => state === 'correct');
  const locked = states.some((state) => state === 'locked');
  const wrong = states.some((state) => state === 'wrong');

  button.dataset['state'] = correct
    ? 'correct'
    : locked
      ? 'locked'
      : wrong
        ? 'wrong'
        : 'ready';
  button.textContent = correct ? '✓' : 'בדוק';
  button.disabled = correct || locked;
  button.setAttribute(
    'aria-label',
    correct
      ? 'התשובה נכונה'
      : locked
        ? 'התשובה ננעלה לאחר מספר הניסיונות המרבי'
        : 'בדיקת התשובה',
  );
}

function positionGridButton(button: HTMLButtonElement, target: HTMLElement): void {
  if (!target.classList.contains('lms-grid-answer')) return;
  button.classList.add('lms-inline-check--grid');
  button.style.left = target.style.left;
  button.style.top = target.style.top;
}

/**
 * Adds one small explicit check control beside each answer unit. Typing or
 * choosing an answer alone never consumes an attempt. The control reuses the
 * existing LMS input pipeline, so attempts, locking, green feedback, scoring
 * and registered-user persistence all stay in the same grading engine.
 */
export function hydrateInlineAnswerChecks(root: ParentNode): () => void {
  const controls: HTMLButtonElement[] = [];
  const seen = new Set<string>();

  visibleTargets(root).forEach((target, index) => {
    const unit = unitForTarget(root, target, index);
    if (seen.has(unit.key)) return;
    seen.add(unit.key);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lms-inline-check no-print';
    button.textContent = 'בדוק';
    button.dataset['state'] = 'ready';
    button.setAttribute('aria-label', 'בדיקת התשובה');
    button.title = 'בדיקת התשובה';

    if (unit.targets.length === 1) positionGridButton(button, unit.targets[0]!);

    button.addEventListener('click', () => {
      if (button.disabled) return;
      const graders = gradingTargets(root, unit);
      for (const grader of graders) dispatchExplicitCheck(grader);
      window.setTimeout(() => updateButtonState(button, graders), 0);
    });

    if (button.classList.contains('lms-inline-check--grid')) {
      const grid = unit.targets[0]?.closest<HTMLElement>('.coordinate-grid');
      grid?.append(button);
    } else {
      unit.anchor.insertAdjacentElement('afterend', button);
    }

    updateButtonState(button, gradingTargets(root, unit));
    controls.push(button);
  });

  return () => {
    for (const control of controls) control.remove();
  };
}
