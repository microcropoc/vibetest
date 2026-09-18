import type { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import type { WorkerFactory } from '../../../execution/worker-factory';

import type { RegexStep } from './regex-step-engine';

export type RegexPracticeResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failedTestIndex: number; readonly message: string };

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
  const deadlineMs = Date.now() + content.timeoutMs;
  const worker = deps.createWorker();

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
      return { ok: false, failedTestIndex: 0, message: initResponse.message };
    }
    if (initResponse.type !== 'regexInited') {
      return { ok: false, failedTestIndex: 0, message: 'Unexpected init response' };
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
        return { ok: false, failedTestIndex: i, message: response.message };
      }
      if (response.type !== 'regexCaseResult') {
        return { ok: false, failedTestIndex: i, message: 'Unexpected case response' };
      }
      if (!response.pass) {
        return {
          ok: false,
          failedTestIndex: i,
          message: response.message ?? 'Test case failed',
        };
      }
    }

    return { ok: true };
  } finally {
    worker.terminate();
  }
}
