import { ExecutionTimeoutError } from './execution-errors';
import { ExecutionWorkerWrapperService } from './execution-worker-wrapper.service';

class MockWorker {
  onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  terminated = false;
  lastPosted: unknown = undefined;

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
    this.lastPosted = data;
  }

  terminate(): void {
    this.terminated = true;
  }

  emitMessage(data: unknown): void {
    this.onmessage?.({ data } as MessageEvent<unknown>);
  }
}

describe('ExecutionWorkerWrapperService', () => {
  const service = new ExecutionWorkerWrapperService();

  it('resolves matching response by id', async () => {
    const worker = new MockWorker();
    const promise = service.runRequest(worker as unknown as Worker, { type: 'ping', id: 'a' }, 1000);
    worker.emitMessage({ type: 'pong', id: 'other' });
    worker.emitMessage({ type: 'pong', id: 'a' });
    await expect(promise).resolves.toEqual({ type: 'pong', id: 'a' });
    expect(worker.terminated).toBe(false);
  });

  it('terminates worker on timeout', async () => {
    vi.useFakeTimers();
    const worker = new MockWorker();
    const promise = service.runRequest(worker as unknown as Worker, { type: 'ping', id: 't' }, 500);
    vi.advanceTimersByTime(501);
    await expect(promise).rejects.toBeInstanceOf(ExecutionTimeoutError);
    expect(worker.terminated).toBe(true);
    vi.useRealTimers();
  });
});
