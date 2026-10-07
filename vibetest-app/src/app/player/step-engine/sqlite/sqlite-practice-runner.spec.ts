import { ExecutionTimeoutError, PracticeStartError } from '../../../execution/execution-errors';
import { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';
import { ReusableWorkerSource } from '../../../execution/practice-worker-source';

import {
  runSqlitePractice,
  SQLITE_ENGINE_LOAD_TIMEOUT_MS,
  warmUpSqlitePractice,
} from './sqlite-practice-runner';
import type { SqliteStep } from './sqlite-step-engine';

interface MockOptions {
  failOnCase?: number;
  loadError?: string;
  initError?: string;
  silentInit?: boolean;
  loadDelayMs?: number;
  silentLoad?: boolean;
}

const mockDiff = {
  user: { columns: ['id'], rows: [[2]], firstRow: 0, rowCount: 1 },
  expected: { columns: ['id'], rows: [[1]], firstRow: 0, rowCount: 1 },
};

class ScriptableMockWorker {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  readonly received: string[] = [];

  constructor(private readonly options: MockOptions = {}) {}

  addEventListener(type: 'message' | 'error', listener: (event: MessageEvent | ErrorEvent) => void): void {
    if (type === 'message') {
      this.onmessage = listener as (event: MessageEvent<unknown>) => void;
    } else {
      this.onerror = listener as (event: ErrorEvent) => void;
    }
  }

  removeEventListener(type: 'message' | 'error', listener: (event: MessageEvent | ErrorEvent) => void): void {
    if (type === 'message' && this.onmessage === listener) {
      this.onmessage = null;
    }
    if (type === 'error' && this.onerror === listener) {
      this.onerror = null;
    }
  }

  postMessage(data: unknown): void {
    const req = data as { type: string; id: string };
    this.received.push(req.type);
    const reply = (payload: Record<string, unknown>) =>
      this.onmessage?.({ data: { id: req.id, ...payload } } as MessageEvent);

    if (req.type === 'sqliteLoad') {
      if (this.options.silentLoad) {
        return;
      }
      const send = () =>
        this.options.loadError !== undefined
          ? reply({ type: 'error', message: this.options.loadError })
          : reply({ type: 'sqliteLoaded' });
      if (this.options.loadDelayMs !== undefined) {
        setTimeout(send, this.options.loadDelayMs);
      } else {
        send();
      }
      return;
    }
    if (req.type === 'sqliteInit') {
      if (this.options.silentInit) {
        return;
      }
      if (this.options.initError !== undefined) {
        reply({ type: 'error', message: this.options.initError });
        return;
      }
      reply({ type: 'sqliteInited' });
      return;
    }
    if (req.type === 'sqliteRunCase') {
      const index = Number.parseInt(req.id.split('-')[2] ?? '0', 10);
      if (index === this.options.failOnCase) {
        reply({
          type: 'sqliteCaseResult',
          pass: false,
          message: 'mock fail',
          diff: mockDiff,
          userMs: 0,
          referenceMs: 0,
        });
        return;
      }
      reply({ type: 'sqliteCaseResult', pass: true, userMs: 2, referenceMs: 1 });
    }
  }

  terminate(): void {
    this.terminated = true;
  }
}

const sqliteStep: SqliteStep = {
  stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  type: 'sqlite',
  title: 'Users',
  content: {
    description: 'Find user',
    setup: 'CREATE TABLE users(id INT, name TEXT);',
    reset: 'DELETE FROM users;',
    starterCode: 'SELECT * FROM users WHERE id = 1;',
    referenceSolution: 'SELECT id, name FROM users WHERE id = 1;',
    orderMatters: false,
    timeoutMs: 5000,
    tests: [
      { seed: "INSERT INTO users VALUES(1, 'Anna');" },
      { seed: "INSERT INTO users VALUES(1, 'Bob');" },
    ],
  },
};

const wasmUrl = 'https://example.test/sql-wasm.wasm';

function setup(options?: MockOptions | ((workerIndex: number) => MockOptions)) {
  const mocks: ScriptableMockWorker[] = [];
  const workers = new ReusableWorkerSource(() => {
    const mock = new ScriptableMockWorker(
      typeof options === 'function' ? options(mocks.length) : options,
    );
    mocks.push(mock);
    return mock as unknown as Worker;
  });
  const deps = { wrapper: new ExecutionWorkerWrapperService(), workers, wasmUrl };
  return { mocks, deps };
}

describe('runSqlitePractice', () => {
  it('loads the engine, runs all seed cases and returns ok', async () => {
    const { mocks, deps } = setup();
    const result = await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    expect(result).toEqual({ ok: true, totalTests: 2, userMs: 4, referenceMs: 2 });
    expect(mocks[0].received).toEqual(['sqliteLoad', 'sqliteInit', 'sqliteRunCase', 'sqliteRunCase']);
  });

  it('keeps the worker warm between runs', async () => {
    const { mocks, deps } = setup();
    await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    expect(mocks).toHaveLength(1);
    expect(mocks[0].terminated).toBe(false);
  });

  it('fail-fast on first failing case and forwards the result diff', async () => {
    const { deps } = setup({ failOnCase: 1 });
    const result = await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    expect(result).toEqual({
      ok: false,
      failedTestIndex: 1,
      totalTests: 2,
      message: 'mock fail',
      details: { kind: 'sqlite', diff: mockDiff },
    });
  });

  it('sends the comparison options of the step with init', async () => {
    const { mocks, deps } = setup();
    const posted: unknown[] = [];
    const step: SqliteStep = {
      ...sqliteStep,
      content: {
        ...sqliteStep.content,
        checkColumnNames: true,
        floatTolerance: 0.01,
        checkQuery: 'SELECT * FROM users',
      },
    };
    const run = runSqlitePractice(step, step.content.starterCode, deps);
    const original = mocks[0].postMessage.bind(mocks[0]);
    mocks[0].postMessage = (data: unknown) => {
      posted.push(data);
      original(data);
    };
    await run;
    expect(posted).toContainEqual(
      expect.objectContaining({
        type: 'sqliteInit',
        checkColumnNames: true,
        floatTolerance: 0.01,
        checkQuery: 'SELECT * FROM users',
      }),
    );
  });

  it('throws the engine load error as a start error, not a failed case', async () => {
    const { mocks, deps } = setup({ loadError: 'Failed to load SQLite engine: 404' });
    const run = runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    await expect(run).rejects.toBeInstanceOf(PracticeStartError);
    await expect(run).rejects.toThrow('Failed to load SQLite engine: 404');
    expect(mocks[0].terminated).toBe(false);
  });

  it('throws the setup error from init as a start error and keeps the worker', async () => {
    const { mocks, deps } = setup({ initError: 'Setup SQL failed: near "(": syntax error' });
    const run = runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    await expect(run).rejects.toBeInstanceOf(PracticeStartError);
    await expect(run).rejects.toThrow('Setup SQL failed: near "(": syntax error');
    expect(mocks[0].terminated).toBe(false);
    expect(mocks[0].received).not.toContain('sqliteRunCase');
  });

  it('does not count engine loading against the step timeout', async () => {
    const { deps } = setup({ loadDelayMs: 250 });
    const step: SqliteStep = { ...sqliteStep, content: { ...sqliteStep.content, timeoutMs: 150 } };
    const result = await runSqlitePractice(step, step.content.starterCode, deps);
    expect(result.ok).toBe(true);
  });

  it('discards the worker and rethrows on timeout', async () => {
    const { mocks, deps } = setup({ silentInit: true });
    const step: SqliteStep = { ...sqliteStep, content: { ...sqliteStep.content, timeoutMs: 100 } };
    await expect(runSqlitePractice(step, step.content.starterCode, deps)).rejects.toBeInstanceOf(
      ExecutionTimeoutError,
    );
    expect(mocks[0].terminated).toBe(true);
    await deps.workers.acquire();
    expect(mocks).toHaveLength(2);
  });
});

describe('warmUpSqlitePractice', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads the engine in the kept worker', async () => {
    const { mocks, deps } = setup();
    await warmUpSqlitePractice(deps);
    expect(mocks[0].received).toEqual(['sqliteLoad']);
    await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    expect(mocks).toHaveLength(1);
  });

  it('a run started during warm-up waits for the load and reuses the worker', async () => {
    const { mocks, deps } = setup({ loadDelayMs: 200 });
    const warmUp = warmUpSqlitePractice(deps);
    const result = await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);
    await warmUp;

    expect(result.ok).toBe(true);
    expect(mocks).toHaveLength(1);
    expect(mocks[0].terminated).toBe(false);
    expect(mocks[0].received).toEqual([
      'sqliteLoad',
      'sqliteLoad',
      'sqliteInit',
      'sqliteRunCase',
      'sqliteRunCase',
    ]);
  });

  it('a warm-up timeout does not cut a waiting run: it gets a fresh worker and its own limit', async () => {
    vi.useFakeTimers();
    const { mocks, deps } = setup((index) => (index === 0 ? { silentLoad: true } : {}));
    const warmUp = warmUpSqlitePractice(deps);
    const warmUpOutcome = warmUp.catch((error: unknown) => error);
    const run = runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, deps);

    await vi.advanceTimersByTimeAsync(SQLITE_ENGINE_LOAD_TIMEOUT_MS - 1);
    expect(mocks).toHaveLength(1);
    expect(mocks[0].received).toEqual(['sqliteLoad']);

    await vi.advanceTimersByTimeAsync(1);
    expect(await warmUpOutcome).toBeInstanceOf(ExecutionTimeoutError);
    expect(mocks[0].terminated).toBe(true);

    expect((await run).ok).toBe(true);
    expect(mocks).toHaveLength(2);
    expect(mocks[1].terminated).toBe(false);
    expect(mocks[1].received).toEqual(['sqliteLoad', 'sqliteInit', 'sqliteRunCase', 'sqliteRunCase']);
  });
});
