import {
  SAME_COORD_INTRO,
  SEGMENT_LENGTH,
  SAME_COORD_PRACTICE,
  SAME_AXIS_PRINT,
  PARALLEL_PERPENDICULAR,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_46_50: SolutionPageSpec[] = [
  {
    source: SAME_COORD_INTRO,
    sourceFile: 'src/data/workbook/pages/same-coord-intro.ts',
    sourceBlobSha: 'd47ae58e6572fb272f36b7f996b2275dc8d97601',
    exercises: [
      { id: 'a', label: 'א', answer: 'ל-A ול-B שיעור x זהה, והוא 2; לכן AB מקביל לציר y.' },
      { id: 'b', label: 'ב', answer: 'ל-B ול-C שיעור y זהה, והוא 5. בדוגמה משלכם לשיעור x זהה יש לבחור שתי נקודות בעלות אותו x.' },
      { id: 'rule', label: 'הכללה', answer: 'x זהה ⇒ קטע מקביל לציר y; y זהה ⇒ קטע מקביל לציר x.' },
      { id: 'c', label: 'ג', answer: 'ב-P(4,1),Q(4,6) שיעור x זהה. אם y זהה, הקטע מקביל לציר x.' },
      { id: 'd', label: 'ד', answer: 'למקביל לציר x: כל נקודה מהצורה (x,4) השונה מ-(3,4). למקביל לציר y: כל נקודה מהצורה (3,y) השונה מ-(3,4).' },
      { id: 'e', label: 'ה', answer: '(1,1), (4,4), (0,0), (5,5).' },
      { id: 'f', label: 'ו', answer: 'לא. אם לשתי נקודות גם x זהה וגם y זהה, זה אותו זוג סדור ולכן זו אותה נקודה.' },
    ],
  },
  {
    source: SEGMENT_LENGTH,
    sourceFile: 'src/data/workbook/pages/segment-length.ts',
    sourceBlobSha: 'f804eb9a2783b8421fd1fbe5d8ebf6ba9ec51b84',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'הפרש; נמוך.' },
      { id: 'a', label: 'א', answer: 'AB מקביל לציר x: 7−2=5 יחידות. CD מקביל לציר y: 5−1=4 יחידות.' },
      { id: 'b', label: 'ב', answer: 'A(1,4)–B(6,4): ציר x, 6−1=5. C(3,2)–D(3,6): ציר y, 6−2=4. E(0,5)–F(8,5): ציר x, 8−0=8.' },
      { id: 'c', label: 'ג', answer: 'משימה פתוחה. KL חייב להיות אופקי: y זהה בשתי הנקודות, והפרש ערכי x חייב להיות 4.' },
    ],
  },
  {
    source: SAME_COORD_PRACTICE,
    sourceFile: 'src/data/workbook/pages/same-coord-practice.ts',
    sourceBlobSha: 'a3abfdf1042fd0ddeb1663183b4015d85e53b153',
    exercises: [
      { id: 'rule', label: 'הכלל הגאומטרי', answer: 'ב-P,Q שיעור x זהה. ב-R,S שיעור y זהה ולכן RS מקביל לציר x.' },
      { id: 'identify', label: 'מזהים קטעים', answer: 'AB מקביל לציר y; BC מאונך ל-AB; CD אנכי.' },
      { id: 'choose', label: 'בוחרים זוגות', answer: 'אופקי: (1,3)–(5,3) וגם (2,2)–(7,2). אנכי: (6,1)–(6,5) וגם (3,0)–(3,6).' },
      { id: 'build', label: 'בונים קטעים', answer: 'M(4,2). ל-N יש שתי אפשרויות בתחום: N(1,2) או N(7,2), שתיהן יוצרות אורך 3. ל-T ברביע הראשון: T(4,6), אורך 4 אנכי.' },
    ],
  },
  {
    source: SAME_AXIS_PRINT,
    sourceFile: 'src/data/workbook/pages/same-axis-print.ts',
    sourceBlobSha: '7a02449eece7e3c89fcaff9b3c162b49cf1e9d7f',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'אותו x ⇒ קו אנכי.' },
      { id: 'a', label: 'א', answer: 'מקיפים 2 נקודות; שתיהן על קו אנכי; האותיות מלמעלה למטה: ז, ה.' },
      { id: 'b', label: 'ב', answer: 'בשתי הנקודות y=2; השיעור הזהה הוא y; האותיות מימין לשמאל: י, ם.' },
      { id: 'c', label: 'ג', answer: 'המילה היא „זהים”. הנקודות בסעיף ב בעלות y זהה ולכן הקטע ביניהן מקביל לציר x.' },
      { id: 'd', label: 'ד', answer: 'אותו x=4: (4,5), (4,0), (4,6). בדוגמה משלכם ל-y זהה יש לבחור שתי נקודות בעלות אותו y.' },
    ],
  },
  {
    source: PARALLEL_PERPENDICULAR,
    sourceFile: 'src/data/workbook/pages/parallel-perpendicular.ts',
    sourceBlobSha: '2d6b581e22c3bf8e84aed010e3795df24c92da93',
    exercises: [
      { id: 'a', label: 'א', answer: 'AB מקביל לציר x; ב-CD שיעור x זהה ולכן CD מקביל לציר y.' },
      { id: 'b', label: 'ב', answer: 'y זהה ⇒ מקביל לציר x; x זהה ⇒ מקביל לציר y; מקביל לציר x ⇒ מאונך לציר y; מקביל לציר y ⇒ מאונך לציר x.' },
      { id: 'c', label: 'ג', answer: 'נכון; לא נכון; נכון.' },
      { id: 'd', label: 'ד', answer: 'משימה פתוחה. EF חייב להיות אנכי, כלומר לשני קצותיו אותו x. כל קטע כזה מאונך לציר x.' },
    ],
  },
];
