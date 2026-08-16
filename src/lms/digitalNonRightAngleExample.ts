export const NONNEGATIVE_NUMBER_NOT_FOUR = 'nonnegative-number-not-four';

const X_ANSWER = JSON.stringify(['predicate:nonnegative-number']);
const Y_ANSWER = JSON.stringify(['predicate:' + NONNEGATIVE_NUMBER_NOT_FOUR]);
const RELATION_ANSWER = JSON.stringify(['שונה']);

interface RestoredAnswer {
  target: HTMLElement;
  previous: string | undefined;
}

function normalizedText(node: Element | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

/**
 * On the canonical page B=(2,4) and BA is vertical. Therefore angle ABC is
 * right exactly when BC is horizontal, i.e. C has y=4. Any first-quadrant
 * point with y different from 4 is a valid non-right-angle example.
 */
export function hydrateNonRightAngleExample(root: ParentNode): () => void {
  const restored: RestoredAnswer[] = [];
  const items = Array.from(root.querySelectorAll<HTMLElement>('li')).filter((item) => {
    const text = normalizedText(item);
    return (
      text.includes('הזווית ABC אינה ישרה') &&
      text.includes('שיעור ה־y שלה') &&
      text.includes('הנקודה B')
    );
  });

  for (const item of items) {
    const coordinates = Array.from(item.querySelectorAll<HTMLElement>('.pair-blank'));
    const relation = item.querySelector<HTMLElement>('.blank[data-missing="relation"]');
    if (coordinates.length !== 2 || !relation) continue;

    const assignments: Array<[HTMLElement, string]> = [
      [coordinates[0]!, X_ANSWER],
      [coordinates[1]!, Y_ANSWER],
      [relation, RELATION_ANSWER],
    ];

    for (const [target, answer] of assignments) {
      restored.push({ target, previous: target.dataset['lmsAnswers'] });
      target.dataset['lmsAnswers'] = answer;
    }
  }

  return () => {
    for (const { target, previous } of restored) {
      if (previous === undefined) delete target.dataset['lmsAnswers'];
      else target.dataset['lmsAnswers'] = previous;
    }
  };
}
