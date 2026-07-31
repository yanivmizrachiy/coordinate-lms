/* Game contracts. A game renders itself into a host element and returns a
   cleanup function that the router calls when the learner navigates away. */
import type { GridSpec } from '../lib/coordinateGrid';

export interface GameDefinition {
  id: string;
  title: string;
  icon: string;
  /** One-line description for the games hub. */
  short: string;
  /** The skill the game practices (shown as a tag). */
  skill: string;
  mount(root: HTMLElement): () => void;
}

/** Answer kinds shared by data-driven games. */
export type AnswerKind = 'text' | 'point' | 'choice';

export interface RevealStep {
  prompt: string;
  grid?: GridSpec;
  kind: AnswerKind;
  /** Canonical correct answer (already normalised, see normalizeAnswer). */
  answer: string;
  /** Extra accepted spellings. */
  accept?: string[];
  /** For kind === 'choice'. */
  choices?: string[];
  /** The letter/character contributed to the reveal when solved correctly. */
  token: string;
}

export interface RevealPuzzle {
  id: string;
  title: string;
  /** The heading INSIDE the sheet. The sheet header already carries `title`,
      so this asks what the learner is about to find out. */
  question: string;
  icon: string;
  short: string;
  skill: string;
  intro: string;
  /** Label of the assembled answer, e.g. "מילת הסוד" or "קוד הכספת". */
  revealLabel: string;
  steps: RevealStep[];
}
