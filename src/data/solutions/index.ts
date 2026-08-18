import { topicOfSource, workbookPageOfSource } from '../workbook';
import { SOLUTION_SPECS as SOLUTION_SPECS_1_16 } from './registry';
import { SOLUTION_SPECS_17_29 } from './registry-17-29';
import { SOLUTION_SPECS_30_38 } from './registry-30-38';
import { SOLUTION_SPECS_39_45 } from './registry-39-45';
import { SOLUTION_SPECS_46_50 } from './registry-46-50';
import { SOLUTION_SPECS_51_58 } from './registry-51-58';
import { SOLUTION_SPECS_59_64 } from './registry-59-64';
import { SOLUTION_SPECS_65_70 } from './registry-65-70';
import { SOLUTION_SPECS_RIGHT_ANGLE } from './registry-right-angle';
import { SOLUTION_SPECS_POSTERS } from './registry-posters';
import type { ResolvedSolutionPage } from './types';

export type { ExerciseSolution, SolutionPageSpec, ResolvedSolutionPage } from './types';

export const SOLUTION_SPECS = [
  ...SOLUTION_SPECS_1_16,
  ...SOLUTION_SPECS_17_29,
  ...SOLUTION_SPECS_30_38,
  ...SOLUTION_SPECS_39_45,
  ...SOLUTION_SPECS_46_50,
  ...SOLUTION_SPECS_51_58,
  ...SOLUTION_SPECS_59_64,
  ...SOLUTION_SPECS_65_70,
  ...SOLUTION_SPECS_RIGHT_ANGLE,
  ...SOLUTION_SPECS_POSTERS,
];

/**
 * Resolve current page number/title/chapter from the canonical workbook.
 * Nothing in the solution registry owns a page number.
 */
export const SOLUTION_PAGES: ResolvedSolutionPage[] = SOLUTION_SPECS.map((spec) => {
  const page = workbookPageOfSource(spec.source);
  const topic = topicOfSource(spec.source);
  if (!page || !topic) {
    throw new Error(`Solution source is not present in BOOK: ${spec.sourceFile}`);
  }
  return { ...spec, page, topic };
});

export const solutionPageByNumber = (pageNumber: number): ResolvedSolutionPage | undefined =>
  SOLUTION_PAGES.find((entry) => entry.page.n === pageNumber);
