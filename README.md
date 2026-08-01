# מערכת צירים — הרביע הראשון

אפליקציה אחת ללימוד מערכת הצירים ברביע הראשון: **77 עמודים ממוספרים** (דפי עבודה, 7 שעשועונים משולבים ודף הצופן המודפס), עמוד שער, עמוד תוכן עניינים, סרט פתיחה, תצוגת מובייל מלאה והדפסת **A4** מקצועית — הכול בריפו אחד, בכתובת אחת ובקובץ כניסה אחד.

> ריפו ה־LMS היחיד שמותר לכתוב אליו: `yanivmizrachiy/coordinate-lms`.
> `yanivmizrachiy/coordinate-first-quadrant` הוא מקור החוברת לקריאה בלבד.

## מה יש באפליקציה

- **סרט הפתיחה** (`#/`) — עשר שניות של רכבת קלה בירושלים שמעליהן הרביע הראשון משרטט את עצמו. הוא ממלא את המסך, נושא את הקול שלו, ורץ פעם אחת עד שהוא נח על מערכת הצירים המוגמרת. אין עליו דבר מלבד הלוגו, כפתור קול ו„התחל".
- **התפריט** (`#/menu`) — תצוגה · הורדה · הדפסה · וואטסאפ, ובוחר עמודים.
- **דפי העבודה** (`#/workbook/:n`) — 77 עמודים, ניווט עמוד־אחר־עמוד, זום, שמירת המיקום האחרון והדפסת עמוד בודד.
- **החוברת הנפתחת** (`#/book`) — חוברת דפדוף דיגיטלית: כפולה במסך רחב, דף יחיד בטלפון, גרירת דף, זום, מסך מלא ותוכן עניינים צף.
- **החוברת הרציפה** (`#/print`) — שער, עמוד תוכן עניינים צבעוני, ואחריהם כל 77 העמודים, A4 אמיתי — מכאן מדפיסים (הכול או דפים נבחרים).
- **שעשועונים** — 7 שעשועונים, כל אחד עמוד ממוספר בתוך הנושא שלו (אין אזור נפרד), שנבנו כרכיבים מתמטיים מדויקים ולא כתמונות.
- **מובייל** — RTL מלא, ללא גלילה אופקית, כפתורים גדולים, טעינה מהירה.
- **הדפסה** — כל עמוד ניתן להדפסה עצמאית ב־A4, כולל הדפסת שחור־לבן שחלה על הדפים בלבד ובחירת טווח עמודים.

## הרצה מקומית

```bash
npm install
npm run dev          # שרת פיתוח (Vite) עם רענון חם
```

## Build

```bash
npm run build        # בדיקת טיפוסים + בנייה ל-dist/
npm run preview      # תצוגה מקדימה של התוצר על http://localhost:4319
```

התוצר ב־`dist/` הוא אתר סטטי מלא — קובץ `index.html` אחד ונכסים, ללא שרת וללא תלות ברשת בזמן ריצה.

## בדיקות

```bash
npm run verify       # הכול: טיפוסים · בדיקות · בנייה · בדיקות דפדפן
npm test             # מתמטיקה, משחקים, תוכן החוברת וכללי הפריסה (Vitest)
npm run test:visual  # בדיקות רינדור end-to-end (Playwright)
npm run answers:coverage       # דוח תשובות מדויק לכל 77 העמודים
npm run firebase:check:static  # חוזה קוד ו-workflow בלי לדרוש סודות
npm run release:check          # שער שחרור; נכשל בכוונה אם Firebase חסר
```

הבדיקות אוכפות את הכללים שב־`RULES.md` ואת חוזה תוכן החוברת ההיסטורי —
מספור, ניסוח, גודל סרטוטים, גופן, חיתוך עמודים, כיווניות עברית ועוד.
**כלל שאין לו בדיקה נחשב כלל שלא קיים.**

## פרסום ל־GitHub Pages

הפרסום **ידני בלבד**. יש להריץ מלשונית **Actions** את ה־workflow בשם *Deploy to GitHub Pages (manual)*. ה־`base` יחסי (`./`) כך שהאתר עובד גם תחת תת־נתיב.

## מבנה התיקיות

```
index.html                    קובץ הכניסה היחיד (Vite)
src/
  main.ts                     אתחול, סרגל עליון וניתוב
  router.ts                   נתב מבוסס hash (מתאים ל-Pages)
  styles/                     מערכת עיצוב: tokens, base, app, workbook, grayscale
  lib/                        coordinateGrid (SVG), coordinateMath (טהור ונבדק),
                              fitSheet (ניצול שטח העמוד), dom, storage
  data/cover.ts               השער המאושר, סרט הפתיחה, ולוגו המחוז
  data/workbook/pages/        קובץ אחד לכל עמוד, בשם שמתאר מה הוא מלמד
  data/workbook/authoring.ts  בניית הגיליון: כותרת, מספר, כותרת תחתונה, כלי כתיבה
  data/workbook/index.ts      BOOK — סדר הקריאה, ומכאן נגזר המספור
  games/                      8 המשחקים + מנוע "גילוי מילה/קוד" משותף
  views/                      home (סרט הפתיחה) · menu · pageViewer · book ·
                              coverSheet · tocSheet · printBar
public/assets/covers/         תמונת השער המאושרת
public/assets/cover/          סרט הפתיחה והפריימים שלו
public/assets/brand/          לוגו המחוז
public/assets/games/          פוסטרי השעשועונים
tests/                        בדיקות Vitest + בדיקות e2e של Playwright
```

## כיצד להוסיף עמוד

1. צרו קובץ חדש ב־`src/data/workbook/pages/` (שם שמתאר מה העמוד מלמד) והשתמשו ב־`sheet({ sectionClass, title, subtitle, content })`. כותבים רק את תוכן העמוד — הכותרת, מספר העמוד והכותרת התחתונה נבנים לבד.
2. ייצאו אותו מ־`pages/index.ts` ושבצו אותו במקום הנכון ב־`BOOK` שב־`src/data/workbook/index.ts` — המספור מתעדכן לבדו.
3. סרטוטים נכתבים דרך `grid({ … })`; חישובים דרך `exercise()` / `exerciseGiven()` / `calcBox()`. **אין לכתוב את המרקאפ ביד** — יש בדיקה שאוסרת זאת.
4. הריצו `npm run verify`.

## כיצד להוסיף משחק

1. צרו קובץ ב־`src/games/` המייצא `GameDefinition` (או השתמשו ב־`createRevealGame`).
2. שמרו את **נתוני** המשחק נפרדים מהתצוגה, כדי שאפשר יהיה לבדוק אותם.
3. רשמו את המשחק במערך `GAMES` שב־`src/games/index.ts`.
4. הוסיפו בדיקה ב־`tests/games.test.ts` שמוכיחה שהמשחק פתיר ושהתוצאה נכונה.

## זיכרון הפרויקט

- `RULES.md` — **דף הכללים היחיד** לעבודת LMS.
- `USER_MEMORY.md` ו־`HANDOFF.md` — ארכיון החלטות חוברת, לא הרשאת תפעול.
- `CLAUDE.md` — שלט הפניה בלבד; אין בו כללים משלו.

## Coordinate LMS migration

This repository preserves the exact printable workbook and adds a student
practice, scoring, registration, activity tracking and teacher-dashboard layer.

The original Perplexity prototype is preserved under
`_legacy/perplexity-original`.

Current launch status, measured answer coverage, and external blockers are in
`MIGRATION_STATUS.md`. The exact human Firebase and two-device steps are in
`docs/CLASSROOM_LAUNCH_CHECKLIST.md`; absence of those steps is never reported
as a successful central deployment.
