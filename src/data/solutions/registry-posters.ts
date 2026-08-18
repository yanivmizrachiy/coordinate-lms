import {
  POSTER_SECRET_PICTURE,
  POSTER_SECRET_WORD,
  POSTER_ROUTE_RACE,
  POSTER_TREASURE_MAZE,
} from '../workbook/pages';
import type { SolutionPageSpec } from './types';

const POSTER_SOURCE = 'src/data/workbook/pages/poster-games.ts';
const POSTER_SOURCE_SHA = '687aa5c08d6bd33a52c508b84a9c363e1d3856f4';

export const SOLUTION_SPECS_POSTERS: SolutionPageSpec[] = [
  {
    source: POSTER_SECRET_PICTURE,
    sourceFile: POSTER_SOURCE,
    sourceBlobSha: POSTER_SOURCE_SHA,
    sourceAssets: [
      { path: 'public/assets/games/secret-picture.png', blobSha: 'fc62366af03d801adf53895c8daea2b7c17d342b' },
      { path: 'public/assets/games/secret-picture.webp', blobSha: '12d5c5a064099ef0017b11d3d500ae726a702887' },
    ],
    exercises: [
      {
        id: 'picture',
        label: 'הציור הסודי',
        answer: 'מתקבל בית: מסגרת אדומה, גג כחול, דלת ירוקה ושני חלונות.',
        method: 'מחברים כל קבוצת נקודות בצבע שלה לפי הסדר המודפס.',
      },
      { id: 'highest', label: 'הנקודה הגבוהה', answer: 'הנקודה הגבוהה ביותר היא (5,10), בקודקוד הגג.' },
      {
        id: 'same-y',
        label: 'שתי נקודות עם אותו y',
        answer: 'דוגמה: (2,2) ו־(8,2). גם זוגות אחרים בעלי אותו שיעור y שמופיעים בציור מתקבלים.',
      },
    ],
  },
  {
    source: POSTER_SECRET_WORD,
    sourceFile: POSTER_SOURCE,
    sourceBlobSha: POSTER_SOURCE_SHA,
    sourceAssets: [
      { path: 'public/assets/games/secret-word-poster.png', blobSha: 'e1055a19757a9200195f6a5d71a85a91e9a747b8' },
      { path: 'public/assets/games/secret-word-poster.webp', blobSha: '93c42bcf836319c67442bcea8336c43d75e205f7' },
    ],
    exercises: [
      { id: '1', label: '1', answer: 'צ — האות שבנקודה (2,8).' },
      { id: '2', label: '2', answer: 'י — הנקודה שעל הקו x=5.' },
      { id: '3', label: '3', answer: 'ר — האות שבנקודה (7,7).' },
      { id: '4', label: '4', answer: 'י — האות שעל הקו y=3.' },
      { id: '5', label: '5', answer: 'ם — האות הגבוהה ביותר וגם הימנית ביותר.' },
      { id: 'word', label: 'מילת הסוד', answer: 'צירים.' },
    ],
  },
  {
    source: POSTER_ROUTE_RACE,
    sourceFile: POSTER_SOURCE,
    sourceBlobSha: POSTER_SOURCE_SHA,
    sourceAssets: [
      { path: 'public/assets/games/route-race.png', blobSha: '8e9ebf3c6475fe5d221502e9916751f426ae0468' },
      { path: 'public/assets/games/route-race.webp', blobSha: '5eb12bc189e6b0897160b5a93b488938d29927b1' },
    ],
    exercises: [
      {
        id: 'endpoints',
        label: 'נקודות הסיום',
        answer: 'מסלול א: (6,4). מסלול ב: (4,8). מסלול ג: (7,5). מסלול ד: (6,4).',
        method: 'ימינה/שמאלה משנות רק x; למעלה/למטה משנות רק y, לפי מספר היחידות בכל הוראה.',
      },
      { id: 'highest', label: 'בדיקה מהירה 2', answer: 'מסלול ב מגיע הכי גבוה, כי נקודת הסיום שלו היא (4,8).' },
      { id: 'same-end', label: 'בדיקה מהירה 3', answer: 'מסלולים א ו־ד מסתיימים באותה נקודה: (6,4).' },
      { id: 'rightmost', label: 'בדיקה מהירה 4', answer: 'מסלול ג מסתיים הכי ימינה: (7,5).' },
    ],
  },
  {
    source: POSTER_TREASURE_MAZE,
    sourceFile: POSTER_SOURCE,
    sourceBlobSha: POSTER_SOURCE_SHA,
    sourceAssets: [
      { path: 'public/assets/games/treasure-maze.png', blobSha: '8ade20e5c245409415cbae657b9aae4bf044937c' },
      { path: 'public/assets/games/treasure-maze.webp', blobSha: 'fd228e37b292416c94df9536a63bc035f36df15b' },
    ],
    exercises: [
      { id: 'start', label: 'נקודת התחלה', answer: '(1,1).' },
      {
        id: 'stars',
        label: 'הכוכבים',
        answer: 'חמשת הכוכבים נמצאים בנקודות (2,3), (4,5), (6,4), (7,7), (9,8).',
      },
      { id: 'finish', label: 'האוצר', answer: 'נקודת היעד המודפסת היא (10,10).' },
    ],
  },
];
