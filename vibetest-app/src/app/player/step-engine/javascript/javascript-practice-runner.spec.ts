import { ExecutionWorkerWrapperService } from '../../../execution/execution-worker-wrapper.service';

import { runJavascriptPractice } from './javascript-practice-runner';
import type { JavascriptStep } from './javascript-step-engine';

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

  lastCaseRequest:
    | { args?: unknown[]; calls?: unknown[]; rejects?: boolean; deadlineMs?: number }
    | undefined;

  postMessage(data: unknown): void {
    const req = data as {
      type: string;
      id: string;
      args?: unknown[];
      calls?: unknown[];
      rejects?: boolean;
      deadlineMs?: number;
    };
    if (req.type === 'javascriptInit') {
      this.onmessage?.({ data: { type: 'javascriptInited', id: req.id } } as MessageEvent);
      return;
    }
    if (req.type === 'javascriptRunCase') {
      this.lastCaseRequest = {
        args: req.args,
        calls: req.calls,
        rejects: req.rejects,
        deadlineMs: req.deadlineMs,
      };
      const index = Number.parseInt(req.id.split('-')[1] ?? '0', 10);
      if (index === this.failOnCase) {
        this.onmessage?.({
          data: {
            type: 'javascriptCaseResult',
            id: req.id,
            pass: false,
            message: 'mock fail',
          },
        } as MessageEvent);
        return;
      }
      this.onmessage?.({
        data: { type: 'javascriptCaseResult', id: req.id, pass: true },
      } as MessageEvent);
    }
  }

  terminate(): void {
    this.terminated = true;
  }
}

const javascriptStep: JavascriptStep = {
  stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  type: 'javascript',
  title: 'Sum',
  content: {
    description: 'Add',
    starterCode: 'const add = (a,b)=>0;',
    referenceSolution: 'const add = (a,b)=>a+b;',
    setup: '',
    functionName: 'add',
    timeoutMs: 2000,
    tests: [{ args: [1, 2] }, { args: [3, 4] }],
  },
};

describe('runJavascriptPractice', () => {
  it('runs all cases and returns ok', async () => {
    const mock = new ScriptableMockWorker();
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runJavascriptPractice(javascriptStep, javascriptStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
    });
    expect(result).toEqual({ ok: true });
    expect(mock.terminated).toBe(true);
  });

  it('forwards calls to worker when present on test case', async () => {
    const mock = new ScriptableMockWorker();
    const wrapper = new ExecutionWorkerWrapperService();
    const stepWithCalls: JavascriptStep = {
      ...javascriptStep,
      content: {
        ...javascriptStep.content,
        tests: [{ args: [2], calls: [{ args: [3] }, { args: [4] }] }],
      },
    };
    await runJavascriptPractice(stepWithCalls, stepWithCalls.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
    });
    expect(mock.lastCaseRequest?.calls).toEqual([{ args: [3] }, { args: [4] }]);
  });

  it('forwards rejects and deadlineMs to worker', async () => {
    const mock = new ScriptableMockWorker();
    const wrapper = new ExecutionWorkerWrapperService();
    const stepWithRejects: JavascriptStep = {
      ...javascriptStep,
      content: {
        ...javascriptStep.content,
        timeoutMs: 5000,
        tests: [{ args: [1], rejects: true }],
      },
    };
    await runJavascriptPractice(stepWithRejects, stepWithRejects.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
    });
    expect(mock.lastCaseRequest?.rejects).toBe(true);
    expect(mock.lastCaseRequest?.deadlineMs).toEqual(expect.any(Number));
  });

  it('fail-fast on first failing case', async () => {
    const mock = new ScriptableMockWorker();
    mock.failOnCase = 1;
    const wrapper = new ExecutionWorkerWrapperService();
    const result = await runJavascriptPractice(javascriptStep, javascriptStep.content.starterCode, {
      wrapper,
      createWorker: () => mock as unknown as Worker,
    });
    expect(result).toEqual({ ok: false, failedTestIndex: 1, message: 'mock fail' });
  });
});
