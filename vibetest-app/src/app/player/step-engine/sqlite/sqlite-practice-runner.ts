import { PracticeStartError } from '../../../execution/execution-errors';
import type { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import type { PracticeWorkerSource } from '../../../execution/practice-worker-source';

import {
  createPracticeTimingAccumulator,
  practiceRunFailure,
  practiceRunSuccess,
  type PracticeRunResult,
} from '../practice-run-result';
import type { SqliteStep } from './sqlite-step-engine';

export type SqlitePracticeResult = PracticeRunResult;

/** Download + compile of sql.js wasm; not counted against the step `timeoutMs`. */
export const SQLITE_ENGINE_LOAD_TIMEOUT_MS = 30_000;

export interface SqlitePracticeRunnerDeps {
  readonly wrapper: ExecutionWorkerWrapperService;
  readonly workers: PracticeWorkerSource;
  readonly wasmUrl: string;
}

export function sqliteWasmAssetUrl(): string {
  if (typeof document !== 'undefined' && document.baseURI) {
    return new URL('sql-wasm.wasm', document.baseURI).href;
  }
  return '/sql-wasm.wasm';
}

let runSequence = 0;

function messageIdFactory(): (testIndex: number, suffix: string) => string {
  runSequence += 1;
  const run = runSequence;
  return (testIndex, suffix) => `sql-${run}-${testIndex}-${suffix}`;
}

function remainingMs(deadlineMs: number): number {
  return Math.max(100, deadlineMs - Date.now());
}

async function withWorker<T>(
  workers: PracticeWorkerSource,
  run: (worker: Worker) => Promise<T>,
): Promise<T> {
  const worker = await workers.acquire();
  try {
    const result = await run(worker);
    workers.release(worker);
    return result;
  } catch (error: unknown) {
    if (error instanceof PracticeStartError) {
      workers.release(worker);
    } else {
      workers.discard(worker);
    }
    throw error;
  }
}

/** Throws `PracticeStartError` when sql.js cannot be loaded in the worker. */
async function loadEngine(
  worker: Worker,
  deps: SqlitePracticeRunnerDeps,
  id: string,
): Promise<void> {
  const response = await deps.wrapper.runRequest(
    worker,
    { type: 'sqliteLoad', id, wasmUrl: deps.wasmUrl },
    SQLITE_ENGINE_LOAD_TIMEOUT_MS,
  );
  if (response.type === 'error') {
    throw new PracticeStartError(response.message);
  }
  if (response.type !== 'sqliteLoaded') {
    throw new PracticeStartError('Unexpected load response');
  }
}

/**
 * Starts loading sql.js in the (reusable) worker before the first run.
 * A run started meanwhile waits for the worker and then gets its own load limit.
 */
export async function warmUpSqlitePractice(deps: SqlitePracticeRunnerDeps): Promise<void> {
  const nextMessageId = messageIdFactory();
  await withWorker(deps.workers, (worker) => loadEngine(worker, deps, nextMessageId(-1, 'load')));
}

/**
 * Engine load and setup failures throw `PracticeStartError` (no test case ran);
 * timeouts and worker crashes throw too. A result is returned only once cases ran.
 */
export async function runSqlitePractice(
  step: SqliteStep,
  userQuery: string,
  deps: SqlitePracticeRunnerDeps,
): Promise<SqlitePracticeResult> {
  const { content } = step;
  const totalTests = content.tests.length;
  const nextMessageId = messageIdFactory();

  return withWorker(deps.workers, async (worker) => {
    await loadEngine(worker, deps, nextMessageId(-1, 'load'));

    const deadlineMs = Date.now() + content.timeoutMs;
    const timing = createPracticeTimingAccumulator();

    const initResponse = await deps.wrapper.runRequest(
      worker,
      {
        type: 'sqliteInit',
        id: nextMessageId(-1, 'init'),
        wasmUrl: deps.wasmUrl,
        setup: content.setup,
        userQuery,
        referenceQuery: content.referenceSolution,
        orderMatters: content.orderMatters,
      },
      remainingMs(deadlineMs),
    );
    if (initResponse.type === 'error') {
      throw new PracticeStartError(initResponse.message);
    }
    if (initResponse.type !== 'sqliteInited') {
      throw new PracticeStartError('Unexpected init response');
    }

    for (let i = 0; i < content.tests.length; i += 1) {
      const testCase = content.tests[i];
      const response = await deps.wrapper.runRequest(
        worker,
        {
          type: 'sqliteRunCase',
          id: nextMessageId(i, 'case'),
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
  });
}
