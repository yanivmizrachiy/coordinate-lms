/* כספת הקואורדינטות — four short coordinate tasks. Each answer is one digit of
   the safe's code, read in order. */
import type { RevealPuzzle } from './types';
import { createRevealGame } from './revealEngine';

export const coordinateSafePuzzle: RevealPuzzle = {
  id: 'coordinate-safe',
  title: 'כספת הקואורדינטות',
  question: 'מהו הקוד שפותח את הכספת?',
  icon: '🔐',
  short: 'פותרים משימות קצרות ומרכיבים את קוד הכספת.',
  skill: 'שיעורים, הזזה ונקודות על הצירים',
  intro: 'כל משימה נותנת ספרה אחת של הקוד. פתרו לפי הסדר וקבלו את קוד הכספת בן ארבע הספרות.',
  revealLabel: 'קוד הכספת',
  steps: [
    { prompt: 'כמה יחידות זזים ימינה מהנקודה (1,2) כדי להגיע ל־(5,2)?', kind: 'text', answer: '4', token: '4' },
    { prompt: 'מהו שיעור x של הנקודה (7,3)?', kind: 'text', answer: '7', token: '7' },
    { prompt: 'הנקודה (0,5) ממוקמת על ציר y. מהו שיעור x שלה?', kind: 'text', answer: '0', token: '0' },
    { prompt: 'כמה יחידות זזים למעלה מהנקודה (2,1) כדי להגיע ל־(2,6)?', kind: 'text', answer: '5', token: '5' },
  ],
};

export const coordinateSafeGame = createRevealGame(coordinateSafePuzzle);
