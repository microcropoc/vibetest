export class ExecutionTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Worker execution timed out after ${timeoutMs}ms`);
    this.name = 'ExecutionTimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

export class ExecutionProtocolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExecutionProtocolError';
  }
}
