import {
  RIGHT_ANGLE_INTRO,
  RIGHT_ANGLE_PRACTICE,
  RIGHT_ANGLE_BUILD,
  RAYS_RIGHT_ANGLE,
  RAYS_BUILD_RIGHT_ANGLE,
  RAYS_VERTEX_OFF_ORIGIN,
  RAYS_CLAIMS,
  RIGHT_ANGLE_SUMMARY,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

export const SOLUTION_SPECS_RIGHT_ANGLE: SolutionPageSpec[] = [
  {
    source: RIGHT_ANGLE_INTRO,
    sourceFile: 'src/data/workbook/pages/right-angle-intro.ts',
    sourceBlobSha: 'b880b1c7d1674da41946eddb845efe992f3fceae',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'אופקי; אנכי; ישרה.' },
      { id: 'a', label: 'א', answer: 'AB מקביל לציר x; ב־BC ערך x זהה; הזווית הישרה נמצאת בנקודה B.' },
      { id: 'b', label: 'ב', answer: 'זווית ישרה. הקטע הראשון מקביל לציר x והקטע השני מקביל לציר y.' },
      {
        id: 'c',
        label: 'ג',
        answer: 'AB מקביל לציר y. כדי ש־BC יהיה מקביל לציר x, לנקודה C חייב להיות y=5 ו־x שונה מ־2; למשל C(6,5). קודקוד הזווית הוא B והזווית ישרה.',
        method: 'העמוד אינו נותן שיעורים יחידים ל־C, ולכן כל נקודה אחרת על הקו y=5 מתקבלת.',
      },
    ],
  },
  {
    source: RIGHT_ANGLE_PRACTICE,
    sourceFile: 'src/data/workbook/pages/right-angle-practice.ts',
    sourceBlobSha: 'bfc8e47e4236774600da8e9b1310c5a80fe3643d',
    exercises: [
      { id: 'a', label: 'א', answer: 'ב־P: נכון — זווית ישרה. ב־Q: לא נכון.' },
      { id: 'b', label: 'ב', answer: 'ב־K: נכון — זווית ישרה. ב־T: לא נכון. הציר החסר בכלל הוא y.' },
      { id: 'c', label: 'ג', answer: 'אופקי; x; y.' },
    ],
  },
  {
    source: RIGHT_ANGLE_BUILD,
    sourceFile: 'src/data/workbook/pages/right-angle-build.ts',
    sourceBlobSha: '06d0748874801a1ce30babe99e318fd3926ab6ad',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'x; ישרה.' },
      { id: 'a', label: 'א', answer: 'הכיוון משתנה מימינה ללמעלה; נוצרת זווית ישרה.' },
      { id: 'b', label: 'ב', answer: 'במלבן 4 זוויות ישרות. AB ו־DC מקבילות לציר x; AD ו־BC מקבילות לציר y.' },
      {
        id: 'c',
        label: 'ג',
        answer: 'AB = 5 יחידות; BC = 3 יחידות; היקף = 16 יחידות; שטח = 15 יחידות רבועות.',
        method: 'AB: 6−1=5. BC: 4−1=3. היקף: 2·(5+3)=16. שטח: 5·3=15.',
      },
    ],
  },
  {
    source: RAYS_RIGHT_ANGLE,
    sourceFile: 'src/data/workbook/pages/rays-right-angle.ts',
    sourceBlobSha: 'e1fbf86bbc67ef4be40e29311e03a0d46394cb69',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'אופקית; ישרה.' },
      { id: 'a', label: 'א', answer: 'עם הקרן דרך (4,0): הנקודה (0,4). עם הקרן דרך (0,6): הנקודה (6,0).' },
      { id: 'b', label: 'ב', answer: 'OP על ציר x; גודל הזווית 90°; בכל נקודה על OP שיעור y הוא 0.' },
      { id: 'c', label: 'ג', answer: 'הקרן הנתונה על ציר x, ולכן הקרן השנייה על ציר y. למשל (0,2) ו־(0,5); בכל נקודה מתאימה x=0.' },
    ],
  },
  {
    source: RAYS_BUILD_RIGHT_ANGLE,
    sourceFile: 'src/data/workbook/pages/rays-build-right-angle.ts',
    sourceBlobSha: '3c0a5ad08b887e5c300dcbb5af00e0e34a11f18c',
    exercises: [
      { id: 'a', label: 'א', answer: 'B ו־C יכולות להיות כל שתי נקודות שונות על ציר x, למשל B(2,0), C(5,0). בשתיהן y=0.' },
      { id: 'b', label: 'ב', answer: 'הזווית הישרה בקודקוד O. OP = 4 יחידות ו־OQ = 4 יחידות.' },
    ],
  },
  {
    source: RAYS_VERTEX_OFF_ORIGIN,
    sourceFile: 'src/data/workbook/pages/rays-vertex-off-origin.ts',
    sourceBlobSha: 'c89857af2eaad77ce59f49af5d4436485f0803c8',
    exercises: [
      { id: 'intro', label: 'פתיח', answer: 'ראשית.' },
      {
        id: 'a',
        label: 'א',
        answer: 'AB מקביל לציר y. C ו־D צריכות להיות שתי נקודות שונות עם y=4 ו־x שונה מ־2; למשל C(5,4), D(7,4). קודקוד הזווית הוא B.',
      },
      {
        id: 'b',
        label: 'ב',
        answer: 'BC מקביל לציר x ולכן מאונך ל־AB. אורך AB הוא 4 יחידות. דוגמה לנקודה שאינה יוצרת זווית ישרה: (5,3), כי y שלה שונה מ־4.',
        method: 'אורך AB: 4−0=4.',
      },
    ],
  },
  {
    source: RAYS_CLAIMS,
    sourceFile: 'src/data/workbook/pages/rays-claims.ts',
    sourceBlobSha: 'ed12d1b873446e7b153e00d62668803b81302ed0',
    exercises: [
      { id: 'a', label: 'א', answer: 'דנה צודקת. AB אופקי, ולכן כדי ליצור זווית ישרה בנקודה B הקטע BC חייב להיות אנכי; C(3,5) מתאימה.' },
      {
        id: 'b',
        label: 'ב',
        answer: '1 — לא ייתכן. 2 — נכונה בהכרח לנקודה תקינה על ציר y השונה מראשית הצירים. 3 — נכונה בהכרח במסגרת הרביע הראשון.',
      },
      { id: 'c', label: 'ג', answer: 'רחוב האורן מקביל לציר x. הרחוב החדש על ציר y; למשל (0,2) ו־(0,6). בשתיהן x=0.' },
    ],
  },
  {
    source: RIGHT_ANGLE_SUMMARY,
    sourceFile: 'src/data/workbook/pages/right-angle-summary.ts',
    sourceBlobSha: 'd897acb741f25548903b41bc037b9157b6c7ccb0',
    exercises: [
      {
        id: 'a',
        label: 'א',
        answer: 'AB ו־CD מקבילות לציר x; הזוויות ישרות; יש 4 זוויות ישרות. AB=5, BC=4, היקף=18, שטח=20.',
        method: 'AB: 7−2=5. BC: 5−1=4. היקף: 2·(5+4)=18. שטח: 5·4=20.',
      },
      {
        id: 'b',
        label: 'ב',
        answer: 'S(2,5). הזווית ב־Q ישרה. אורך=4, רוחב=3, היקף=14, שטח=12.',
        method: '6−2=4; 5−2=3; היקף 2·(4+3)=14; שטח 4·3=12.',
      },
      { id: 'c', label: 'ג', answer: '1 נכון; 2 לא נכון; 3 נכון.' },
    ],
  },
];
