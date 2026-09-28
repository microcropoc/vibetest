import type { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import type { WorkerFactory } from '../../../execution/worker-factory';

import {
  createPracticeTimingAccumulator,
  practiceRunFailure,
  practiceRunSuccess,
  type PracticeRunResult,
} from '../practice-run-result';
import type { SqliteStep } from './sqlite-step-engine';

export type SqlitePracticeResult = PracticeRunResult;

export interface SqlitePracticeRunnerDeps {
  readonly wrapper: ExecutionWorkerWrapperService;
  readonly createWorker: WorkerFactory;
  readonly wasmUrl: string;
}

export function sqliteWasmAssetUrl(): string {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL('sql-wasm.wasm', document.baseURI).href;
  }
  return '/sql-wasm.wasm';
}

function nextMessageId(testIndex: number, suffix: string): string {
  return `sql-${testIndex}-${suffix}`;
}

function remainingMs(deadlineMs: number): number {
  return Math.max(100, deadlineMs - Date.now());
}

export async function runSqlitePractice(
  step: SqliteStep,
  userQuery: string,
  deps: SqlitePracticeRunnerDeps,
): Promise<SqlitePracticeResult> {
  const { content } = step;
  const totalTests = content.tests.length;
  const deadlineMs = Date.now() + content.timeoutMs;
  const worker = deps.createWorker();
  const wasmUrl = deps.wasmUrl;
  const timing = createPracticeTimingAccumulator();

  try {
    const initId = nextMessageId(-1, 'init');
    const initResponse = await deps.wrapper.runRequest(
      worker,
      {
        type: 'sqliteInit',
        id: initId,
        wasmUrl,
        setup: content.setup,
        userQuery,
        referenceQuery: content.referenceSolution,
        orderMatters: content.orderMatters,
      },
      remainingMs(deadlineMs),
    );
    if (initResponse.type !== 'sqliteInited') {
      return practiceRunFailure(0, totalTests, 'Unexpected init response');
    }

    for (let i = 0; i < content.tests.length; i += 1) {
      const testCase = content.tests[i];
      const caseId = nextMessageId(i, 'case');
      const response = await deps.wrapper.runRequest(
        worker,
        {
          type: 'sqliteRunCase',
          id: caseId,
          seed: testCase.seed,
          userReset: content.reset,
          referenceReset: content.reset,
        },
        remainingMs(deadlineMs),
      );

      if (response.type === 'error') {
        return practiceRunFailure(i, totalTests, response.message);
      }
      if (response.type !== 'sqliteCaseResult') {
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
