/* פענוח צבעוני — צובעים את התאים שברשימת הזוגות הסדורים, ומהם מתגלה סמל.

   הקובץ הזה מחזיק **נתונים בלבד**. השעשועון המקוון הוסר (31.07.2026): הדף
   הוא עכשיו `COLOR_DECODE_PRINT` — „אנחנו רק דפים להדפסה ולא מתוקשב" —
   ורשימת התאים נשארת כאן כמקור אמת אחד לדף המודפס ולבדיקות. */
import { isFirstQuadrant, type Point } from '../lib/coordinateMath';

/** גבולות הרשת — ערך x ושיעור y הגדולים ביותר שיש להם תא. הדף המודפס בונה
    את הרשת מהם, כדי שהמידות לא יהיו כתובות פעמיים. */
export const decodeXMax = 6;
export const decodeYMax = 5;

/** התאים שמצביעים על חץ מעלה — סמל שמראה את כיוון הרביע הראשון: מראשית
    הצירים כלפי מעלה, ככל ששיעור ה־y גדל. הצורה סימטרית סביב הקו x=3:
    גזע דק (x=3) שעולה מ־y=0, ומעליו ראש משולש רחב (y=3) שמתכנס לחוד (3,5).

        y=5            ■ (3,5)
        y=4          ■ ■ ■
        y=3        ■ ■ ■ ■ ■
        y=2            ■
        y=1            ■
        y=0            ■
             0 1 2 3 4 5 6                                              */
export const decodeTargets: Point[] = [
  // הגזע — קו אנכי על x=3
  { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
  // בסיס הראש — קו אופקי על y=3
  { x: 1, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
  // אמצע הראש
  { x: 2, y: 4 }, { x: 3, y: 4 }, { x: 4, y: 4 },
  // החוד
  { x: 3, y: 5 },
];

const keyOf = (p: Point): string => `${p.x},${p.y}`;

export function decodeSolved(colored: Iterable<string>): boolean {
  const set = new Set(colored);
  const targetKeys = decodeTargets.map(keyOf);
  return set.size === targetKeys.length && targetKeys.every((k) => set.has(k));
}

/** Exposed for tests. */
export function targetsAreFirstQuadrant(): boolean {
  return decodeTargets.every(isFirstQuadrant);
}
