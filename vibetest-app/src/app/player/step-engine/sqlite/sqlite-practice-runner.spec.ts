import { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';

import { runSqlitePractice } from './sqlite-practice-runner';
import type { SqliteStep } from './sqlite-step-engine';

class ScriptableMockWorker {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  failOnCase = -1;

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
    if (req.type === 'sqliteInit') {
      this.onmessage?.({ data: { type: 'sqliteInited', id: req.id } } as MessageEvent);
      return;
    }
    if (req.type === 'sqliteRunCase') {
      const index = Number.parseInt(req.id.split('-')[1] ?? '0', 10);
      if (index === this.failOnCase) {
        this.onmessage?.({
          data: {
            type: 'sqliteCaseResult',
            id: req.id,
            pass: false,
            message: 'mock fail',
          },
        } as MessageEvent);
        return;
      }
      this.onmessage?.({
        data: { type: 'sqliteCaseResult', id: req.id, pass: true },
      } as MessageEvent);
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

describe('runSqlitePractice', () => {
  it('runs all seed cases and returns ok', async () => {
    const mock = new ScriptableMockWorker();
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
      wasmUrl: 'https://example.test/sql-wasm.wasm',
    });
    expect(result).toEqual({ ok: true });
    expect(mock.terminated).toBe(true);
  });

  it('fail-fast on first failing case', async () => {
    const mock = new ScriptableMockWorker();
    mock.failOnCase = 1;
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runSqlitePractice(sqliteStep, sqliteStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
      wasmUrl: 'https://example.test/sql-wasm.wasm',
    });
    expect(result).toEqual({ ok: false, failedTestIndex: 1, message: 'mock fail' });
  });
});
