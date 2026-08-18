import {
  GRAPH_READING_INTRO,
  GRAPH_YEARS,
  GRAPH_SQUARE_AREA,
  GRAPH_CONSTANT_RATE,
  GRAPH_TWO_SERIES,
  GRAPH_OWN_DATA,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_65_70: SolutionPageSpec[] = [
  {
    source: GRAPH_READING_INTRO,
    sourceFile: 'src/data/workbook/pages/graph-reading-intro.ts',
    sourceBlobSha: '061233c9e6aa139e6384db67ec89b1fdd5b10a69',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'התוצאה; סדור; לבדו.' },
      { id: 'a', label: 'א', answer: 'D(4,5), כלומר 40 דקות ו-5 שאלות. F פתרה/פתר הכי הרבה שאלות. ל-B ול-C שיעור y זהה (=3). ל-E ול-D y=5, אך x של E גדול יותר.' },
      { id: 'b', label: 'ב', answer: 'D: 4 עשרות דקות ו-5 שאלות. A: 10 דקות ו-2 שאלות. B ו-C פתרו אותו מספר שאלות (=3).' },
      { id: 'c', label: 'ג', answer: 'ככל ש-x גדל, y בדרך כלל גדל. ההפרש F−A הוא 6−2=4 שאלות. 50 דקות ו-4 שאלות ⇒ G(5,4). G נמצאת מימין ל-D וגם מתחתיה.' },
    ],
  },
  {
    source: GRAPH_YEARS,
    sourceFile: 'src/data/workbook/pages/graph-years.ts',
    sourceBlobSha: '629045df1ab67828ef777a889385dbcfe878b00c',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'שנים.' },
      { id: 'a', label: 'א', answer: 'בשנה 3 נרשמו 5 עשרות (=50), ולכן הנקודה (3,5). המספר הגבוה ביותר היה בשנה 5. בשנה 4 המספר קטן לעומת שנה 3. לשנים 3 ו-7 אותו y=5.' },
      { id: 'b', label: 'ב', answer: '(5,6) פירושה 60 תלמידים בשנה 5. בין שנה 1 לשנה 5 עברו 5−1=4 שנים; מספר הנרשמים גדל ב-6−2=4 עשרות (=40). שנה 8 עם 70 תלמידים ⇒ (8,7), והיא מימין לכל שאר הנקודות.' },
    ],
  },
  {
    source: GRAPH_SQUARE_AREA,
    sourceFile: 'src/data/workbook/pages/graph-square-area.ts',
    sourceBlobSha: '3977d4673adb5a96a91b5f3f8d4f65446dc3ef53',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'שוות; 4.' },
      { id: 'a', label: 'א', answer: 'צלע 3 ⇒ היקף 12. היקף 20 ⇒ צלע 5. בכל נקודה ההיקף גדול פי 4 מאורך הצלע.' },
      { id: 'b', label: 'ב', answer: 'הביטוי הוא y=4x. לצלע 6 ההיקף 24. לצלע 4 מתאימה הנקודה (4,16).', method: 'היקף ריבוע הוא 4 כפול אורך הצלע.' },
    ],
  },
  {
    source: GRAPH_CONSTANT_RATE,
    sourceFile: 'src/data/workbook/pages/graph-constant-rate.ts',
    sourceBlobSha: 'cf0fe743a1fc8aee801d587e8f293b3279c720c3',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'קבוע; חיסור.' },
      { id: 'a', label: 'א', answer: 'בתחילת המדידה הגובה 6 ס״מ, ולכן (0,6). בכל שעה הגובה קטן ב-1. בין שעה 0 לשעה 4: 6−2=4 ס״מ.' },
      { id: 'b', label: 'ב', answer: 'הביטוי y=6−x. אחרי 5 שעות y=1, כלומר הגובה שווה ל-1 ס״מ. הנקודה היא (5,1), מימין ומתחת לנקודה (4,2).' },
    ],
  },
  {
    source: GRAPH_TWO_SERIES,
    sourceFile: 'src/data/workbook/pages/graph-two-series.ts',
    sourceBlobSha: 'dd18db911d15e858bd75f4403fb48725a554ffcc',
    exercises: [
      { id: 'a', label: 'א', answer: 'אחרי חודש 1 לז׳1 יש 4 מאות (=400), ולכן (1,4). בחודש 2 שתי הכיתות מגיעות ל-5 מאות (=500). אחרי חודש 2 לז׳2 יש יותר פקקים.' },
      { id: 'b', label: 'ב', answer: 'ז׳1: y=100x+300. ז׳2: y=200x+100. אחרי 6 חודשים: ז׳1=900, ז׳2=1300, ולכן לז׳2 יותר.' },
    ],
  },
  {
    source: GRAPH_OWN_DATA,
    sourceFile: 'src/data/workbook/pages/graph-own-data.ts',
    sourceBlobSha: '9bf5bb8d74d8122b53bcee45597db20d63b777ec',
    exercises: [
      { id: 'a', label: 'א', answer: 'משימה פתוחה: מסמנים שישה ימים לפי הנתונים האישיים; x הוא מספר היום ו-y הוא מספר עשרות הדקות.' },
      { id: 'b', label: 'ב', answer: 'התשובות תלויות בגרף שסימנתם. היום הראשון חייב להיות מהצורה (1,y₁) והשישי (6,y₆). היום הגדול ביותר הוא זה בעל y הגבוה ביותר; ההפרש הוא yₘₐₓ−yₘᵢₙ; ימים עם אותו זמן חולקים y זהה; מרחק הנקודה הגבוהה מציר x שווה לשיעור y שלה.' },
    ],
  },
];
