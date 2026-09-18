import type { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import type { WorkerFactory } from '../../../execution/worker-factory';

import type { SqliteStep } from './sqlite-step-engine';

export type SqlitePracticeResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly failedTestIndex: number; readonly message: string };

export interface SqlitePracticeRunnerDeps {
  readonly wrapper: ExecutionWorkerWrapperService;
  readonly createWorker: WorkerFactory;
  readonly workerScriptUrl: URL;
  readonly wasmUrl: string;
}

export function sqlitePracticeWorkerUrl(): URL {
  return new URL('../../../execution/sqlite-practice.worker.ts', import.meta.url);
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
  const deadlineMs = Date.now() + content.timeoutMs;
  const worker = deps.createWorker(deps.workerScriptUrl);
  const wasmUrl = deps.wasmUrl;

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
      return { ok: false, failedTestIndex: 0, message: 'Unexpected init response' };
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
        return { ok: false, failedTestIndex: i, message: response.message };
      }
      if (response.type !== 'sqliteCaseResult') {
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
