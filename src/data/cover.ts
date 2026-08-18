/* ===========================================================================
   Cover page — the approved first page of the booklet.

   The approved artwork lives at public/assets/covers/workbook-cover.png and is
   served at assets/covers/workbook-cover.png (BASE_URL keeps the GitHub Pages
   subpath working). It is the booklet's first A4 page: it is NOT part of the
   worksheet numbering, and it never appears when printing a single worksheet.
   =========================================================================== */

export interface CoverImage {
  /** File name inside public/assets/covers/. */
  file: string;
  /** Resolved URL (respects the Pages base path). */
  src: string;
  alt: string;
}

const COVER_DIR = `${import.meta.env.BASE_URL}assets/covers/`;

/** THE approved cover — the booklet's first page. */
export const APPROVED_COVER: CoverImage & { webp: string } = {
  file: 'workbook-cover.png',
  src: `${COVER_DIR}workbook-cover.png`,
  /* The same approved artwork, 202 KB instead of 2.3 MB. Served first, with the
     PNG behind it, so nothing is lost if a browser cannot take WebP. */
  webp: `${COVER_DIR}workbook-cover.webp`,
  alt: 'כריכת החוברת: מערכת צירים — הרביע הראשון',
};

/* --------------------------------------------------------------------------
   The opening film.

   Ten seconds of a Jerusalem tram at golden hour, over which the first quadrant
   draws itself — the axes, then the points (2,3), (3,1), (4,5) and (5,2). It is
   the booklet's subject in motion, so it opens the app rather than decorating
   it, and it plays ONCE: the last frame is the finished coordinate system, and
   that is where the film is meant to rest.

   Shipped small on purpose. The source was 2.4 MB with an audio track nobody
   hears; stripped and re-encoded it is 835 KB of H.264, 485 KB of VP9, and a
   404 KB cut for narrow screens. The poster is the FIRST frame, so playback
   starts without a jump, and the last frame is kept as a still for anyone who
   asked their device not to animate.
   -------------------------------------------------------------------------- */
const FILM_DIR = `${import.meta.env.BASE_URL}assets/cover/`;

export const OPENING_FILM = {
  webm: `${FILM_DIR}opening-720.webm`,
  mp4: `${FILM_DIR}opening-720.mp4`,
  poster: `${FILM_DIR}opening-first.webp`,
  /** The finished coordinate system — shown instead of the film when motion is off. */
  still: `${FILM_DIR}opening-last.webp`,
  stillFallback: `${FILM_DIR}opening-last.jpg`,
  alt: 'רכבת קלה בירושלים, ומעליה נבנית מערכת צירים ברביע הראשון עם הנקודות (2,3), (3,1), (4,5) ו־(5,2)',
} as const;

/* --------------------------------------------------------------------------
   The district's badge — „יחד מתמטיקה · מחוז ירושלים והעיר ירושלים”.

   Taken from Yaniv's `misparim` repo, read-only: the clone was made outside
   this repo, its remote removed before anything was copied, and it was deleted
   afterwards. Nothing there was written to.

   It rides OVER the opening film rather than being burned into it. Burning it
   in would fix it at 1280×720 — soft on a large screen, impossible to change,
   and unusable on paper. As an image it stays crisp at any size, animates with
   the title, and is the same file the printed sheets carry.
   -------------------------------------------------------------------------- */
const BRAND_DIR = `${import.meta.env.BASE_URL}assets/brand/`;

export const DISTRICT_BADGE = {
  webp: `${BRAND_DIR}district-logo.webp`,
  png: `${BRAND_DIR}district-logo.png`,
  alt: 'יחד מתמטיקה — מחוז ירושלים והעיר ירושלים',
} as const;
