import { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';

import { runRegexPractice } from './regex-practice-runner';
import type { RegexStep } from './regex-step-engine';

class ScriptableMockWorker {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  failOnCase = -1;
  invalidInit = false;

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
    if (req.type === 'regexInit') {
      if (this.invalidInit) {
        this.onmessage?.({
          data: {
            type: 'error',
            id: req.id,
            message: 'Invalid regular expression',
          },
        } as MessageEvent);
        return;
      }
      this.onmessage?.({ data: { type: 'regexInited', id: req.id } } as MessageEvent);
      return;
    }
    if (req.type === 'regexRunCase') {
      const index = Number.parseInt(req.id.split('-')[1] ?? '0', 10);
      if (index === this.failOnCase) {
        this.onmessage?.({
          data: {
            type: 'regexCaseResult',
            id: req.id,
            pass: false,
            message: 'mock fail',
          },
        } as MessageEvent);
        return;
      }
      this.onmessage?.({
        data: { type: 'regexCaseResult', id: req.id, pass: true },
      } as MessageEvent);
    }
  }

  terminate(): void {
    this.terminated = true;
  }
}

const regexStep: RegexStep = {
  stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  type: 'regex',
  title: 'Digits',
  content: {
    description: 'Digits only',
    starterCode: '^\\d+$',
    referenceSolution: '^\\d+$',
    timeoutMs: 1000,
    tests: [{ input: '123' }, { input: 'abc' }],
  },
};

describe('runRegexPractice', () => {
  it('runs all inputs and returns ok', async () => {
    const mock = new ScriptableMockWorker();
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runRegexPractice(regexStep, regexStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
      workerScriptUrl: new URL('https://example.test/worker.js'),
    });
    expect(result).toEqual({ ok: true });
    expect(mock.terminated).toBe(true);
  });

  it('fail-fast on first failing case', async () => {
    const mock = new ScriptableMockWorker();
    mock.failOnCase = 0;
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runRegexPractice(regexStep, regexStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
      workerScriptUrl: new URL('https://example.test/worker.js'),
    });
    expect(result).toEqual({ ok: false, failedTestIndex: 0, message: 'mock fail' });
  });

  it('surfaces init errors for invalid patterns', async () => {
    const mock = new ScriptableMockWorker();
    mock.invalidInit = true;
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runRegexPractice(regexStep, '(', {
      wrapper,
      createWorker: () => mock as unknown as Worker,
      workerScriptUrl: new URL('https://example.test/worker.js'),
    });
    expect(result).toEqual({
      ok: false,
      failedTestIndex: 0,
      message: 'Invalid regular expression',
    });
  });
});
