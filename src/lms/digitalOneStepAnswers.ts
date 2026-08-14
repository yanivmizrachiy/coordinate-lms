function normalizedText(node: Element | ParentNode | null): string {
  return node?.textContent?.replace(/\s+/g, ' ').trim() || '';
}

const MANY_FIRST_QUADRANT_EXPLANATION =
  'כי התנאים אומרים רק ש־x>0 ו־y>0, ויש הרבה זוגות סדורים שונים שמקיימים את שניהם.';

function setSequentialAnswers(item: HTMLElement, answers: readonly string[]): void {
  const targets = Array.from(
    item.querySelectorAll<HTMLElement>('.blank, .pair-blank, .word-blank'),
  ).filter((target) => !target.dataset['lmsAnswers']);
  answers.forEach((answer, index) => {
    const target = targets[index];
    if (target) target.dataset['lmsAnswers'] = JSON.stringify([answer]);
  });
}

function setFirstFreeCoordinatePredicate(item: HTMLElement): void {
  const first = item.querySelector<HTMLElement>('.pair-blank');
  if (first && !first.dataset['lmsAnswers']) {
    first.dataset['lmsAnswers'] = JSON.stringify(['predicate:nonnegative-number']);
  }
}

/** Tiny LMS-only fixes for answers that are literally determined by the canonical sentence or a reviewed digital choice. */
export function hydrateDigitalOneStepAnswers(root: ParentNode): void {
  for (const item of root.querySelectorAll<HTMLElement>('li, p')) {
    const text = normalizedText(item);

    if (text.includes('כדי לקבוע נקודה אחת צריך לדעת גם את ערך ה־x וגם את שיעור ה־')) {
      const blank = item.querySelector<HTMLElement>('.blank[data-missing="letter"]');
      if (blank && !blank.dataset['lmsAnswers']) {
        blank.dataset['lmsAnswers'] = JSON.stringify(['y']);
      }
    }

    if (
      text.includes('ההסבר:') &&
      text.includes('מדוע „מעל ציר x ומימין לציר y” מתאים להרבה נקודות ולא לנקודה אחת?')
    ) {
      const blank = item.querySelector<HTMLElement>('.blank[data-missing="relation"]');
      if (blank && !blank.dataset['lmsAnswers']) {
        blank.dataset['lmsAnswers'] = JSON.stringify([MANY_FIRST_QUADRANT_EXPLANATION]);
      }
    }

    if (text.includes('נקודה K: שיעור x = 0, שיעור y = 4')) {
      setSequentialAnswers(item, ['0', '4']);
    }

    if (text.includes('נקודה L: שיעור x = 6, שיעור y = 0')) {
      setSequentialAnswers(item, ['6', '0']);
    }

    if (text.includes('שיעורי הנקודה שעל ראשית הצירים הם')) {
      setSequentialAnswers(item, ['0', '0']);
    }

    if (text.includes('הנקודה O ממוקמת גם על ציר') && text.includes('וגם על ציר')) {
      setSequentialAnswers(item, ['x', 'y']);
    }

    if (text.includes('הנקודה של האות ק רחוקה') && text.includes('מציר ה־y')) {
      setSequentialAnswers(item, ['6']);
    }

    if (text.includes('שיעור ה־x של הנקודה של האות ו')) {
      setSequentialAnswers(item, ['2']);
    }

    if (text.includes('הנקודה של האות ד היא הימנית ביותר') && text.includes('שיעור ה־x שלה')) {
      setSequentialAnswers(item, ['7']);
    }

    if (text.includes('האות שממוקמת בנקודה (4,3)')) {
      setSequentialAnswers(item, ['ה']);
    }

    if (text.includes('כתבו את חמש האותיות לפי סדר השאלות')) {
      setSequentialAnswers(item, ['נקודה']);
    }

    if (text.includes('סמנו את הנקודה של האות הראשונה במילה') && text.includes('כתבו את שיעוריה')) {
      setSequentialAnswers(item, ['3', '2']);
    }

    if (text.includes('הנקודה של האות ד היא ה') && text.includes('שיעור ה־y שלה קטן מכולם')) {
      setSequentialAnswers(item, ['נמוכה']);
    }

    if (text.includes('סמנו נקודה חדשה ששיעור ה־y שלה הוא 6')) {
      setFirstFreeCoordinatePredicate(item);
    }
  }
}
