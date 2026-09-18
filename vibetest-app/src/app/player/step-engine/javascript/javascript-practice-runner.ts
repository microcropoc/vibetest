import type { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import type { WorkerFactory } from '../../../execution/worker-factory';

import type { JavascriptStep } from './javascript-step-engine';

export type JavascriptPracticeResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failedTestIndex: number; readonly message: string };

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
  const deadlineMs = Date.now() + content.timeoutMs;
  const worker = deps.createWorker();

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
        functionName: content.functionName,
      },
      remainingMs(deadlineMs),
    );
    if (initResponse.type !== 'javascriptInited') {
      return { ok: false, failedTestIndex: 0, message: 'Unexpected init response' };
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
          userReset: content.reset,
          referenceReset: content.reset,
        },
        remainingMs(deadlineMs),
      );

      if (response.type === 'error') {
        return { ok: false, failedTestIndex: i, message: response.message };
      }
      if (response.type !== 'javascriptCaseResult') {
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
