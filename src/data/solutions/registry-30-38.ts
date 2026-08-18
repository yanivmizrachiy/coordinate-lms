import {
  MOVE_INTRO,
  MOVE_PRACTICE,
  DISTANCE_INTRO,
  DISTANCE_PRACTICE,
  SHAPE_MOVE,
  ENCRYPTED_ROUTE_PRINT,
  COORDINATE_MAZE_PRINT,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_30_38: SolutionPageSpec[] = [
  {
    source: MOVE_INTRO,
    sourceFile: 'src/data/workbook/pages/move-intro.ts',
    sourceBlobSha: 'dc4a93c0a4584fcebb68ea14f511ba697c706413',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'x; למטה.' },
      { id: 'a', label: 'א', answer: '(5,4); (2,3); (3,5); (7,3).' },
      { id: 'b', label: 'ב', answer: '(6,3); (2,4); (5,5); (3,3).' },
      { id: 'c', label: 'ג', answer: 'נקודת ביניים (6,1); נקודה סופית (6,4). בשלב הראשון השתנה x; בשלב השני השתנה y.' },
      { id: 'd', label: 'ד', answer: 'נקודת המקור היא (3,5).' },
    ],
  },
  {
    source: MOVE_PRACTICE,
    sourceFile: 'src/data/workbook/pages/move-practice.ts',
    sourceBlobSha: '27858a484cfedc5e12f047f3ed5989e828fb68fb',
    exercises: [
      { id: 'rules', label: 'כללי ההזזה', answer: 'ימינה/שמאלה: x משתנה ו-y נשאר זהה. למעלה/למטה: y משתנה ו-x נשאר זהה.' },
      { id: 'calc', label: 'מחשבים הזזה', answer: '(7,4); (3,3); (5,4); (4,4).' },
      { id: 'path', label: 'מסלול בשני שלבים', answer: 'B(6,2); C(6,5).' },
      { id: 'discover', label: 'מגלים את ההזזה', answer: '5 יחידות ימינה; (7,6); המספר החסר הוא 2.' },
    ],
  },
  {
    source: DISTANCE_INTRO,
    sourceFile: 'src/data/workbook/pages/distance-intro.ts',
    sourceBlobSha: 'e4f08bc6d9453a25d57d6f5e79f5fc8bad9e082a',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: '0; x.' },
      { id: 'a', label: 'א', answer: 'A(3,5): 3, (0,5), 5, (3,0). B(7,2): 7, (0,2), 2, (7,0). C(4,4): 4, (0,4), 4, (4,0). D(1,6): 1, (0,6), 6, (1,0).' },
      { id: 'b', label: 'ב', answer: 'A קרובה יותר לציר y; B קרובה יותר לציר x; C נמצאת במרחקים זהים משני הצירים.' },
      { id: 'c', label: 'ג', answer: 'ל-E ול-F שיעור y זהה. EF = 7−2 = 5 יחידות. בדוגמאות משלכם יש לבחור שתי נקודות עם אותו y.' },
      { id: 'd', label: 'ד', answer: 'ל-G ול-H שיעור x זהה. GH = 6−1 = 5 יחידות. אורי חיבר את ערכי x במקום לחסר; החישוב הנכון 7−2=5.' },
      { id: 'e', label: 'ה', answer: 'אם המרחק משני הצירים זהה, אז x=y, כי המרחק מציר y הוא x והמרחק מציר x הוא y.' },
    ],
  },
  {
    source: DISTANCE_PRACTICE,
    sourceFile: 'src/data/workbook/pages/distance-practice.ts',
    sourceBlobSha: '20257ab6099f8b5dc2834982f8e52167876e3bc3',
    exercises: [
      { id: 'axes-distance', label: 'מרחק מן הצירים', answer: '5; x; 0.' },
      { id: 'to-axes', label: 'אל הצירים', answer: 'מ-(7,3) לציר y: 7 יחידות שמאלה. מ-(4,5) לציר x: 5 יחידות למטה. מ-(3,6) לציר x מתקבלת (3,0).' },
      { id: 'see', label: 'רואים את המרחק', answer: 'Q(0,4); R(6,0).' },
      { id: 'short', label: 'המסלול הקצר', answer: 'מציר y: 3 יחידות; מציר x: 5 יחידות. לכן המסלול לציר y קצר יותר ב-2 יחידות.' },
    ],
  },
  {
    source: SHAPE_MOVE,
    sourceFile: 'src/data/workbook/pages/shape-move.ts',
    sourceBlobSha: '20277079c5be22983589e759c910992e7c06cb21',
    exercises: [
      { id: 'a', label: 'א', answer: 'A(1,1); B(4,1); C(4,3); D(1,3).' },
      { id: 'b', label: 'ב', answer: 'אחרי 3 ימינה: A(4,1); B(7,1); C(7,3); D(4,3).' },
      { id: 'c', label: 'ג', answer: 'אחרי 2 למעלה מהמקור: A(1,3); B(4,3); C(4,5); D(1,5).' },
      { id: 'd', label: 'ד', answer: 'ימינה: x משתנה ו-y נשאר זהה. למעלה: y משתנה ו-x נשאר זהה. AB באורך 3 יחידות לפני ההזזה וגם אחריה.' },
    ],
  },
  {
    source: ENCRYPTED_ROUTE_PRINT,
    sourceFile: 'src/data/workbook/pages/encrypted-route-print.ts',
    sourceBlobSha: '90995892902488b1a9eb99367f908e2ac91bae2b',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'המילה החסרה היא „מילה”.' },
      { id: 'b', label: 'ב', answer: 'מסלול 1: (5,4) → ק. מסלול 2: (5,1); ההזזה האחרונה היא למטה. מסלול 3: (6,5) → ם.' },
      { id: 'c', label: 'ג', answer: 'המילה הסודית היא „קסם”. האות האמצעית היא ס והיא מתקבלת במסלול 2.' },
      { id: 'd', label: 'ד', answer: 'לתחנות 1 ו-2 ערך x זהה (=5). תחנת מסלול 3 נמצאת מימין לתחנת מסלול 1. היא רחוקה 5 יחידות מציר x.' },
      { id: 'e', label: 'ה', answer: 'משימה פתוחה: נקודת D חייבת להיות במרחק 2 מציר y, כלומר x=2. פקודת התנועה והתחנה הסופית תלויות בבחירת התלמיד וחייבות להתאים זו לזו.' },
    ],
  },
  {
    source: COORDINATE_MAZE_PRINT,
    sourceFile: 'src/data/workbook/pages/coordinate-maze-print.ts',
    sourceBlobSha: 'eb68a08c8fb207b8215ad7f299c3621d403fa687',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'למטה; y.' },
      { id: 'a', label: 'א', answer: 'יש יותר ממסלול תקין אחד. דוגמה תקינה: (0,0)→(0,4)→(4,4)→(4,2)→(6,2)→(6,4). נקודות הפנייה: (0,4), (4,4), (4,2), (6,2); במסלול זה 14 צעדים.' },
      { id: 'b', label: 'ב', answer: 'התחלה (0,0), יעד (6,4). בצעד אופקי y נשאר זהה; בצעד אנכי אפשר לנוע גם למטה. במסלול הדוגמה הצעד הראשון למעלה ומגיעים ל-(0,1). את קיר x=2 עוברים רק ב-y>3; את קיר x=5 עוברים רק ב-y<3.' },
      { id: 'c', label: 'ג', answer: 'הפרש x הוא 6; הפרש y הוא 4. סכומם 10, אך מסלול תקין חייב להיות ארוך יותר בגלל עקיפת הקירות; בדוגמה יש 14 צעדים.' },
    ],
  },
];
