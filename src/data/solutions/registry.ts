import {
  AXES_IDENTIFY,
  AXES_INTRO,
  AXES_PRACTICE,
  HERO_INTRO,
  COORDS_INTRO,
  READ_PAIRS,
  READ_FROM_DRAWING,
  COORDS_PRACTICE,
  ORDERED_PAIR_INTRO,
  ORDERED_PAIR_DRILL,
  ORDERED_PAIR_PRACTICE,
  READ_INTRO,
  READ_PRACTICE,
  PLOT_A,
  ON_AXES_INTRO,
  ON_AXES_PRACTICE,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

/**
 * Verified learner-facing solutions.
 *
 * Important: specs are attached to the authored PAGE OBJECT, never to page 1/2/3.
 * Current page numbers and chapter names are resolved from BOOK at runtime.
 * The sourceBlobSha is checked by tests: changing a worksheet source without
 * re-verifying its answers makes CI fail instead of publishing stale solutions.
 */
export const SOLUTION_SPECS: SolutionPageSpec[] = [
  {
    source: AXES_IDENTIFY,
    sourceFile: 'src/data/workbook/pages/axes-identify.ts',
    sourceBlobSha: 'd7d6975c6370c302facd918a7349522eb9dc539c',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'ציר x הוא הציר האופקי; ציר y הוא הציר האנכי; נקודת המפגש היא ראשית הצירים.' },
      { id: 'a', label: 'א', answer: 'שמות: ציר x, ציר y, ראשית הצירים. המספרים החסרים על ציר x: 3, 6. המספרים החסרים על ציר y: 2, 5.' },
      { id: 'b', label: 'ב', answer: 'גדלים; y; שמאלה; קטנים.' },
      { id: 'c', label: 'ג', answer: '0; מימין; 5; משמאל.' },
      { id: 'd', label: 'ד', answer: '3; משמאל; 5½; 2.' },
      { id: 'e', label: 'ה', answer: 'B על ציר x; C על ציר y; A מימין לציר y; מתחת ל-A על ציר x נמצא המספר 4.' },
    ],
  },
  {
    source: AXES_INTRO,
    sourceFile: 'src/data/workbook/pages/axes-intro.ts',
    sourceBlobSha: 'cbca1d5d3b9ff9f14b0d03beb5daccd69e81a2ac',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'y; אופקי; ראשית; הצירים; (0,0); ישרה; 0; y; 5; 0.' },
      { id: 'a', label: 'א', answer: 'ציר x, ציר y, ראשית הצירים. על ציר x חסרים 2, 4, 6, 7; על ציר y חסרים 1, 3, 4, 6.' },
      { id: 'b', label: 'ב', answer: 'ימינה; y; קטנים.' },
      { id: 'c', label: 'ג', answer: 'A: x=3, y=5. ב-B המספר 2 הוא שיעור y, והמספר 6 הוא שיעור x.' },
      { id: 'd', label: 'ד', answer: 'C(4,7); D(8,1); E נמצאת על ציר y ו-E(0,6).' },
    ],
  },
  {
    source: AXES_PRACTICE,
    sourceFile: 'src/data/workbook/pages/axes-practice.ts',
    sourceBlobSha: 'f5806932d82aac81fb567d42d6b7265f982fe30a',
    exercises: [
      { id: 'a', label: 'א', answer: 'יש להשלים על השרטוט: ציר x, ציר y ו-O בראשית הצירים.' },
      { id: 'b', label: 'ב', answer: 'A מעל ציר x ומימין לציר y; ערך x של B גדול יותר; B מתחת ל-A; ימינה; y.' },
      { id: 'c', label: 'ג', answer: 'משימה פתוחה. C חייבת להיות מימין ל-B ומעל ציר x; D מתחת ל-A ומשמאל ל-B; E חייבת להיות על ציר y, כלומר x=0. כל זוג סדור שעומד בתנאים מתקבל.' },
      { id: 'd', label: 'ד', answer: 'נכון; לא נכון; נכון; לא נכון.' },
    ],
  },
  {
    source: HERO_INTRO,
    sourceFile: 'src/data/workbook/pages/hero-intro.ts',
    sourceBlobSha: '0702c50654c3199fd20b5c884029e8b0e9b2f54f',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'x; ימין; סדור.' },
      { id: 'a', label: 'א', answer: 'A(2,5); B(6,3); C(4,0); D(0,4).' },
      { id: 'b', label: 'ב', answer: 'ב-A: x=2, y=5.' },
      { id: 'c', label: 'ג', answer: 'C נמצאת על ציר x; D נמצאת על ציר y; ב-C שיעור y הוא 0.' },
      { id: 'd', label: 'ד', answer: 'ב-B: x=6, y=3; ב-C: y=0; ב-D: x=0.' },
    ],
  },
  {
    source: COORDS_INTRO,
    sourceFile: 'src/data/workbook/pages/coords-intro.ts',
    sourceBlobSha: '53184c19ee025a4e1be752dfaed10c282ec5d004',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'אופקי; x.' },
      { id: 'b', label: 'ב', answer: '4; x; גדל; (6,2).' },
      { id: 'c', label: 'ג', answer: 'D(2,5); E(6,2); F(3,0).' },
    ],
  },
  {
    source: READ_PAIRS,
    sourceFile: 'src/data/workbook/pages/read-pairs.ts',
    sourceBlobSha: 'c6b8a7cfe937bd787d7598be250c91cb65e14a97',
    exercises: [
      { id: 'a', label: 'א', answer: 'הנקודה היא B והיא B(5,2). ב-A: x=2 ולכן A(2,5).' },
      { id: 'b', label: 'ב', answer: 'x; y; 2.' },
      { id: 'c', label: 'ג', answer: 'A; B(5,2); הסדר.' },
    ],
  },
  {
    source: READ_FROM_DRAWING,
    sourceFile: 'src/data/workbook/pages/read-from-drawing.ts',
    sourceBlobSha: '8b398517034901b58c005be0ffc9417f38b8ea37',
    exercises: [
      { id: 'a', label: 'א', answer: 'A; 4; משמאל; x; 2; x; A; אנכי; A; D(3,2).' },
      { id: 'b', label: 'ב', answer: 'משימה פתוחה. E חייבת להיות במרחק 2 מציר x, כלומר שיעור y שלה הוא 2. לכן E=(x,2), והמרחק שלה מציר y שווה לערך x שבחרתם.' },
    ],
  },
  {
    source: COORDS_PRACTICE,
    sourceFile: 'src/data/workbook/pages/coords-practice.ts',
    sourceBlobSha: 'ca4f8b57281ecc46c1bccc7d110d162bc8725271',
    exercises: [
      { id: 'read', label: 'קוראים כל שיעור בנפרד', answer: 'P: x=5, y=2. Q: x=0, y=6. R נמצאת על ציר x.' },
      { id: 'table', label: 'טבלת שיעורים', answer: 'A: 1,4; B: 6,2; C: 3,5; D: 7,1; E: 2,6.' },
      { id: 'graph', label: 'מתאימים לגרף', answer: 'x=6 → B; y=6 → E; שיעור y של E הוא 6; הנקודה הימנית ביותר היא D.' },
    ],
  },
  {
    source: ORDERED_PAIR_INTRO,
    sourceFile: 'src/data/workbook/pages/ordered-pair-intro.ts',
    sourceBlobSha: 'c2f693c943bdf4e6760533d85959282f547fbc8c',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'שמאל; y; (4,3).' },
      { id: 'a', label: 'א', answer: '(2,5); (7,1); (3,6); (5,4).' },
      { id: 'b', label: 'ב', answer: 'A: x=6,y=2; B: x=1,y=5; C: x=4,y=3; D: x=7,y=6.' },
      { id: 'c', label: 'ג', answer: 'x=5,y=2 ↔ (5,2); x=2,y=5 ↔ (2,5); x=4,y=4 ↔ (4,4).' },
      { id: 'd', label: 'ד', answer: 'שיעור y; (3,5). הנקודה שנועם כתב, (5,3), נמצאת מימין וגם נמוך יותר מהנקודה הנכונה.' },
      { id: 'e', label: 'ה', answer: 'שונה; ימינה; y; אותה נקודה.' },
    ],
  },
  {
    source: ORDERED_PAIR_DRILL,
    sourceFile: 'src/data/workbook/pages/ordered-pair-drill.ts',
    sourceBlobSha: '7b7da2ff90634efd6a15f83d957ef74fd55490e6',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'סוגריים; x; סדור.' },
      { id: 'a', label: 'א', answer: 'A: 3,5; ב-B המספר 2 הוא שיעור y; C נמצאת על ציר y.' },
      { id: 'b', label: 'ב', answer: '(4,7); D(8,1); (0,0); (5,0).' },
      { id: 'c', label: 'ג', answer: 'אינן אותה נקודה; 6; (6,2) נמצאת מימין וגם נמוך יותר מ-(2,6).' },
      { id: 'd', label: 'ד', answer: 'E(5,3); y; סוגריים.' },
    ],
  },
  {
    source: ORDERED_PAIR_PRACTICE,
    sourceFile: 'src/data/workbook/pages/ordered-pair-practice.ts',
    sourceBlobSha: 'cb08ffdc32def7665188558372fc2c9eb9c97120',
    exercises: [
      { id: 'write', label: 'כותבים זוג סדור', answer: '(4,3); (0,5); (8,0); (2,2).' },
      { id: 'complete', label: 'משלימים זוגות', answer: '(7,4); (3,6); (0,0); (5,0).' },
      { id: 'order', label: 'הסדר משנה', answer: 'M(2,5); N(5,2); הסדר שונה; ב-(2,5) ערך x הוא 2. הטענה „(2,5) ו-(5,2) הן אותה נקודה” — לא נכון. הטענה „כאשר מחליפים את סדר המספרים בזוג סדור, מיקום הנקודה יכול להשתנות” — נכון.' },
    ],
  },
  {
    source: READ_INTRO,
    sourceFile: 'src/data/workbook/pages/read-intro.ts',
    sourceBlobSha: '7ddeaef89125f6e4c9090f6831bf2aed9a38a593',
    exercises: [
      { id: 'a', label: 'א', answer: 'A(1,2); B(4,5); C(7,1); D(6,4); E(3,3); F(8,6).' },
      { id: 'b', label: 'ב', answer: 'B; C; E; F.' },
      { id: 'c', label: 'ג', answer: 'הימנית ביותר F; הגבוהה ביותר F.' },
      { id: 'd', label: 'ד', answer: 'משמאל לימין: E, B, D, C.' },
      { id: 'e', label: 'ה', answer: 'F. שיעורי הנקודה: F(8,6).' },
    ],
  },
  {
    source: READ_PRACTICE,
    sourceFile: 'src/data/workbook/pages/read-practice.ts',
    sourceBlobSha: 'bd3086aa745fc33abc9801e0c346ae93a68c7767',
    exercises: [
      { id: 'graph-1', label: 'קוראים מן הגרף', answer: 'A(1,2); B(4,5); C(7,3); D(5,0).' },
      { id: 'graph-2', label: 'קוראים ומשווים', answer: 'K(0,4); N(8,5); שיעור y גדול מ-3: K, L, N; על ציר y נמצאת K.' },
      { id: 'extra', label: 'שאלה נוספת', answer: '(6,6). ערך x זהה לזה של M, כלומר 6; שיעור y זהה לזה של L, כלומר 6.' },
      { id: 'r', label: 'עוד נקודה אחת', answer: 'R(5,4); R נמצאת מימין ל-K.' },
    ],
  },
  {
    source: PLOT_A,
    sourceFile: 'src/data/workbook/pages/plot-marking.ts',
    sourceBlobSha: '446374d904fb29d385f3ea6f6f369cb04a41ad72',
    exercises: [
      { id: 'a', label: 'א', answer: 'יש לסמן בדיוק: A(2,1), B(5,4), C(7,2), D(3,6), E(6,5).' },
      { id: 'b', label: 'ב', answer: 'F(4,2); G(1,5); H(8,3); K(0,4); L(6,0).' },
    ],
  },
  {
    source: ON_AXES_INTRO,
    sourceFile: 'src/data/workbook/pages/on-axes-intro.ts',
    sourceBlobSha: '92669eae550227f6328af9e7f96b14cd5b62ff74',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: '0; y; (0,0).' },
      { id: 'a', label: 'א', answer: 'A(4,0), B(0,5), C(7,0), D(0,2), O(0,0), E(3,4).' },
      { id: 'b', label: 'ב', answer: 'על ציר x: A,C. על ציר y: B,D. ברביע ולא על ציר: E. ראשית הצירים: O.' },
      { id: 'c', label: 'ג', answer: 'P(6,0); Q(0,4); (2,0); (0,6).' },
      { id: 'd', label: 'ד', answer: 'O נמצאת גם על ציר x וגם על ציר y; שיעור y שלה 0; שמה ראשית הצירים.' },
    ],
  },
  {
    source: ON_AXES_PRACTICE,
    sourceFile: 'src/data/workbook/pages/on-axes-practice.ts',
    sourceBlobSha: '605191289e2f78cb257fbc7eadfe76d458ccf016',
    exercises: [
      { id: 'rule', label: 'מה משותף?', answer: '0; y. על ציר x הצורה היא (x,0); על ציר y הצורה היא (0,y); ראשית הצירים O(0,0).' },
      { id: 'sort', label: 'ממיינים נקודות', answer: 'על ציר x: (3,0), (8,0), וגם (0,0). על ציר y: (0,5), (0,1), וגם (0,0). לא על ציר: (4,2). ראשית הצירים שייכת לשני הצירים.' },
      { id: 'plot', label: 'מסמנים על הצירים', answer: 'A(2,0), B(0,3), C(7,0), D(0,6), O(0,0).' },
      { id: 'special', label: 'נקודה מיוחדת', answer: 'ראשית הצירים O(0,0). רק בה גם x=0 וגם y=0, ולכן היא נמצאת על שני הצירים.' },
    ],
  },
];
