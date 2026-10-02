import type { ImportIssue, ImportValidationStage } from '../courses/import-types';

export const DEFAULT_MAX_ATTEMPTS = 3;

/** The model answered, but the answer cannot be used; worth another attempt. */
export type AttemptInvalid = {
  readonly kind: 'invalid';
  readonly stage: ImportValidationStage;
  readonly issues: readonly ImportIssue[];
  readonly rawResponse?: string;
};

/** Repeating the same request will not help (HTTP/network error, cancel, missing course). */
export type AttemptFatal = {
  readonly kind: 'fatal';
  readonly message: string;
  readonly cancelled?: boolean;
  readonly rawResponse?: string;
};

export type AttemptOutcome<T> =
  | { readonly kind: 'ok'; readonly value: T }
  | AttemptInvalid
  | AttemptFatal;

export type AttemptContext = {
  readonly attempt: number;
  readonly maxAttempts: number;
  /** Issues of the previous invalid attempt; undefined on the first attempt. */
  readonly retryIssues: readonly ImportIssue[] | undefined;
};

export type RetryResult<T> =
  | { readonly kind: 'ok'; readonly value: T; readonly attempts: number }
  | { readonly kind: 'exhausted'; readonly last: AttemptInvalid; readonly attempts: number }
  | AttemptFatal;

export type RunWithRetryOptions = {
  readonly maxAttempts?: number;
  readonly signal?: AbortSignal;
  readonly onAttempt?: (attempt: number, maxAttempts: number) => void;
};

export const CANCELLED: AttemptFatal = {
  kind: 'fatal',
  message: 'Запрос отменён.',
  cancelled: true,
};

/** Runs `attemptFn` until ok, fatal, or `maxAttempts` invalid answers in a row. */
export async function runWithRetry<T>(
  attemptFn: (context: AttemptContext) => Promise<AttemptOutcome<T>>,
  options?: RunWithRetryOptions,
): Promise<RetryResult<T>> {
  const maxAttempts = Math.max(1, options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS);
  let last: AttemptInvalid | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (options?.signal?.aborted === true) {
      return CANCELLED;
    }
    options?.onAttempt?.(attempt, maxAttempts);
    const outcome = await attemptFn({ attempt, maxAttempts, retryIssues: last?.issues });
    if (outcome.kind === 'ok') {
      return { kind: 'ok', value: outcome.value, attempts: attempt };
    }
    if (outcome.kind === 'fatal') {
      return outcome;
    }
    last = outcome;
  }

  return { kind: 'exhausted', last: last!, attempts: maxAttempts };
}
