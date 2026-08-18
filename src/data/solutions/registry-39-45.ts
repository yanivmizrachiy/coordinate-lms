import {
  MISSING_COORD_INTRO,
  MISSING_COORD_PRACTICE,
  RULE_TO_GRAPH,
  COORDINATE_SAFE_PRINT,
  ERRORS_INTRO,
  ERRORS_PRACTICE,
  SUSPECT_POINT_PRINT,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_39_45: SolutionPageSpec[] = [
  {
    source: MISSING_COORD_INTRO,
    sourceFile: 'src/data/workbook/pages/missing-coord-intro.ts',
    sourceBlobSha: 'c23861814bf306efac7180051d4b520d43057d95',
    exercises: [
      { id: 'a', label: 'א', answer: 'A(5,0); B(0,4); C(3,3); D(3,6); E(2,5); F(7,3).' },
      { id: 'b', label: 'ב', answer: '(6,0); (0,5); (4,4); (3,2); (5,4).' },
      { id: 'c', label: 'ג', answer: 'x גדל בכל שלב ב-2; y גדל ב-1; בכל נקודה x=2y. הנקודה (6,4) אינה מתאימה, כי כאשר y=4 צריך x=8.' },
      { id: 'd', label: 'ד', answer: 'y גדול ב-2 מ-x. לכן החסר הוא 2. (5,5) אינה מתאימה; היה צריך (5,7).' },
      { id: 'e', label: 'ה', answer: 'מתאימות נקודות רבות מאוד: כל נקודה עם x>0 ו-y>0. לדוגמה (1,1) ו-(2,3). כדי לקבוע נקודה אחת צריך לדעת גם x וגם y.' },
    ],
  },
  {
    source: MISSING_COORD_PRACTICE,
    sourceFile: 'src/data/workbook/pages/missing-coord-practice.ts',
    sourceBlobSha: '0596a8c8dd2c0edde1c92fecfaea54a5a0f34823',
    exercises: [
      { id: 'missing', label: 'שיעור חסר', answer: 'A(6,4); C(3,5); E(4,0); G(0,2).' },
      { id: 'equal', label: 'דפוס של שיעורים זהים', answer: '(5,5), (6,6). הכלל: x=y.' },
      { id: 'series', label: 'משלימים סדרה', answer: '(4,5), (5,5). שיעור y נשאר קבוע (=5); שיעור x משתנה וגדל ב-1.' },
      { id: 'extra', label: 'שאלה נוספת', answer: '(3,5), (5,4), (7,3). בדפוס הראשון הפרש שיעורי y בין נקודות סמוכות הוא 1. במקום השישי בטבלה: (6,5). בכל הטבלה y=5.' },
    ],
  },
  {
    source: RULE_TO_GRAPH,
    sourceFile: 'src/data/workbook/pages/rule-to-graph.ts',
    sourceBlobSha: '592a30ed977a3ed28abf592ed9658e622f8f114f',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: '2; נקודות.' },
      { id: 'a', label: 'א', answer: 'שורת y: 0,2,4,6. הנקודות: (0,0), (1,2), (2,4), (3,6). הן נמצאות על קו ישר; בכל נקודה y גדול פי 2 מ-x.' },
      { id: 'b', label: 'ב', answer: 'שורת y: 2,3,4,5,6. y גדול ב-2 מ-x. אם x=6 אז y=8.' },
      { id: 'c', label: 'ג', answer: 'שורת x: 4,5,6,7. הגדול תמיד הוא x. אם y=2 אז x=6.' },
      { id: 'd', label: 'ד', answer: 'משימה פתוחה. אם בחרתם הפרש k, כל נקודה חייבת לקיים y=x+k, וההפרש y−x בשתי הנקודות חייב להיות אותו k.' },
    ],
  },
  {
    source: COORDINATE_SAFE_PRINT,
    sourceFile: 'src/data/workbook/pages/coordinate-safe-print.ts',
    sourceBlobSha: '9cfb1d60fd509f2bab2e059c19a872d036d122b5',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'התרגיל הוא תרגיל חיסור.' },
      { id: 'a', label: 'א', answer: '1) 5−1=4. 2) שיעור x של C הוא 7, וזה מרחקה מציר y. 3) D על ציר y ולכן x=0. 4) x נשאר זהה; 6−1=5.' },
      { id: 'b', label: 'ב', answer: 'קוד הכספת: 4705. הספרה הקטנה ביותר, 0, התקבלה מהנקודה שעל ציר y. בכל נקודה על ציר y מתקיים x=0.' },
      { id: 'c', label: 'ג', answer: 'משימה פתוחה: G=(x,0). אחרי 4 יחידות למעלה מתקבלת (x,4), ומרחקה מציר x הוא 4. אם y=0 הנקודה על ציר x.' },
    ],
  },
  {
    source: ERRORS_INTRO,
    sourceFile: 'src/data/workbook/pages/errors-intro.ts',
    sourceBlobSha: '7e31510d8e3227014c5e7299412e0f52c3b69721',
    exercises: [
      { id: 'case1', label: 'מקרה 1', answer: 'לא נכון. הזוג הנכון (3,5); ערך x נכתב מצד שמאל.' },
      { id: 'case2', label: 'מקרה 2', answer: 'נכון. ב-(5,0) שיעור y הוא 0 ולכן הנקודה על ציר x.' },
      { id: 'case3', label: 'מקרה 3', answer: 'לא נכון. ב-(0,4) ערך x הוא 0 ולכן הנקודה ממוקמת על ציר y, לא מימין לו.' },
      { id: 'case4', label: 'מקרה 4', answer: 'נכון. x זהה פירושו אותו קו אנכי.' },
      { id: 'case5', label: 'מקרה 5', answer: 'לא נכון. ב-(3,6), y גדול ב-3 מ-x.' },
      { id: 'case6', label: 'מקרה 6', answer: 'נכון. 3 ימינה מ-(2,4) נותן (5,4).' },
      { id: 'case7', label: 'מקרה 7', answer: 'לא נכון. בקטע המקביל לציר x דווקא שיעור y זהה.' },
      { id: 'case8', label: 'מקרה 8', answer: 'נכון. קטע המקביל לציר x מאונך לציר y.' },
      { id: 'case9', label: 'מקרה 9', answer: 'לא נכון. בקטע בין (1,3) ל-(4,3) שיעורי y זהים, ולכן האורך מחושב מהפרש שיעורי x.' },
    ],
  },
  {
    source: ERRORS_PRACTICE,
    sourceFile: 'src/data/workbook/pages/errors-practice.ts',
    sourceBlobSha: '1796a337f65752afe47746f7fbb7236073d3a5b6',
    exercises: [
      { id: 'order', label: 'החלפת סדר', answer: 'דניאל החליף בין x ל-y. קוראים תחילה את המספר משמאל — הוא ערך x.' },
      { id: 'axes', label: 'טעות בצירים', answer: 'על ציר x מתקיים y=0. דוגמה: (3,0).' },
      { id: 'move', label: 'טעות בהזזה', answer: 'שיעור y צריך להישאר 2. התשובה הנכונה (7,2).' },
      { id: 'segments', label: 'טעות בקטעים', answer: 'לא נכון. x זהה (=2), לכן הקטע מקביל לציר y.' },
      { id: 'rectangle', label: 'טעות במלבן', answer: 'הקודקוד הרביעי הוא (1,4). האורך הוא הצלע הארוכה. כאשר ערך x זהה הקטע מקביל לציר y.' },
      { id: 'wording', label: 'בודקים ניסוח', answer: 'ניסוח חד-משמעי: „שיעור y הוא מחצית מהערך שאליו משווים אותו” (או לציין במפורש: y=x/2, אם x הוא המשתנה הנדון).' },
      { id: 'axis-point', label: 'טעות בנקודה שעל ציר', answer: '(0,7) על ציר y; על ציר y מתקיים x=0; הנקודה שעל שני הצירים היא ראשית הצירים.' },
    ],
  },
  {
    source: SUSPECT_POINT_PRINT,
    sourceFile: 'src/data/workbook/pages/suspect-point-print.ts',
    sourceBlobSha: '3e631e11d229c51363280473ee51b6213bc1f1b7',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'הנקודה שנשארת היא הנקודה החשודה.' },
      { id: 'b', label: 'ב', answer: 'ל-x=5 מתאימות B ו-C. C נפסלת כי y=1 קטן מ-2. הנקודה החשודה היא B(5,3).' },
      { id: 'c', label: 'ג', answer: 'בקו אנכי שיעור x זהה. כאן x=7, ולכן הנקודה היא F(7,2). F נמצאת מימין ל-B.' },
      { id: 'd', label: 'ד', answer: 'משימה פתוחה: G חייבת לקיים y=6. לכן y שלה גדול מ-5. ערך x ברמז האחרון חייב להיות בדיוק ערך x שבחרתם ל-G.' },
    ],
  },
];
