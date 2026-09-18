import { isValidSelection, normalizeIndices, quizAnswersMatch } from './quiz-answer';

describe('quiz-answer', () => {
  it('normalizeIndices sorts and deduplicates', () => {
    expect(normalizeIndices([2, 0, 1, 1])).toEqual([0, 1, 2]);
  });

  it('quizAnswersMatch ignores selection order', () => {
    expect(quizAnswersMatch([1, 0], [0, 1])).toBe(true);
    expect(quizAnswersMatch([0], [1])).toBe(false);
  });

  it('isValidSelection rejects empty and out-of-range', () => {
    expect(isValidSelection([], 2)).toBe(false);
    expect(isValidSelection([2], 2)).toBe(false);
    expect(isValidSelection([0, 0], 2)).toBe(false);
    expect(isValidSelection([0], 2)).toBe(true);
  });
});
