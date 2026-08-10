import { loadAnswerKey } from './repository';

const TARGET_SELECTOR = '.blank, .word-blank, .pair-blank';
const CONTAINER_SELECTOR = 'li, tr, p, .completion-sentence, .q-card';

function targetsIn(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TARGET_SELECTOR));
}

function qid(target: HTMLElement): string {
  return target.dataset['lmsQid'] || '';
}

/**
 * Removes learner-created / teacher-judgment-only responses from the computer
 * assignment without touching canonical workbook HTML. The same content still
 * exists in the printed sheet and is restored by print CSS.
 *
 * If a teacher later supplies a real answer key for a target, it is not hidden:
 * the decision is based on the effective runtime key, not a hard-coded list.
 */
export function hideUngradedDigitalTargets(
  root: ParentNode,
  pageNumber: number,
): () => void {
  let cancelled = false;

  void loadAnswerKey(pageNumber).then((key) => {
    // attachLmsToPage starts its own restore promise before this helper runs.
    // Defer one task so its editable-state restoration finishes first; display
    // hiding is CSS-enforced either way, but this keeps accessibility state
    // deterministic too.
    window.setTimeout(() => {
      if (cancelled) return;

      const targets = targetsIn(root);
      const ungraded = new Set(
        targets.filter((target) => {
          const id = qid(target);
          return id !== '' && (key[id] || []).length === 0;
        }),
      );

      const containers = new Set<HTMLElement>();
      for (const target of ungraded) {
        const container = target.closest<HTMLElement>(CONTAINER_SELECTOR);
        if (container) containers.add(container);
      }

      for (const container of containers) {
        const inside = targetsIn(container);
        if (inside.length > 0 && inside.every((target) => ungraded.has(target))) {
          container.dataset['lmsDigitalSkipped'] = 'true';
          container.setAttribute(
            'aria-label',
            'משימה שאינה נדרשת בגרסה המתוקשבת',
          );
          for (const target of inside) ungraded.delete(target);
        }
      }

      // A mixed prompt can contain both a deterministic blank and a free-choice
      // blank. Keep the useful prompt, hide only the ungraded response location,
      // and make the digital exception explicit to the learner.
      for (const target of ungraded) {
        target.dataset['lmsDigitalSkipped'] = 'true';
        target.contentEditable = 'false';
        target.setAttribute('tabindex', '-1');
        target.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.className = 'lms-digital-skip-label no-print';
        label.textContent = 'לא נדרש במתוקשב';
        label.setAttribute('role', 'note');
        target.insertAdjacentElement('afterend', label);
      }
    }, 0);
  }).catch(() => {
    // Failure to load a key must not hide anything. The LMS engine already
    // disables submission when its own state restore fails.
  });

  return () => {
    cancelled = true;
  };
}
