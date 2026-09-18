import { describe, expect, it } from 'vitest';

import { practiceFailureMessage, practiceStepShellLabels } from './practice-step-view';

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
      practiceFailureMessage({ ok: false, failedTestIndex: 0, message: 'timeout' }),
    ).toContain('Проверка 1 не пройдена: timeout');
  });
});
