import { normalizeRejectReason } from './await-thenable';
import { runJavascriptSideChain, type JavascriptSideOutcome } from './apply-javascript-calls-async';
import type { JavascriptCallStep } from './apply-javascript-calls';
import { isJsonCompatibleValue, jsonCompatibleEqual } from './json-value-equal';

export type JavascriptCaseRunResult = {
  readonly pass: boolean;
  readonly userValue?: unknown;
  readonly referenceValue?: unknown;
  readonly message?: string;
};

export type JavascriptCaseRunOptions = {
  readonly rejects?: boolean;
  readonly deadlineMs?: number;
};

function fail(message: string): JavascriptCaseRunResult {
  return { pass: false, message };
}

function compareFulfilled(userValue: unknown, referenceValue: unknown): JavascriptCaseRunResult {
  if (!isJsonCompatibleValue(userValue) || !isJsonCompatibleValue(referenceValue)) {
    return fail('non-JSON result');
  }
  const pass = jsonCompatibleEqual(userValue, referenceValue);
  return {
    pass,
    userValue,
    referenceValue,
    message: pass ? undefined : 'Return values do not match',
  };
}

function compareRejected(
  userReason: unknown,
  referenceReason: unknown,
): JavascriptCaseRunResult {
  const userValue = normalizeRejectReason(userReason);
  const referenceValue = normalizeRejectReason(referenceReason);
  if (!isJsonCompatibleValue(userValue) || !isJsonCompatibleValue(referenceValue)) {
    return fail('non-JSON result');
  }
  const pass = jsonCompatibleEqual(userValue, referenceValue);
  return {
    pass,
    userValue,
    referenceValue,
    message: pass ? undefined : 'Reject reasons do not match',
  };
}

function mergeSideOutcomes(
  user: JavascriptSideOutcome,
  reference: JavascriptSideOutcome,
  rejects: boolean,
): JavascriptCaseRunResult {
  if (user.kind === 'thrown') {
    return fail(user.message);
  }
  if (reference.kind === 'thrown') {
    return fail(reference.message);
  }

  if (!rejects) {
    if (user.kind === 'rejected' || reference.kind === 'rejected') {
      return fail('Promise rejected');
    }
    return compareFulfilled(user.value, reference.value);
  }

  if (user.kind !== 'rejected' || reference.kind !== 'rejected') {
    return fail('Expected both sides to reject');
  }
  return compareRejected(user.reason, reference.reason);
}

export async function runJavascriptCaseComparison(
  invokeUser: (args: readonly unknown[]) => unknown,
  invokeReference: (args: readonly unknown[]) => unknown,
  args: readonly unknown[],
  calls: readonly JavascriptCallStep[] | undefined,
  options: JavascriptCaseRunOptions = {},
): Promise<JavascriptCaseRunResult> {
  const { rejects = false, deadlineMs } = options;
  const [user, reference] = await Promise.all([
    runJavascriptSideChain(invokeUser, args, calls, deadlineMs),
    runJavascriptSideChain(invokeReference, args, calls, deadlineMs),
  ]);
  return mergeSideOutcomes(user, reference, rejects);
}
