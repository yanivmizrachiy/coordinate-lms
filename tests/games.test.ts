import { describe, it, expect } from 'vitest';
import { isFirstQuadrant, type Point } from '../src/lib/coordinateMath';
import { normalizeAnswer, isStepCorrect, solutionOf } from '../src/games/revealEngine';
import { coordinateSafePuzzle } from '../src/games/coordinateSafe';
import { encryptedRoutePuzzle } from '../src/games/encryptedRoute';
import { sameAxisRounds, correctSelection, sameAxisSolution } from '../src/games/sameAxis';
import { suspectRounds, suspectsOf, suspectSolution } from '../src/games/suspectPoint';
import { drawingPlan, drawingStrokes, planIsWellFormed } from '../src/games/hiddenDrawing';
import { mazeConfig, mazeIsSolvable, canStandOn } from '../src/games/coordinateMaze';
import { decodeTargets, decodeSolved, targetsAreFirstQuadrant } from '../src/games/colorDecode';

const inRange = (p: Point): boolean => isFirstQuadrant(p) && p.x <= 8 && p.y <= 6;

describe('reveal engine', () => {
  it('normalises point answers in several spellings', () => {
    expect(normalizeAnswer('point', '(5,3)')).toBe('5,3');
    expect(normalizeAnswer('point', '5, 3')).toBe('5,3');
    expect(normalizeAnswer('point', '5 3')).toBe('5,3');
  });
  it('accepts a correct step and rejects a wrong one', () => {
    const step = coordinateSafePuzzle.steps[0]!;
    expect(isStepCorrect(step, step.answer)).toBe(true);
    expect(isStepCorrect(step, '0,0')).toBe(false);
  });
});

/* מילת הסוד הפך לדף המודפס „מילת הצופן" (secret-word-print) — יניב:
   „המשימות שלנו רק להדפסה ולא מתוקשבות". הדף נבדק עם שאר העמודים. */

describe('כספת הקואורדינטות', () => {
  it('assembles the code 4705', () => {
    expect(solutionOf(coordinateSafePuzzle)).toBe('4705');
    for (const step of coordinateSafePuzzle.steps) expect(isStepCorrect(step, step.answer)).toBe(true);
  });
});

describe('המסלול המוצפן', () => {
  it('spells קסם and each destination is reachable in-range', () => {
    expect(solutionOf(encryptedRoutePuzzle)).toBe('קסם');
    for (const step of encryptedRoutePuzzle.steps) {
      const [x, y] = step.answer.split(',').map(Number);
      expect(inRange({ x: x!, y: y! })).toBe(true);
    }
  });
});

describe('אותו x או אותו y', () => {
  it('every round has at least one correct point and spells ישר', () => {
    expect(sameAxisSolution).toBe('ישר');
    for (const round of sameAxisRounds) {
      const correct = correctSelection(round);
      expect(correct.length).toBeGreaterThan(0);
      for (const p of round.points) expect(inRange(p)).toBe(true);
    }
  });
});

describe('הנקודה החשודה', () => {
  it('each round has exactly one suspect and spells אמת', () => {
    expect(suspectSolution).toBe('אמת');
    for (const round of suspectRounds) {
      expect(suspectsOf(round)).toHaveLength(1);
      for (const c of round.candidates) expect(inRange(c)).toBe(true);
    }
  });
});

describe('ציור נסתר', () => {
  it('is a closed loop inside the first quadrant', () => {
    expect(planIsWellFormed()).toBe(true);
    expect(drawingStrokes.length, 'a one-stroke plan can only draw an outline').toBeGreaterThan(1);
    expect(drawingPlan.length, 'too few points to make a picture worth drawing').toBeGreaterThanOrEqual(9);
    for (const p of drawingPlan) expect(inRange(p)).toBe(true);
  });
});

describe('מבוך הקואורדינטות', () => {
  it('is solvable and well-formed', () => {
    expect(mazeIsSolvable(mazeConfig)).toBe(true);
    expect(canStandOn(mazeConfig, mazeConfig.start)).toBe(true);
    expect(canStandOn(mazeConfig, mazeConfig.target)).toBe(true);
    for (const w of mazeConfig.walls) expect(inRange(w)).toBe(true);
  });
});

describe('פענוח צבעוני', () => {
  it('targets are in the first quadrant and detection works', () => {
    expect(targetsAreFirstQuadrant()).toBe(true);
    const keys = decodeTargets.map((p) => `${p.x},${p.y}`);
    expect(decodeSolved(keys)).toBe(true);
    expect(decodeSolved(keys.slice(1))).toBe(false);
  });
});
