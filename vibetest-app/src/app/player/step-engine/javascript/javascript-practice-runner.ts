import type { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import type { WorkerFactory } from '../../../execution/worker-factory';

import {
  createPracticeTimingAccumulator,
  practiceRunFailure,
  practiceRunSuccess,
  type PracticeRunResult,
} from '../practice-run-result';
import type { JavascriptStep } from './javascript-step-engine';

export type JavascriptPracticeResult = PracticeRunResult;

export interface JavascriptPracticeRunnerDeps {
  readonly wrapper: ExecutionWorkerWrapperService;
  readonly createWorker: WorkerFactory;
}

/** Static worker URL in runner module for Angular worker bundling. */
export function createJavascriptPracticeWorker(): Worker {
  return new Worker(new URL('../../../execution/javascript-practice.worker.ts', import.meta.url), {
    type: 'module',
  });
}

function nextMessageId(testIndex: number, suffix: string): string {
  return `js-${testIndex}-${suffix}`;
}

function remainingMs(deadlineMs: number): number {
  return Math.max(100, deadlineMs - Date.now());
}

export async function runJavascriptPractice(
  step: JavascriptStep,
  userCode: string,
  deps: JavascriptPracticeRunnerDeps,
): Promise<JavascriptPracticeResult> {
  const { content } = step;
  const totalTests = content.tests.length;
  const deadlineMs = Date.now() + content.timeoutMs;
  const worker = deps.createWorker();
  const timing = createPracticeTimingAccumulator();

  try {
    const initId = nextMessageId(-1, 'init');
    const initResponse = await deps.wrapper.runRequest(
      worker,
      {
        type: 'javascriptInit',
        id: initId,
        setup: content.setup,
        userCode,
        referenceCode: content.referenceSolution,
        ...(content.functionName !== undefined ? { functionName: content.functionName } : {}),
        ...(content.construct !== undefined
          ? { construct: { className: content.construct.className } }
          : {}),
      },
      remainingMs(deadlineMs),
    );
    if (initResponse.type === 'error') {
      return practiceRunFailure(0, totalTests, initResponse.message);
    }
    if (initResponse.type !== 'javascriptInited') {
      return practiceRunFailure(0, totalTests, 'Unexpected init response');
    }

    for (let i = 0; i < content.tests.length; i += 1) {
      const testCase = content.tests[i];
      const caseId = nextMessageId(i, 'case');
      const response = await deps.wrapper.runRequest(
        worker,
        {
          type: 'javascriptRunCase',
          id: caseId,
          args: [...testCase.args],
          ...(testCase.calls !== undefined
            ? {
                calls: testCase.calls.map((call) => ({
                  args: [...call.args],
                  ...(call.method !== undefined ? { method: call.method } : {}),
                })),
              }
            : {}),
          ...(testCase.rejects !== undefined ? { rejects: testCase.rejects } : {}),
          ...(testCase.expectInvocations !== undefined
            ? { expectInvocations: { ...testCase.expectInvocations } }
            : {}),
          ...(testCase.advanceMs !== undefined ? { advanceMs: testCase.advanceMs } : {}),
          ...(testCase.flushMicrotasks !== undefined
            ? { flushMicrotasks: testCase.flushMicrotasks }
            : {}),
          ...(testCase.unordered !== undefined ? { unordered: testCase.unordered } : {}),
          ...(content.resultMode !== undefined ? { resultMode: content.resultMode } : {}),
          ...(content.structure !== undefined
            ? {
                structure: {
                  ...(content.structure.args !== undefined
                    ? { args: [...content.structure.args] }
                    : {}),
                  ...(content.structure.result !== undefined
                    ? { result: content.structure.result }
                    : {}),
                },
              }
            : {}),
          ...(content.checker !== undefined && content.checker.length > 0
            ? { checker: content.checker }
            : {}),
          deadlineMs,
          userReset: content.reset ?? '',
          referenceReset: content.reset ?? '',
        },
        remainingMs(deadlineMs),
      );

      if (response.type === 'error') {
        return practiceRunFailure(i, totalTests, response.message);
      }
      if (response.type !== 'javascriptCaseResult') {
        return practiceRunFailure(i, totalTests, 'Unexpected case response');
      }
      timing.add({ userMs: response.userMs, referenceMs: response.referenceMs });
      if (!response.pass) {
        return practiceRunFailure(i, totalTests, response.message ?? 'Test case failed');
      }
    }

    return practiceRunSuccess(totalTests, timing.totals());
  } finally {
    worker.terminate();
  }
}
