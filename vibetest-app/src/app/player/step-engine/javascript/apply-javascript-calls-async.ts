import { awaitThenable, ThenableTimeoutError } from './await-thenable';
import { applyJavascriptCallStep, type JavascriptCallStep } from './apply-javascript-calls';

export type JavascriptSideOutcome =
  | { readonly kind: 'fulfilled'; readonly value: unknown }
  | { readonly kind: 'rejected'; readonly reason: unknown }
  | { readonly kind: 'thrown'; readonly message: string };

async function settleValue(value: unknown, deadlineMs?: number): Promise<JavascriptSideOutcome> {
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

export async function runJavascriptSideChain(
  invoke: (args: readonly unknown[]) => unknown,
  args: readonly unknown[],
  calls: readonly JavascriptCallStep[] | undefined,
  deadlineMs?: number,
): Promise<JavascriptSideOutcome> {
  try {
    let settled = await settleValue(invoke(args), deadlineMs);
    if (settled.kind !== 'fulfilled') {
      return settled;
    }
    let current = settled.value;
    if (calls !== undefined) {
      for (const call of calls) {
        current = applyJavascriptCallStep(current, call);
        settled = await settleValue(current, deadlineMs);
        if (settled.kind !== 'fulfilled') {
          return settled;
        }
        current = settled.value;
      }
    }
    return { kind: 'fulfilled', value: current };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Runtime error';
    return { kind: 'thrown', message };
  }
}
