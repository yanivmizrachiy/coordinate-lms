import {
  PLOT_B,
  PLOT_PRACTICE,
  HIDDEN_DRAWING_PRINT,
  SECRET_WORD_PRINT,
  GRAPH_REAL,
  POSITION_LANGUAGE_INTRO,
  POSITION_LANGUAGE_OWN,
  POSITION_LANGUAGE_PRACTICE,
  COLOR_DECODE_PRINT,
  RELATIONS_INTRO,
  RELATIONS_PRACTICE,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_17_29: SolutionPageSpec[] = [
  {
    source: PLOT_B,
    sourceFile: 'src/data/workbook/pages/plot-checking.ts',
    sourceBlobSha: '29e05ea4ca55ac477b24eb50f3c30e8b1a387f6f',
    exercises: [
      { id: 'a', label: 'א', answer: 'השרטוט הנכון הוא 2. בשרטוט הזה ערך x של A הוא 2.' },
      { id: 'b', label: 'ב', answer: 'גיא סימן בפועל (2,5); היה צריך לסמן K(5,2). הוא החליף בין ערך x לבין שיעור y. הנקודה הנכונה נמצאת מימין וגם נמוך יותר מהנקודה שסימן.' },
      { id: 'c', label: 'ג', answer: '3 יחידות ימינה: (5,5). כדי להגיע ל-(2,3) זזים 2 יחידות למטה. כדי להגיע ל-(2,1) זזים 4 יחידות למטה.' },
    ],
  },
  {
    source: PLOT_PRACTICE,
    sourceFile: 'src/data/workbook/pages/plot-practice.ts',
    sourceBlobSha: '2d2da8bb6af1320334e8221a5ae3581eda4dab5f',
    exercises: [
      { id: 'four', label: 'מסמנים ארבע נקודות', answer: 'A(1,1), B(4,1), C(4,4), D(1,4). חיבור A-B-C-D-A יוצר ריבוע.' },
      { id: 'axes', label: 'מסמנים נקודות על הצירים', answer: 'E(0,5), F(6,0), G(0,2), H(3,0), O(0,0). הנקודה שעל שני הצירים היא O.' },
      { id: 'check', label: 'מסמנים ובודקים', answer: 'R היא הגבוהה ביותר; Q הימנית ביותר; P השמאלית ביותר; Q הנמוכה ביותר ושיעור y שלה 3; R רחוקה 6 יחידות מציר x. S היא משימה פתוחה: נדרש x>2 ו-y<6, ובתחום הסרטוט.' },
    ],
  },
  {
    source: HIDDEN_DRAWING_PRINT,
    sourceFile: 'src/data/workbook/pages/hidden-drawing-print.ts',
    sourceBlobSha: '5b70b834c1f2829607e2418c7c3008323943fbd8',
    exercises: [
      { id: 'a', label: 'א', answer: 'מתקבלת מפרשית.' },
      { id: 'b', label: 'ב', answer: 'תחתית הגוף מקבילה לציר x; אורך התורן 4 יחידות; הנקודה הגבוהה ביותר היא (4,6); (7,3) רחוקה 7 יחידות מציר y. הנקודה שבתוך הגוף היא משימה פתוחה, והמרחק שלה מציר x שווה לשיעור y שלה.' },
    ],
  },
  {
    source: SECRET_WORD_PRINT,
    sourceFile: 'src/data/workbook/pages/secret-word-print.ts',
    sourceBlobSha: '75aabf8b7d383fd8b8bdb0e4ee85c1b7ede1bb76',
    exercises: [
      { id: 'b', label: 'ב', answer: 'נ; 6; 2; 7; ה.' },
      { id: 'c', label: 'ג', answer: 'מילת הצופן היא „נקודה”. האות הראשונה נ נמצאת בנקודה (3,2).' },
      { id: 'd', label: 'ד', answer: 'האות הגבוהה ביותר היא ו; המרחק האופקי בין נ לה הוא 1; ד היא הנמוכה ביותר.' },
      { id: 'e', label: 'ה', answer: 'החלק הראשון פתוח: כל נקודה ששיעור y שלה 6 מתקבלת. החלק „איזו מילה נוצרת עכשיו מכל האותיות?” אינו בעל תשובה תקינה יחידה במצב הנוכחי: האותיות נ,ק,ו,ד,ה יחד עם ם אינן יוצרות מילה מוגדרת. יש לתקן את התרגיל לפני פרסום תשובה.' },
      { id: 'f', label: 'ו', answer: 'האות האמצעית ב„נקודה” היא ו; ההפרש בין שיעורי x של ק ושל ה הוא 2; ק נמצאת מימין וגם מעל ה.' },
    ],
  },
  {
    source: GRAPH_REAL,
    sourceFile: 'src/data/workbook/pages/graph-real-life.ts',
    sourceBlobSha: 'daec5e4d4ebe26808e1fc7a8938ec0bd79048bfa',
    exercises: [
      { id: 'a', label: 'א', answer: 'A(1,5); B(3,5); D(6,4); E(6,1).' },
      { id: 'b', label: 'ב', answer: 'החבילה הכבדה ביותר היא F; הזולה ביותר היא E.' },
      { id: 'c', label: 'ג', answer: 'אותו משקל: B ו-C, וגם D ו-E. אותו מחיר: A ו-B, וגם D ו-F. אותו משקל פירושו אותו x ולכן הנקודות נמצאות על קו אנכי.' },
    ],
  },
  {
    source: POSITION_LANGUAGE_INTRO,
    sourceFile: 'src/data/workbook/pages/position-language-intro.ts',
    sourceBlobSha: 'b45aaa6a7e67c5f604f6e71ac86590ecbd0fe6d7',
    exercises: [
      { id: 'a', label: 'א', answer: 'מעל ציר x: A,C,D,E. על ציר x: B,O. מימין לציר y: A,B,D. על ציר y: C,E,O. גם מעל x וגם מימין ל-y: A,D.' },
      { id: 'b', label: 'ב', answer: 'נכון; לא נכון; נכון; לא נכון; נכון.' },
    ],
  },
  {
    source: POSITION_LANGUAGE_OWN,
    sourceFile: 'src/data/workbook/pages/position-language-own.ts',
    sourceBlobSha: '5dfc915682db31c13bc4b1c1d469dd47feeedcbd',
    exercises: [
      { id: 'a', label: 'א', answer: 'יש כמה תשובות: מעל ציר x ⇒ y>0; מימין לציר y ⇒ x>0; על ציר x ⇒ y=0; על ציר y ⇒ x=0; גם מעל וגם מימין ⇒ x>0 וגם y>0.' },
      { id: 'b', label: 'ב', answer: 'F היא כל נקודה מהצורה (x,0). G חייבת להיות מהצורה (x,0) עם x>5, כי B=(5,0). בשתיהן y=0; ערך x של G גדול מערך x של B.' },
      { id: 'c', label: 'ג', answer: 'על ציר y: (0,y), כי x=0. על ציר x: (x,0), כי y=0. הנקודה (0,4) נמצאת על ציר y.' },
    ],
  },
  {
    source: POSITION_LANGUAGE_PRACTICE,
    sourceFile: 'src/data/workbook/pages/position-language-practice.ts',
    sourceBlobSha: '04306e91ab289e65d80dfc04fbddbef165716076',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: '0; x; שווה.' },
      { id: 'directions', label: 'ימין, שמאל, מעל ומתחת', answer: 'B; C; D; B.' },
      { id: 'equal', label: 'נקודות ששיעוריהן זהים', answer: 'A, C, E. דוגמאות נוספות: (1,1) ו-(3,3). בראשית הצירים שני השיעורים 0.' },
      { id: 'pair', label: 'מתיאור לזוג סדור', answer: '(6,3).' },
    ],
  },
  {
    source: COLOR_DECODE_PRINT,
    sourceFile: 'src/data/workbook/pages/color-decode-print.ts',
    sourceBlobSha: '67de910c99ee174f92335ee3801402b8ef92182f',
    exercises: [
      { id: 'a', label: 'א', answer: 'מתקבל חץ שמצביע למעלה.' },
      { id: 'b', label: 'ב', answer: 'שיעור y גדל כלפי מעלה; תחתית הגזע היא (3,0); לכל תאי הגזע x=3; לקצות (1,3) ו-(5,3) שיעור y שווה; חוד החץ (3,5); ההפרש בגובה הוא 5 יחידות.' },
    ],
  },
  {
    source: RELATIONS_INTRO,
    sourceFile: 'src/data/workbook/pages/relations-intro.ts',
    sourceBlobSha: '1d737a4f7e143ca657024ae4915bafd2d4dc2481',
    exercises: [
      { id: 'a', label: 'א', answer: '(2,4).' },
      { id: 'b', label: 'ב', answer: '(5,2).' },
      { id: 'c', label: 'ג', answer: '(4,2), (6,4), (3,1).' },
      { id: 'd', label: 'ד', answer: '(1,2), (2,4), (3,6).' },
      { id: 'e', label: 'ה', answer: 'A(3,5); B(3,6); C(7,3); D(8,4).' },
      { id: 'f', label: 'ו', answer: 'לא. שני התנאים יחד דורשים x+2=2x, ולכן הם מתקיימים יחד רק כאשר x=2; לדוגמה כאשר x=3 מתקבלים 5 לעומת 6.' },
    ],
  },
  {
    source: RELATIONS_PRACTICE,
    sourceFile: 'src/data/workbook/pages/relations-practice.ts',
    sourceBlobSha: 'ab356f5ac881d2878743a5ded5b8bd6ae8562279',
    exercises: [
      { id: 'add-sub', label: 'גדול ב־ וקטן ב־', answer: 'B(6,3); D(7,2); F(1,2).' },
      { id: 'times-half', label: 'גדול פי ומחצית', answer: 'Q(6,3); S(4,4); U(4,6).' },
      { id: 'table', label: 'טבלת יחסים', answer: '(7,5); (3,4); (6,5); (5,3).' },
      { id: 'extra', label: 'שאלה נוספת', answer: 'הנקודה החדשה היא (6,5). היא אינה מקיימת x=y.' },
      { id: 'd', label: 'ד', answer: 'A=(2,3), לכן B(6,3) ו-C(2,6). B נמצאת מימין ל-A; ב-C גדל רק שיעור y.' },
    ],
  },
];
