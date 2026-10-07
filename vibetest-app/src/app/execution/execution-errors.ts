export class ExecutionTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Worker execution timed out after ${timeoutMs}ms`);
    this.name = 'ExecutionTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/** Practice could not start (engine load, setup); no test case ran. The worker itself is usable. */
export class PracticeStartError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PracticeStartError';
  }
}

export class ExecutionProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionProtocolError';
  }
}
