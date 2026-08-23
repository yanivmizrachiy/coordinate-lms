import { describe, expect, it } from 'vitest';
import { answersMatch } from '../src/lms/answerValidation';

describe('learner answer tolerance', () => {
  it('accepts Latin axis letters in either case', () => {
    expect(answersMatch('Y', ['y'])).toBe(true);
    expect(answersMatch('y', ['Y'])).toBe(true);
    expect(answersMatch('X', ['x'])).toBe(true);
  });

  it('accepts one harmless Hebrew spelling or full/defective variation', () => {
    expect(answersMatch('אפקי', ['אופקי'])).toBe(true);
    expect(answersMatch('צייר', ['ציר'])).toBe(true);
    expect(answersMatch('אנכי', ['אנכי'])).toBe(true);
  });

  it('does not let fuzzy spelling become a different answer policy', () => {
    expect(answersMatch('אנכי', ['אופקי'])).toBe(false);
    expect(answersMatch('ימינה', ['שמאלה'])).toBe(false);
    expect(answersMatch('אפקיי', ['אופקי'])).toBe(false);
  });

  it('keeps numeric answers mathematically strict', () => {
    expect(answersMatch('4', ['4'])).toBe(true);
    expect(answersMatch('4', ['5'])).toBe(false);
    expect(answersMatch('1/2', ['0.5'])).toBe(true);
  });

  it('keeps set answers strict despite text tolerance', () => {
    expect(answersMatch('A B', ['set:A,B'])).toBe(true);
    expect(answersMatch('A C', ['set:A,B'])).toBe(false);
  });
});
