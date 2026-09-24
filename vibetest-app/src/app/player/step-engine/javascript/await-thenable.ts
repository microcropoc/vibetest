export class ThenableTimeoutError extends Error {
  constructor() {
    super('Timeout');
    this.name = 'ThenableTimeoutError';
  }
}

export function isThenable(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  const then = (value as { then?: unknown }).then;
  return typeof then === 'function';
}

export async function awaitThenable(value: unknown, deadlineMs?: number): Promise<unknown> {
  if (!isThenable(value)) {
    return value;
  }
  const adopted = Promise.resolve(value);
  if (deadlineMs === undefined) {
    return adopted;
  }
  const remainingMs = deadlineMs - Date.now();
  if (remainingMs <= 0) {
    throw new ThenableTimeoutError();
  }
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new ThenableTimeoutError()), remainingMs);
  });
  try {
    return await Promise.race([adopted, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export function normalizeRejectReason(reason: unknown): unknown {
  if (reason instanceof Error) {
    return reason.message;
  }
  return reason;
}
