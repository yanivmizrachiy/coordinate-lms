// ===== Coordinate LMS - Workbook pages content =====
// Structure per page: { title, instructions, questions: [{ prompt, answer }] }
// answer can be a string or array of accepted strings (case-insensitive, trimmed).
// Content is being progressively transcribed to match the original 77-page workbook
// (מערכת צירים ברביע הראשון) page-for-page. This file is self-contained and
// does not modify or depend on the original repository at runtime.

const PAGES = [
  // ----- Page 1 -----
  {
    title: 'מכירים את הצירים',
    instructions: 'הציר האופקי, הציר האנכי וראשית הצירים',
    questions: [
      { prompt: 'ציר x הוא הציר האופקי. ציר y הוא הציר ה___ (השלימו את המילה)', answer: ['אנכי'] },
      { prompt: 'הנקודה שבה נפגשים שני הצירים נקראת ראשית ___', answer: ['הצירים'] },
      { prompt: 'ככל שזזים ימינה על ציר x, המספרים ___ (גדלים / קטנים)', answer: ['גדלים'] },
      { prompt: 'מהו מספר המפגשים שבו נפגשים שני הצירים (ראשית הצירים)?', answer: ['0'] },
      { prompt: 'נקודה A נמצאת ב-(4,3). מהו ה-x שלה?', answer: ['4'] }
    ]
  }
];
