/* המסלול המוצפן — start at a point, follow the movement instructions, and name
   the station you reach. Each station reveals one letter of the secret word. */
import type { RevealPuzzle } from './types';
import { createRevealGame } from './revealEngine';
import { applyPath, type Move, type Point } from '../lib/coordinateMath';

interface RouteLeg {
  start: Point;
  moves: Move[];
  token: string;
  label: string;
}

const legs: RouteLeg[] = [
  { start: { x: 1, y: 1 }, moves: [{ dir: 'right', steps: 4 }, { dir: 'up', steps: 3 }], token: 'ק', label: 'A' },
  { start: { x: 2, y: 5 }, moves: [{ dir: 'right', steps: 3 }, { dir: 'down', steps: 4 }], token: 'ס', label: 'B' },
  { start: { x: 0, y: 2 }, moves: [{ dir: 'right', steps: 6 }, { dir: 'up', steps: 3 }], token: 'ם', label: 'C' },
];

const describe = (moves: Move[]): string => {
  const word: Record<string, string> = { right: 'ימינה', left: 'שמאלה', up: 'למעלה', down: 'למטה' };
  return moves.map((m) => `${m.steps} ${word[m.dir]}`).join(' ואז ');
};

export const encryptedRoutePuzzle: RevealPuzzle = {
  id: 'encrypted-route',
  title: 'המסלול המוצפן',
  question: 'לאן מוביל המסלול?',
  icon: '🧭',
  short: 'עוקבים אחרי פקודות תנועה ומגלים לאן הגעתם.',
  skill: 'הזזה במערכת הצירים (ימינה/שמאלה/למעלה/למטה)',
  intro: 'התחילו מהנקודה הנתונה, בצעו את פקודות התנועה וכתבו את הנקודה שאליה הגעתם. כל תחנה נכונה חושפת אות.',
  revealLabel: 'המילה הסודית',
  steps: legs.map((leg) => {
    const dest = applyPath(leg.start, leg.moves);
    return {
      prompt: `מהנקודה (${leg.start.x},${leg.start.y}) זזים ${describe(leg.moves)}. לאיזו נקודה הגעתם?`,
      kind: 'point' as const,
      answer: `${dest.x},${dest.y}`,
      token: leg.token,
      grid: { points: [{ x: leg.start.x, y: leg.start.y, label: leg.label }], ariaLabel: `נקודת ההתחלה ${leg.label}` },
    };
  }),
};

export const encryptedRouteGame = createRevealGame(encryptedRoutePuzzle);
