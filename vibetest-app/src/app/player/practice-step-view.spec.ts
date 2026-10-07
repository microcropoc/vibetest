import { describe, expect, it } from 'vitest';

import { ExecutionTimeoutError } from '../execution/execution-errors';

import {
  formatPracticeDurationMs,
  practiceFailureMessage,
  practiceFeedbackFromResult,
  practiceRuntimeErrorFeedback,
  practiceStepShellLabels,
  practiceTimingComparison,
} from './practice-step-view';

describe('practiceStepShellLabels', () => {
  it('returns javascript labels', () => {
    expect(
      practiceStepShellLabels({
        stepId: 'id',
        type: 'javascript',
        title: 'JS',
        content: {
          description: 'd',
          starterCode: '',
          referenceSolution: 'return 1',
          setup: '',
          functionName: 'fn',
          timeoutMs: 1000,
          tests: [{ args: [] }],
        },
      }),
    ).toEqual({
      editorLabel: 'Код функции',
      hint: 'Напишите тело функции и нажмите «Запустить».',
    });
  });
});

describe('practiceFailureMessage', () => {
  it('includes failed test index and message', () => {
    expect(
      practiceFailureMessage({
        ok: false,
        failedTestIndex: 0,
        totalTests: 3,
        message: 'timeout',
      }),
    ).toContain('Проверка 1 не пройдена: timeout');
  });
});

describe('formatPracticeDurationMs', () => {
  it('formats sub-tenth values', () => {
    expect(formatPracticeDurationMs(0.05)).toBe('< 0.1 мс');
  });

  it('rounds to one decimal', () => {
    expect(formatPracticeDurationMs(1.24)).toBe('1.2 мс');
  });
});

describe('practiceTimingComparison', () => {
  it('reports slower when user exceeds reference above noise threshold', () => {
    expect(practiceTimingComparison(14, 10)).toBe('В 1.4 раза медленнее эталона.');
  });

  it('reports comparable within five percent above threshold', () => {
    expect(practiceTimingComparison(10.2, 10)).toBe('Время сопоставимо с эталоном.');
  });

  it('treats sub-threshold totals as comparable', () => {
    expect(practiceTimingComparison(0, 0.5)).toBe('Время сопоставимо с эталоном.');
    expect(practiceTimingComparison(0.1, 0.2)).toBe('Время сопоставимо с эталоном.');
  });

  it('avoids coefficient when one side is below threshold', () => {
    expect(practiceTimingComparison(0, 5)).toBe('Быстрее эталона.');
    expect(practiceTimingComparison(0.3, 5)).toBe('Быстрее эталона.');
    expect(practiceTimingComparison(5, 0.3)).toBe('Медленнее эталона.');
  });
});

describe('practiceFeedbackFromResult', () => {
  it('builds success feedback with timing', () => {
    expect(
      practiceFeedbackFromResult({
        ok: true,
        totalTests: 2,
        userMs: 3,
        referenceMs: 2,
      }),
    ).toEqual({
      kind: 'success',
      message: 'Все проверки пройдены.',
      tests: { passed: 2, total: 2 },
      timing: { userMs: 3, referenceMs: 2 },
    });
  });

  it('builds failure feedback without timing', () => {
    expect(
      practiceFeedbackFromResult({
        ok: false,
        failedTestIndex: 1,
        totalTests: 4,
        message: 'mock fail',
      }),
    ).toEqual({
      kind: 'error',
      message: 'Проверка 2 не пройдена: mock fail',
      tests: { passed: 1, total: 4 },
    });
  });
});

describe('practiceRuntimeErrorFeedback', () => {
  it('describes a timeout in Russian with the limit', () => {
    expect(practiceRuntimeErrorFeedback(new ExecutionTimeoutError(5000), 3)).toEqual({
      kind: 'error',
      message: 'Ошибка выполнения: превышен лимит времени (5000 мс)',
      tests: { passed: 0, total: 3 },
    });
  });

  it('uses the error message for other errors', () => {
    expect(practiceRuntimeErrorFeedback(new Error('Worker error'), 2).message).toBe(
      'Ошибка выполнения: Worker error',
    );
    expect(practiceRuntimeErrorFeedback('boom', 2).message).toBe(
      'Ошибка выполнения: неизвестная ошибка',
    );
  });
});
