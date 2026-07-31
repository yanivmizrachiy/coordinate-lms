import type { AnswerKey } from './types';

/*
 * Page 1 is supplied so the public guest flow already has a working score.
 * The remaining pages can be keyed through teacher mode without changing
 * their printed wording or design.
 */
export const DEFAULT_ANSWER_KEYS: Record<number, AnswerKey> = {
  1: {
    'p1-q1': ['x', 'X'],
    'p1-q2': ['אנכי', 'אנכית'],
    'p1-q3': ['ראשית'],
    'p1-q4': ['צירים', 'הצירים'],
    'p1-q5': ['גדלים'],
    'p1-q6': ['y', 'Y'],
    'p1-q7': ['שמאלה', 'לשמאל'],
    'p1-q8': ['קטנים'],
    'p1-q9': ['0', 'אפס'],
    'p1-q10': ['מימין', 'ימינה'],
    'p1-q11': ['5', 'חמש'],
    'p1-q12': ['משמאל', 'שמאלה'],
    'p1-q13': ['3', 'שלוש'],
    'p1-q14': ['משמאל', 'שמאלה'],
    'p1-q15': ['5.5', '5,5', '5½', '5 1/2'],
    'p1-q16': ['2', 'שתיים'],
    'p1-q17': ['x', 'X'],
    'p1-q18': ['C', 'c'],
    'p1-q19': ['מימין', 'ימינה'],
    'p1-q20': ['4', 'ארבע'],
  },
};
