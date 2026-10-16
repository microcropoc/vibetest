import { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';

import { REGEX_CASE_TIMEOUT_MESSAGE, runRegexPractice } from './regex-practice-runner';
import type { RegexStep } from './regex-step-engine';

class ScriptableMockWorker {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  failOnCase = -1;
  invalidInit = false;
  /** When true, regexRunCase never replies (simulates hung worker / ReDoS). */
  silentCase = false;

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
      if (this.silentCase) {
        return;
      }
      const index = Number.parseInt(req.id.split('-')[1] ?? '0', 10);
      if (index === this.failOnCase) {
        this.onmessage?.({
          data: {
            type: 'regexCaseResult',
            id: req.id,
            pass: false,
            message: 'mock fail',
            userMs: 0,
            referenceMs: 0,
          },
        } as MessageEvent);
        return;
      }
      this.onmessage?.({
        data: {
          type: 'regexCaseResult',
          id: req.id,
          pass: true,
          userMs: 0.5,
          referenceMs: 0.5,
        },
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
    });
    expect(result).toEqual({ ok: true, totalTests: 2, userMs: 1, referenceMs: 1 });
    expect(mock.terminated).toBe(true);
  });

  it('fail-fast on first failing case', async () => {
    const mock = new ScriptableMockWorker();
    mock.failOnCase = 0;
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runRegexPractice(regexStep, regexStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
    });
    expect(result).toEqual({
      ok: false,
      failedTestIndex: 0,
      totalTests: 2,
      message: 'mock fail',
    });
  });

  it('maps case timeout to ReDoS message', async () => {
    vi.useFakeTimers();
    const mock = new ScriptableMockWorker();
    mock.silentCase = true;
    const wrapper = new ExecutionWorkerWrapperService();
    const shortStep: RegexStep = {
      ...regexStep,
      content: { ...regexStep.content, timeoutMs: 200 },
    };
    const promise = runRegexPractice(shortStep, shortStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
    });
    await vi.advanceTimersByTimeAsync(250);
    const result = await promise;
    vi.useRealTimers();
    expect(result).toEqual({
      ok: false,
      failedTestIndex: 0,
      totalTests: 2,
      message: REGEX_CASE_TIMEOUT_MESSAGE,
    });
    expect(mock.terminated).toBe(true);
  });

  it('surfaces init errors for invalid patterns', async () => {
    const mock = new ScriptableMockWorker();
    mock.invalidInit = true;
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runRegexPractice(regexStep, '(', {
      wrapper,
      createWorker: () => mock as unknown as Worker,
    });
    expect(result).toEqual({
      ok: false,
      failedTestIndex: 0,
      totalTests: 2,
      message: 'Invalid regular expression',
    });
  });
});
