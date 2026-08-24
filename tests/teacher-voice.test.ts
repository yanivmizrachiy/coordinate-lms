import { describe, expect, it } from 'vitest';
import { teacherVoice } from '../src/lms/teacherVoice';

describe('teacher voice', () => {
  it('varies feedback across questions instead of repeating one fixed phrase', () => {
    const messages = new Set(
      Array.from({ length: 8 }, (_, index) => teacherVoice('correct', 1, index)),
    );
    expect(messages.size).toBeGreaterThanOrEqual(4);
  });

  it('uses a different supportive mode after a successful correction', () => {
    expect(teacherVoice('correct', 1, 2)).not.toBe(teacherVoice('correct', 2, 2));
  });

  it('encourages wrong work without claiming it is correct', () => {
    const message = teacherVoice('wrong', 1, 1);
    expect(message.length).toBeGreaterThan(10);
    expect(message).not.toMatch(/פתרון נכון|עכשיו זה נכון|מדויק מהניסיון הראשון/);
  });

  it('gives a respectful closing message when corrections are exhausted', () => {
    const message = teacherVoice('locked', 4, 3);
    expect(message).toMatch(/ניסיונ|תיקון|ממשיכים|הכוונה/);
  });
});
