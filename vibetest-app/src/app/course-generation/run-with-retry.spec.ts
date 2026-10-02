import { describe, expect, it, vi } from 'vitest';

import {
  CANCELLED,
  runWithRetry,
  type AttemptContext,
  type AttemptInvalid,
  type AttemptOutcome,
} from './run-with-retry';

const INVALID: AttemptInvalid = {
  kind: 'invalid',
  stage: 'zod',
  issues: [{ path: 'title', message: 'Required' }],
  rawResponse: '{}',
};

function scripted<T>(...outcomes: AttemptOutcome<T>[]) {
  const contexts: AttemptContext[] = [];
  const fn = vi.fn(async (context: AttemptContext) => {
    contexts.push(context);
    return outcomes[contexts.length - 1]!;
  });
  return { fn, contexts };
}

describe('runWithRetry', () => {
  it('returns the value of the first successful attempt', async () => {
    const { fn } = scripted({ kind: 'ok', value: 42 });
    expect(await runWithRetry(fn)).toEqual({ kind: 'ok', value: 42, attempts: 1 });
  });

  it('retries an invalid answer and passes its issues to the next attempt', async () => {
    const { fn, contexts } = scripted<number>(INVALID, { kind: 'ok', value: 1 });
    const onAttempt = vi.fn();

    const result = await runWithRetry(fn, { onAttempt });

    expect(result).toEqual({ kind: 'ok', value: 1, attempts: 2 });
    expect(contexts[0]?.retryIssues).toBeUndefined();
    expect(contexts[1]?.retryIssues).toEqual(INVALID.issues);
    expect(onAttempt.mock.calls).toEqual([
      [1, 3],
      [2, 3],
    ]);
  });

  it('reports exhaustion with the last invalid answer after max attempts', async () => {
    const { fn } = scripted<number>(INVALID, INVALID, INVALID, { kind: 'ok', value: 1 });

    const result = await runWithRetry(fn);

    expect(result).toEqual({ kind: 'exhausted', last: INVALID, attempts: 3 });
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('does not retry a fatal outcome', async () => {
    const fatal = { kind: 'fatal', message: 'HTTP 400' } as const;
    const { fn } = scripted<number>(fatal, { kind: 'ok', value: 1 });

    expect(await runWithRetry(fn)).toEqual(fatal);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('stops before the next attempt when the signal is aborted', async () => {
    const controller = new AbortController();
    const fn = vi.fn(async (): Promise<AttemptOutcome<number>> => {
      controller.abort();
      return INVALID;
    });

    expect(await runWithRetry(fn, { signal: controller.signal })).toEqual(CANCELLED);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
