import {
  EMPTY_MANUAL_STAGED_PROGRESS,
  isManualStagedProgressEmpty,
  parseManualStagedProgress,
  shouldPersistManualStagedProgress,
  tryParseManualStagedProgress,
} from './manual-staged-progress';

const PROGRESS = {
  description: 'Курс про regex',
  outlineResponse: '{"schemaVersion":1}',
  courseId: '11111111-1111-4111-8111-111111111111',
  nextModuleIndex: 2,
};

describe('parseManualStagedProgress', () => {
  it('accepts a saved progress', () => {
    expect(parseManualStagedProgress(PROGRESS)).toEqual(PROGRESS);
  });

  it('accepts progress before the course is saved', () => {
    expect(parseManualStagedProgress({ ...PROGRESS, courseId: null, nextModuleIndex: 0 })).toEqual({
      ...PROGRESS,
      courseId: null,
      nextModuleIndex: 0,
    });
  });

  it('rejects a broken value', () => {
    expect(() => parseManualStagedProgress({ ...PROGRESS, courseId: 'x' })).toThrow();
    expect(tryParseManualStagedProgress({ ...PROGRESS, nextModuleIndex: -1 })).toBeUndefined();
    expect(tryParseManualStagedProgress('progress')).toBeUndefined();
  });
});

describe('shouldPersistManualStagedProgress', () => {
  it('persists only when a plan or a saved course exists', () => {
    expect(shouldPersistManualStagedProgress(EMPTY_MANUAL_STAGED_PROGRESS)).toBe(false);
    expect(
      shouldPersistManualStagedProgress({ ...EMPTY_MANUAL_STAGED_PROGRESS, description: 'Курс' }),
    ).toBe(false);
    expect(
      shouldPersistManualStagedProgress({ ...EMPTY_MANUAL_STAGED_PROGRESS, outlineResponse: '{}' }),
    ).toBe(true);
    expect(
      shouldPersistManualStagedProgress({
        ...EMPTY_MANUAL_STAGED_PROGRESS,
        courseId: '11111111-1111-4111-8111-111111111111',
      }),
    ).toBe(true);
  });
});

describe('isManualStagedProgressEmpty', () => {
  it('is empty without description, outline and course', () => {
    expect(isManualStagedProgressEmpty(EMPTY_MANUAL_STAGED_PROGRESS)).toBe(true);
    expect(isManualStagedProgressEmpty(PROGRESS)).toBe(false);
  });
});
