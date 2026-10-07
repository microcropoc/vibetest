import type { WorkerFactory } from './worker-factory';

/**
 * Where a practice runner gets its worker. Every `acquire` must be paired with exactly one
 * `release` (normal run) or `discard` (the worker may be broken — timeout, protocol error;
 * the wrapper may have terminated it).
 */
export interface PracticeWorkerSource {
  acquire(): Promise<Worker>;
  release(worker: Worker): void;
  discard(worker: Worker): void;
}

/** New worker per run, terminated afterwards. */
export function singleUseWorkerSource(factory: WorkerFactory): PracticeWorkerSource {
  return {
    acquire: async () => factory(),
    release: (worker) => worker.terminate(),
    discard: (worker) => worker.terminate(),
  };
}

interface PendingAcquire {
  readonly resolve: (worker: Worker) => void;
  readonly reject: (error: unknown) => void;
}

/**
 * Keeps one warm worker between runs (sql.js stays compiled); replaced after `discard`.
 * One holder at a time: `acquire` waits until the current holder releases or discards,
 * so a timeout of one holder never terminates a worker another holder is using.
 */
export class ReusableWorkerSource implements PracticeWorkerSource {
  private worker: Worker | undefined;
  private held = false;
  private disposed = false;
  private readonly pending: PendingAcquire[] = [];

  constructor(private readonly factory: WorkerFactory) {}

  acquire(): Promise<Worker> {
    if (this.disposed) {
      return Promise.reject(new Error('Worker source is disposed'));
    }
    if (!this.held) {
      try {
        const worker = this.currentWorker();
        this.held = true;
        return Promise.resolve(worker);
      } catch (error: unknown) {
        return Promise.reject(error);
      }
    }
    return new Promise((resolve, reject) => {
      this.pending.push({ resolve, reject });
    });
  }

  release(worker: Worker): void {
    if (this.disposed || worker !== this.worker) {
      return;
    }
    this.handOver();
  }

  discard(worker: Worker): void {
    worker.terminate();
    if (this.disposed || worker !== this.worker) {
      return;
    }
    this.worker = undefined;
    this.handOver();
  }

  dispose(): void {
    this.disposed = true;
    this.worker?.terminate();
    this.worker = undefined;
    this.held = false;
    const error = new Error('Worker source is disposed');
    for (const waiter of this.pending.splice(0)) {
      waiter.reject(error);
    }
  }

  private currentWorker(): Worker {
    this.worker ??= this.factory();
    return this.worker;
  }

  /** Passes the lease to the next waiter; a waiter whose worker cannot be created is rejected. */
  private handOver(): void {
    for (let next = this.pending.shift(); next !== undefined; next = this.pending.shift()) {
      try {
        next.resolve(this.currentWorker());
        return;
      } catch (error: unknown) {
        next.reject(error);
      }
    }
    this.held = false;
  }
}
