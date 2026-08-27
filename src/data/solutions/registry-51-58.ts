import {
  PLOT_SHAPE,
  RECTANGLES_INTRO,
  RECTANGLES_PRACTICE,
  RECTANGLES_VERTICES,
  SQUARES_INTRO,
  SQUARES_SUMMARY,
  SQUARES_PRACTICE,
  SHAPES_CLAIMS,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_51_58: SolutionPageSpec[] = [
  {
    source: PLOT_SHAPE,
    sourceFile: 'src/data/workbook/pages/plot-shape.ts',
    sourceBlobSha: '1f95c74746942556e83523ff5f376fa0bb415fc7',
    exercises: [
      { id: 'a', label: 'א', answer: 'מתקבל מלבן ABCD.' },
      { id: 'b', label: 'ב', answer: 'AB ו-CD מקבילים לציר x; BC ו-DA מקבילים לציר y; קטע המקביל לציר x מאונך לציר y.' },
      { id: 'c', label: 'ג', answer: 'ב-AB שיעור y זהה; ב-BC ערך x זהה ולכן BC מקביל לציר y.' },
      { id: 'd', label: 'ד', answer: 'AB = 7−2 = 5 יחידות; BC = 5−1 = 4 יחידות. היקף: 2·(5+4)=18 יחידות. שטח: 5·4=20 יחידות ריבועיות.', method: 'מחשבים כל צלע כהפרש השיעורים בכיוון שלה, ואז P=2(a+b), S=a·b.' },
    ],
  },
  {
    source: RECTANGLES_INTRO,
    sourceFile: 'src/data/workbook/pages/rectangles-intro.ts',
    sourceBlobSha: '240c5312e19ef1b2807ca1098983e8974528ebef',
    exercises: [
      { id: 'a', label: 'א', answer: 'אותו x: A,D וגם B,C. ל-A ול-B שיעור y=1. הצלעות המקבילות לציר x: AB, CD. המקבילות לציר y: BC, DA.' },
      { id: 'b', label: 'ב', answer: 'AB = 6−1 = 5; BC = 4−1 = 3. היקף = 2·(5+3)=16 יחידות; שטח = 5·3=15 יחידות ריבועיות.', method: 'אורך אופקי לפי הפרש x; אורך אנכי לפי הפרש y.' },
      { id: 'c', label: 'ג', answer: 'הקודקוד החסר הוא (2,5). מידות המלבן 5×3, ולכן היקף 16 ושטח 15.' },
      { id: 'd', label: 'ד', answer: 'הקודקוד הרביעי הוא (2,5): עליו לשתף x=2 עם A ו-y=5 עם C.' },
    ],
  },
  {
    source: RECTANGLES_PRACTICE,
    sourceFile: 'src/data/workbook/pages/rectangles-practice.ts',
    sourceBlobSha: '468da1c952ffcd47de91070d5cd53f98de41c3ee',
    exercises: [
      { id: 'complete', label: 'משלימים מלבן', answer: 'D(1,4).' },
      { id: 'dimensions', label: 'אורך ורוחב של מלבן', answer: 'הרוחב הוא הצלע הקצרה. במלבן PQRS האורך הוא PQ=7−2=5, והרוחב QR=5−2=3. היקף 16; שטח 15.', method: 'PQ אופקי ולכן מחסרים x; QR אנכי ולכן מחסרים y.' },
      { id: 'own', label: 'ג', answer: 'משימה פתוחה. ארבעת הקודקודים חייבים ליצור מלבן שצלעותיו מקבילות לצירים, והצלע הארוכה חייבת להיות גדולה מהקצרה. ההיקף והשטח מחושבים מהמידות שבחרתם.' },
    ],
  },
  {
    source: RECTANGLES_VERTICES,
    sourceFile: 'src/data/workbook/pages/rectangles-vertices.ts',
    sourceBlobSha: '4e0143a8951146ac60343b858600a5d331975fb6',
    exercises: [
      { id: 'identify', label: 'מזהים קודקודים', answer: 'שני הקודקודים האחרים הם (1,5) ו-(7,2). האורך 7−1=6 יחידות; הרוחב 5−2=3 יחידות. הנקודה שעל היקף המלבן היא (4,2).' },
      { id: 'build', label: 'בונים מלבן', answer: 'אפשרות תקינה אחת: (2,1), (6,1), (6,4), (2,4). המידות 4×3, ולכן היקף 14 יחידות ושטח 12 יחידות ריבועיות.', method: 'מהקודקוד (2,1) מתקדמים 4 אופקית ו-3 אנכית, בלי לצאת מהרביע הראשון.' },
    ],
  },
  {
    source: SQUARES_INTRO,
    sourceFile: 'src/data/workbook/pages/squares-intro.ts',
    sourceBlobSha: '2183a32960f3bc76ee2e0c0d3bfd6e9f788671af',
    exercises: [
      { id: 'a', label: 'א', answer: 'הצלעות המקבילות לציר x הן AB ו-CD; כל הצלעות שוות. AB=6−2=4. היקף הריבוע 16; שטחו 16. האורך והרוחב שניהם 4.' },
      { id: 'b', label: 'ב', answer: 'מלבן א: 6×2 ⇒ שטח 12, היקף 16. מלבן ב: 3×4 ⇒ שטח 12, היקף 14. לכן אותו שטח אינו מחייב אותו היקף.', method: 'משווים שטחים והיקפים בנפרד: S=a·b, P=2(a+b).' },
    ],
  },
  {
    source: SQUARES_SUMMARY,
    sourceFile: 'src/data/workbook/pages/squares-summary.ts',
    sourceBlobSha: 'bfa2368323ab092562d124ea6a657ca29e1543ee',
    exercises: [
      { id: 'a', label: 'א', answer: 'D(7,2). הצלעות המקבילות לציר x הן BC ו-DA. האורך 5 (BC), הרוחב 4 (AB). היקף 18; שטח 20. אחרי הזזה יחידה ימינה A מגיעה ל-(3,2), וההיקף והשטח אינם משתנים.' },
      { id: 'b', label: 'ב', answer: '1) נכונה בהכרח. 2) נכונה בהכרח. 3) לא ייתכן — הזזה אינה משנה מידות. 4) ייתכן שנכונה, אך אינה הכרחית: מלבנים שונים יכולים להיות בעלי אותו שטח והיקפים שונים.' },
      { id: 'c', label: 'ג', answer: 'אפשרות אחת לריבוע: (2,2),(5,2),(5,5),(2,5). אפשרות אחת למלבן 5×2: (2,2),(7,2),(7,4),(2,4).' },
    ],
  },
  {
    source: SQUARES_PRACTICE,
    sourceFile: 'src/data/workbook/pages/squares-practice.ts',
    sourceBlobSha: 'd88a904043d501635de587acfe08758070a6f528',
    exercises: [
      { id: 'complete', label: 'משלימים ריבוע', answer: 'D(2,5). AB=6−2=4. היקף 4·4=16 יחידות; שטח 4·4=16 יחידות ריבועיות.', method: 'בריבוע כל ארבע הצלעות שוות לאורך AB.' },
      { id: 'description', label: 'ריבוע מתיאור', answer: 'הקודקודים האחרים: (4,2), (4,5), (1,5). היקף 12; שטח 9.' },
      { id: 'summary', label: 'סיכום קצר', answer: 'על ציר x: y=0. על ציר y: x=0. קטע אופקי: y זהה. קטע אנכי: x זהה. ימינה: x משתנה. למעלה: y משתנה.' },
      { id: 'route', label: 'משימת סיכום', answer: 'מ-(1,1): אחרי 5 ימינה (6,1); אחרי 4 למעלה (6,5); אחרי 2 שמאלה (4,5); אחרי 3 למטה (4,2). נקודת הסיום (4,2). אורך המסלול 5+4+2+3=14 יחידות. ערך x הסופי גדול מההתחלתי ב-3.' },
    ],
  },
  {
    source: SHAPES_CLAIMS,
    sourceFile: 'src/data/workbook/pages/shapes-claims.ts',
    sourceBlobSha: 'ee0201f54a7b706a71d9f43f3455b64607ab03e8',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'ייתכן; דוגמה.' },
      { id: 'a', label: 'א', answer: 'הטענה „נקודה ששני שיעוריה זהים ממוקמת על אחד הצירים” ייתכן שנכונה אך אינה הכרחית. גיא צודק: היחידה ששני שיעוריה שווים ונמצאת על ציר היא (0,0). דוגמה שאינה על ציר: (2,2).' },
      { id: 'b', label: 'ב', answer: 'לא ייתכן. בהזזה ימינה משתנה רק ערך x. A(2,3) אחרי 4 ימינה היא (6,3), ו-y נשאר 3.' },
      { id: 'c', label: 'ג', answer: 'מלבן 6×2: היקף 16, שטח 12.' },
      { id: 'd', label: 'ד', answer: 'מלבן 4×3: היקף 14, שטח 12.' },
      { id: 'e', label: 'ה', answer: 'טענת דנה אינה נכונה בהכרח. ההיקפים שונים ב-2 יחידות, ובכל זאת השטחים שווים (=12). שני המלבנים הם דוגמה נגדית לטענה.' },
    ],
  },
];
