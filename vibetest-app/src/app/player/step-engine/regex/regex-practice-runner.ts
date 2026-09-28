import type { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import type { WorkerFactory } from '../../../execution/worker-factory';

import {
  createPracticeTimingAccumulator,
  practiceRunFailure,
  practiceRunSuccess,
  type PracticeRunResult,
} from '../practice-run-result';
import type { RegexStep } from './regex-step-engine';

export type RegexPracticeResult = PracticeRunResult;

export interface RegexPracticeRunnerDeps {
  readonly wrapper: ExecutionWorkerWrapperService;
  readonly createWorker: WorkerFactory;
}

/** Static worker URL in runner module for Angular worker bundling. */
export function createRegexPracticeWorker(): Worker {
  return new Worker(new URL('../../../execution/regex-practice.worker.ts', import.meta.url), {
    type: 'module',
  });
}

function nextMessageId(testIndex: number, suffix: string): string {
  return `regex-${testIndex}-${suffix}`;
}

function remainingMs(deadlineMs: number): number {
  return Math.max(100, deadlineMs - Date.now());
}

export async function runRegexPractice(
  step: RegexStep,
  userPattern: string,
  deps: RegexPracticeRunnerDeps,
): Promise<RegexPracticeResult> {
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
        type: 'regexInit',
        id: initId,
        userPattern,
        referencePattern: content.referenceSolution,
      },
      remainingMs(deadlineMs),
    );
    if (initResponse.type === 'error') {
      return practiceRunFailure(0, totalTests, initResponse.message);
    }
    if (initResponse.type !== 'regexInited') {
      return practiceRunFailure(0, totalTests, 'Unexpected init response');
    }

    for (let i = 0; i < content.tests.length; i += 1) {
      const testCase = content.tests[i];
      const caseId = nextMessageId(i, 'case');
      const response = await deps.wrapper.runRequest(
        worker,
        {
          type: 'regexRunCase',
          id: caseId,
          input: testCase.input,
        },
        remainingMs(deadlineMs),
      );

      if (response.type === 'error') {
        return practiceRunFailure(i, totalTests, response.message);
      }
      if (response.type !== 'regexCaseResult') {
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
