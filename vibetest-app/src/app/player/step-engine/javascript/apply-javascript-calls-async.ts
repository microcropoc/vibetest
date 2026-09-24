import { awaitThenable, isThenable, ThenableTimeoutError } from './await-thenable';
import { applyJavascriptCallStep, type JavascriptCallStep } from './apply-javascript-calls';

export type JavascriptSideOutcome =
  | { readonly kind: 'fulfilled'; readonly value: unknown }
  | { readonly kind: 'rejected'; readonly reason: unknown }
  | { readonly kind: 'thrown'; readonly message: string };

function thrownFromUnknown(error: unknown): JavascriptSideOutcome {
  const message = error instanceof Error ? error.message : 'Runtime error';
  return { kind: 'thrown', message };
}

async function settleThenable(
  value: unknown,
  deadlineMs: number | undefined,
): Promise<JavascriptSideOutcome> {
  try {
    const settled = await awaitThenable(value, deadlineMs);
    return { kind: 'fulfilled', value: settled };
  } catch (reason: unknown) {
    if (reason instanceof ThenableTimeoutError) {
      return { kind: 'thrown', message: reason.message };
    }
    return { kind: 'rejected', reason };
  }
}

function settleValue(
  value: unknown,
  deadlineMs: number | undefined,
): JavascriptSideOutcome | Promise<JavascriptSideOutcome> {
  if (!isThenable(value)) {
    return { kind: 'fulfilled', value };
  }
  return settleThenable(value, deadlineMs);
}

async function continueSideChainFromFulfilled(
  current: unknown,
  calls: readonly JavascriptCallStep[],
  startIndex: number,
  deadlineMs: number | undefined,
): Promise<JavascriptSideOutcome> {
  try {
    let value = current;
    for (let i = startIndex; i < calls.length; i += 1) {
      value = applyJavascriptCallStep(value, calls[i]);
      const settled = settleValue(value, deadlineMs);
      const outcome = settled instanceof Promise ? await settled : settled;
      if (outcome.kind !== 'fulfilled') {
        return outcome;
      }
      value = outcome.value;
    }
    return { kind: 'fulfilled', value };
  } catch (error: unknown) {
    return thrownFromUnknown(error);
  }
}

function continueAfterSettled(
  settled: JavascriptSideOutcome,
  calls: readonly JavascriptCallStep[] | undefined,
  startIndex: number,
  deadlineMs: number | undefined,
): JavascriptSideOutcome | Promise<JavascriptSideOutcome> {
  if (settled.kind !== 'fulfilled') {
    return settled;
  }
  if (calls === undefined || startIndex >= calls.length) {
    return settled;
  }
  return continueSideChainFromFulfilled(settled.value, calls, startIndex, deadlineMs);
}

export function runJavascriptSideChain(
  invoke: (args: readonly unknown[]) => unknown,
  args: readonly unknown[],
  calls: readonly JavascriptCallStep[] | undefined,
  deadlineMs: number | undefined,
): JavascriptSideOutcome | Promise<JavascriptSideOutcome> {
  try {
    const first = settleValue(invoke(args), deadlineMs);
    if (first instanceof Promise) {
      return first.then(
        (settled) => continueAfterSettled(settled, calls, 0, deadlineMs),
        (error: unknown) => thrownFromUnknown(error),
      );
    }
    if (first.kind !== 'fulfilled') {
      return first;
    }
    if (calls === undefined || calls.length === 0) {
      return first;
    }
    let current = first.value;
    for (let i = 0; i < calls.length; i += 1) {
      current = applyJavascriptCallStep(current, calls[i]);
      const settled = settleValue(current, deadlineMs);
      if (settled instanceof Promise) {
        const nextIndex = i + 1;
        return settled.then(
          (outcome) => continueAfterSettled(outcome, calls, nextIndex, deadlineMs),
          (error: unknown) => thrownFromUnknown(error),
        );
      }
      if (settled.kind !== 'fulfilled') {
        return settled;
      }
      current = settled.value;
    }
    return { kind: 'fulfilled', value: current };
  } catch (error: unknown) {
    return thrownFromUnknown(error);
  }
}
