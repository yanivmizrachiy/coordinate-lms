/* Shared workbook data types. */

export interface WorkbookPageContent {
  /** 1-based page number (1..34). */
  n: number;
  /** DOM id, e.g. "page-1". */
  id: string;
  /** The <section> class list, e.g. "sheet guided dense". */
  sectionClass: string;
  /** Heading text, for the table of contents. */
  title: string;
  /** Sub-heading text, for the table of contents. */
  subtitle: string;
  /** Full <section>…</section> markup for the sheet. */
  html: string;
  /**
   * When set, this sheet hosts an interactive game: the view mounts it into the
   * page's `[data-game-host]` element and unmounts it on navigation.
   */
  gameId?: string;
}

export interface WorkbookTopic {
  id: string;
  title: string;
  /** Page numbers that belong to this topic, in order. */
  pages: number[];
}
