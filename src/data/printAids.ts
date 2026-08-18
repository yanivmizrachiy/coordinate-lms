/* ===========================================================================
   המחשות להדפסה — printable illustration sheets.

   Source: an axes sheet by Ayelet Krispin ("צירים ליצירת הרביע הראשון"),
   presented in the signed-numbers / misparim "AidSheet" design: a true A4 card
   with a centred title, thin gold rules, and the district source credit.
   Images live in public/assets/print-aids/ (served at assets/print-aids/).
   =========================================================================== */

export interface PrintAid {
  id: string;
  title: string;
  /** Resolved URL (respects the deploy base path). */
  image: string;
  alt: string;
}

const DIR = `${import.meta.env?.BASE_URL ?? '/'}assets/print-aids/`;

/** Source credit at the foot of every aid sheet (as in the misparim aid design). */
export const AID_CREDIT_SOURCE = 'הדרכה במחוז ירושלים והעיר ירושלים - מנח"י, בהובלת איילת קריספין';

export const PRINT_AIDS: PrintAid[] = [
  {
    id: 'first-quadrant-axes',
    title: 'צירים ליצירת הרביע הראשון',
    image: `${DIR}first-quadrant-axes-01.png`,
    alt: 'שלושה צירי x אופקיים ושלושה צירי y אנכיים, ממוספרים 0 עד 10, ליצירת מערכות צירים ברביע הראשון',
  },
];
