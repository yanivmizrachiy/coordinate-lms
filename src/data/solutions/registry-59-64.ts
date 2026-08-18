import {
  LIFE_PHONE_SCREEN,
  LIFE_HALL_SEATS,
  LIFE_PIXEL_ART,
  LIFE_DELIVERY_ROUTE,
  LIFE_PARK_MAP,
  LIFE_PARK_ROUTE,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_59_64: SolutionPageSpec[] = [
  {
    source: LIFE_PHONE_SCREEN,
    sourceFile: 'src/data/workbook/pages/life-phone-screen.ts',
    sourceBlobSha: '38f4579f36b60b1532b957873ecbd89a92d5f725',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'מערכת; שורה.' },
      { id: 'a', label: 'א', answer: 'מצלמה: (4,5). ב-(1,2) נמצאת מפות. למוזיקה, מצלמה והודעות y זהה (=5). מפות ושעון באותו y ולכן הקטע ביניהן מקביל לציר x.' },
      { id: 'b', label: 'ב', answer: 'מוזיקה→הודעות: 6−1=5 משבצות, כלומר 5 עמודות ימינה. שעון (6,2)→(6,5): 5−2=3 משבצות, כלומר 3 יחידות למעלה.' },
      { id: 'c', label: 'ג', answer: 'הכוונה הייתה לעמודה 2 ולשורה 6; הסדר של המספרים שונה. אפליקציה חדשה באותה עמודה של מפות חייבת להיות מהצורה (1,y). המרחק ממפות (1,2) הוא |y−2|, לפי השורה שבחרתם.' },
    ],
  },
  {
    source: LIFE_HALL_SEATS,
    sourceFile: 'src/data/workbook/pages/life-hall-seats.ts',
    sourceBlobSha: '47a0fae6883052798ef7dcaf5c88c5d7eb1325c4',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'x; שונים.' },
      { id: 'a', label: 'א', answer: 'נועה: (5,1). לגיא ולאורי y זהה (=4). המרחק ביניהם: 7−2=5 מקומות. דניאל וגיא בעלי x=2, לכן הקטע ביניהם מקביל לציר y.' },
      { id: 'b', label: 'ב', answer: 'מ-(3,2) עד (6,4): אורך 6−3=3, רוחב 4−2=2. היקף המלבן 2·(3+2)=10; שטח 3·2=6.', method: 'החישוב בדף מתייחס למידות המלבן במערכת הצירים, כלומר להפרשי השיעורים.' },
      { id: 'c', label: 'ג', answer: 'השורה שמעל נועה היא y=2. אפשר לבחור כל כיסא פנוי מהצורה (x,2); ההפרש מנועה הוא שורה אחת.' },
    ],
  },
  {
    source: LIFE_PIXEL_ART,
    sourceFile: 'src/data/workbook/pages/life-pixel-art.ts',
    sourceBlobSha: '14279a5fb8b0ac0153e9fd6f8c93da51d9953723',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'זוג; מערכת.' },
      { id: 'a', label: 'א', answer: 'מתקבלת מסגרת מלבנית (מלבן חלול). בשורה התחתונה ההפרש הוא 5−2=3. הצלע התחתונה מקבילה לציר x והשמאלית לציר y.' },
      { id: 'b', label: 'ב', answer: 'מ-(1,1) עד (7,5): אורך 7−1=6, רוחב 5−1=4. היקף 2·(6+4)=20; שטח 6·4=24.' },
      { id: 'c', label: 'ג', answer: 'משימה פתוחה. יש לבחור פיקסל בתוך המסגרת שצבעתם; המרחק שלו מציר y שווה לערך x שלו.' },
    ],
  },
  {
    source: LIFE_DELIVERY_ROUTE,
    sourceFile: 'src/data/workbook/pages/life-delivery-route.ts',
    sourceBlobSha: '966ece529a7c30e519bdfcd536ab3cc1b5dd9f7d',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'y; הפרש.' },
      { id: 'a', label: 'א', answer: 'AB מקביל לציר x ונוסעים בו ימינה: 6−1=5. BC: 5−1=4. אורך המסלול כולו 5+4=9 יחידות.' },
      { id: 'b', label: 'ב', answer: 'בקו הישיר משתנים שני השיעורים. לכן נוסעים קטע אחד מקביל ל-x וקטע אחד מקביל ל-y; אפליקציית הניווט מחברת את הפרשי הדרך במקום למדוד בקו אווירי.' },
      { id: 'c', label: 'ג', answer: 'משימה פתוחה. הכתובת החדשה חייבת להיות באותו y של המסעדה, כלומר (x,1). אורך AD הוא |x−1| לפי ערך x שבחרתם.' },
    ],
  },
  {
    source: LIFE_PARK_MAP,
    sourceFile: 'src/data/workbook/pages/life-park-map.ts',
    sourceBlobSha: '7a53dddbe365215af2bebfd615ca44a8b7801372',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'נקודה; חיסור.' },
      { id: 'a', label: 'א', answer: '(0,5) היא הנדנדה. על ציר x נמצאים השער והיציאה. הנדנדה נמצאת על ציר y.' },
      { id: 'b', label: 'ב', answer: 'BC מקביל לציר x ואורכו 6−3=3. AF נמצא על ציר x ואורכו 8−1=7. בדוגמה משלכם ל-x זהה יש לבחור שתי נקודות בעלות אותו x.' },
    ],
  },
  {
    source: LIFE_PARK_ROUTE,
    sourceFile: 'src/data/workbook/pages/life-park-route.ts',
    sourceBlobSha: 'e3d549a8fa6a44cd46ef47ee2bf5ecbf0e57e303',
    exercises: [
      { id: 'b', label: 'ב', answer: 'הפנס: (0,3). הפרש הגבהים בינו לבין הנדנדה (0,5) הוא 2. נקודה עם x כמו הספסל (=3), מעל y=2 ומתחת y=5 יכולה להיות (3,3) או (3,4); מרחקה מציר y הוא 3.' },
      { id: 'c', label: 'ג', answer: 'מהשער לספסל: 2 ימינה ואז 2 למעלה, סה״כ 2+2=4. המסלול כולו: 4+3+3=10 יחידות.' },
    ],
  },
];
