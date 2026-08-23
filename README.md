# מערכת צירים — הרביע הראשון

אפליקציה אחת לחוברת מערכת הצירים ברביע הראשון: **78 עמודים ממוספרים**, תצוגת הדפסה, חוברת דיגיטלית, תרגול מתוקשב, פתרונות למורה, משחקים ודשבורד — מאותו תוכן קנוני.

> **`yanivmizrachiy/coordinate-lms` הוא ה־MASTER היחיד של הפרויקט.**
> `RULES.md` הוא **מקור האמת היחיד לכללי העבודה והמוצר**. קראו אותו לפני כל שינוי.
> `yanivmizrachiy/coordinate-first-quadrant` הוא ארכיון היסטורי קפוא; אין לפתח בו ואין לטעון ממנו תוכן בזמן ריצה או build.

## משטחי האפליקציה

- **פתיחה** (`#/`) — מסך הכניסה לתרגול ולחשבון.
- **תפריט כללי** (`#/menu`) — כלי צפייה/חוברת/הדפסה ושירותים כלליים.
- **תרגול מתוקשב** (`#/workbook/:n`) — אותו דף קנוני שעליו מולבשת שכבת LMS: מענה, `להגיש ←` לכל שאלה, משוב, רמזים, ניקוד וניווט. כלי הדפסה/הורדה אינם חלק ממסך התרגול.
- **חוברת דפדוף** (`#/book`) — קריאת החוברת כדפים.
- **תצוגת הדפסה** (`#/print`) — שער, תוכן עניינים וכל 78 העמודים להדפסת A4.
- **פתרונות/מורה** — פתרונות, ניהול מפתחות תשובה ודשבורד בהתאם להרשאות.
- **משחקים** — 7 משחקים הרשומים במקור אחד: `src/games/index.ts`. כאשר משחק מחובר לעמוד, הוא שכבת מסך ואינו יוצר עותק חדש של דף העבודה.

## עקרונות מבנה חשובים

- תוכן הדף נכתב פעם אחת ב־`src/data/workbook/` וממנו נגזרות ההדפסה והתצוגה המתוקשבת.
- שכבת התרגול אינה מעתיקה שאלות או שרטוטים; היא מוסיפה אינטראקציה מעל התוכן הקנוני.
- ממשק התרגול מותאם למובייל, RTL, ללא גלילה אופקית, עם פקדים קומפקטיים ונוחים למגע.
- שינויי ניקוד, ניסיונות, משוב, רמזים, קבלת תשובות ושמירה מחולקים לבעלים ברורים. מפת הבעלות המדויקת נמצאת ב־`RULES.md`.

## הרצה מקומית

```bash
npm install
npm run dev
```

## אימות ובנייה

```bash
npm run verify
npm run release:check
```

`npm run verify` מריץ בחבילה אחת:

- בדיקת כיסוי מפתחות תשובה
- TypeScript typecheck
- בדיקות unit/content
- בדיקות הרשאות Firestore מול emulator
- build
- בדיקות Playwright/visual

פקודות ממוקדות זמינות גם בנפרד:

```bash
npm test
npm run typecheck
npm run test:firestore
npm run test:visual
npm run answers:coverage:check
npm run build
npm run firebase:check:static
npm run release:report:static
```

`npm run release:check` מוסיף את שערי האבטחה וה־release readiness. הוא עשוי להיכשל במכוון כאשר תצורת production חיצונית עדיין חסרה; כישלון כזה אינו סיבה להציג את המערכת כפרוסה או מוכנה ל־production.

## מבנה מרכזי

```text
index.html
src/
  main.ts                    bootstrap + routing shell
  data/workbook/             תוכן החוברת הקנוני
  data/solutions/            פתרונות קנוניים למורה
  games/                     רישום ומימוש המשחקים
  lms/                       grading, feedback, hints, persistence, auth
  styles/                    presentation layers
  views/                     מסכי האפליקציה
firestore.rules              גבולות הרשאה ושמירה
scripts/                     build / coverage / Firebase / release checks
tests/                       Vitest + Firestore emulator + Playwright
RULES.md                     מקור האמת היחיד לכללי הפרויקט
```

## שינוי תוכן או הוספת עמוד

1. מתחילים ב־`RULES.md` ומסווגים את השינוי כ־CONTENT או INTERACTION/PRESENTATION.
2. שינוי תוכן, מתמטיקה, שרטוט או ניסוח נעשה ב־`src/data/workbook/` בלבד.
3. עמוד חדש מיוצא מ־`src/data/workbook/pages/index.ts` ומשובץ ב־`BOOK` שב־`src/data/workbook/index.ts`; המספור נגזר מן הסדר.
4. משתמשים בכלי ה־authoring והשרטוט הקיימים במקום לכתוב שכבת תוכן מקבילה.
5. מריצים `npm run verify`.

לשינויים שאינם תוכן — ניקוד, מגבלת ניסיונות, קבלת תשובות, ניסוחי מורה, רמזים, שמירה, הרשאות או ממשק תרגול — השתמשו ב־**Future change map** שב־`RULES.md`; הוא מגדיר קובץ בעלים לכל אחריות כדי למנוע תיקונים בכמה מקומות.

## מסמכי הפרויקט

- `RULES.md` — **מקור האמת היחיד** לכללי העבודה והמוצר.
- `CLAUDE.md` — pointer בלבד אל `RULES.md`.
- `USER_MEMORY.md` — alias תאימות שמפנה ישירות אל `RULES.md`; אין לכתוב בו כללים נפרדים.
- `HANDOFF.md` ו־`MIGRATION_STATUS.md` — pointers בלבד אל חומר היסטורי/עדויות; הארכיונים המלאים נמצאים תחת `_legacy/` ואינם סמכות חיה.
- דוחות generated הם מצב/עדויות נקודתיים; הם אינם כללי מוצר ואינם גוברים על `RULES.md`.

## פרסום

GitHub Pages נשאר workflow ידני. מיזוג ל־`main` ופריסת production דורשים אישור מפורש לפעולה הנוכחית, בהתאם ל־`RULES.md`.
