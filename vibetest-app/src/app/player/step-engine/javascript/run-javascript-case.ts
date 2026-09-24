import { normalizeRejectReason } from './await-thenable';
import {
  runJavascriptSideChain,
  type JavascriptSideOutcome,
} from './apply-javascript-calls-async';
import type { JavascriptCallStep } from './apply-javascript-calls';
import { compareSpyInvocations } from './compare-spy-invocations';
import type { FakeTimerController } from '../../../execution/javascript-fake-timers';
import type { PracticeGlobalBag } from '../../../execution/javascript-practice-global';
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
  readonly expectInvocations?: Readonly<Record<string, number>>;
  readonly advanceMs?: number;
  readonly flushMicrotasks?: boolean;
  readonly userTimers: FakeTimerController;
  readonly referenceTimers: FakeTimerController;
  readonly userGlobal: PracticeGlobalBag;
  readonly referenceGlobal: PracticeGlobalBag;
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

function failOnThrownSideOutcomes(
  user: JavascriptSideOutcome,
  reference: JavascriptSideOutcome,
): JavascriptCaseRunResult | undefined {
  if (user.kind === 'thrown') {
    return fail(user.message);
  }
  if (reference.kind === 'thrown') {
    return fail(reference.message);
  }
  return undefined;
}

function applyTimerPhaseSync(options: JavascriptCaseRunOptions): JavascriptCaseRunResult | undefined {
  const { advanceMs, userTimers, referenceTimers } = options;
  try {
    if (advanceMs !== undefined) {
      userTimers.advanceMs(advanceMs);
      referenceTimers.advanceMs(advanceMs);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Timer error';
    return fail(message);
  }
  return undefined;
}

function resolveBothSideChains(
  invokeUser: (args: readonly unknown[]) => unknown,
  invokeReference: (args: readonly unknown[]) => unknown,
  args: readonly unknown[],
  calls: readonly JavascriptCallStep[] | undefined,
  deadlineMs: number | undefined,
):
  | [JavascriptSideOutcome, JavascriptSideOutcome]
  | Promise<[JavascriptSideOutcome, JavascriptSideOutcome]> {
  const userRun = runJavascriptSideChain(invokeUser, args, calls, deadlineMs);
  const referenceRun = runJavascriptSideChain(invokeReference, args, calls, deadlineMs);
  if (userRun instanceof Promise) {
    if (referenceRun instanceof Promise) {
      return Promise.all([userRun, referenceRun]);
    }
    return userRun.then((user) => [user, referenceRun]);
  }
  if (referenceRun instanceof Promise) {
    return referenceRun.then((reference) => [userRun, reference]);
  }
  return [userRun, referenceRun];
}

export async function runJavascriptCaseComparison(
  invokeUser: (args: readonly unknown[]) => unknown,
  invokeReference: (args: readonly unknown[]) => unknown,
  args: readonly unknown[],
  calls: readonly JavascriptCallStep[] | undefined,
  options: JavascriptCaseRunOptions,
): Promise<JavascriptCaseRunResult> {
  const { rejects = false, deadlineMs, expectInvocations } = options;
  const sideOutcomes = resolveBothSideChains(
    invokeUser,
    invokeReference,
    args,
    calls,
    deadlineMs,
  );
  const [user, reference] =
    sideOutcomes instanceof Promise ? await sideOutcomes : sideOutcomes;

  const thrownEarly = failOnThrownSideOutcomes(user, reference);
  if (thrownEarly) {
    return thrownEarly;
  }

  if (options.flushMicrotasks) {
    await Promise.resolve();
  }

  const timerError = applyTimerPhaseSync(options);
  if (timerError) {
    return timerError;
  }

  if (expectInvocations !== undefined && Object.keys(expectInvocations).length > 0) {
    const spyResult = compareSpyInvocations(options.userGlobal, options.referenceGlobal, expectInvocations);
    if (!spyResult.pass) {
      return fail(spyResult.message);
    }
  }

  return mergeSideOutcomes(user, reference, rejects);
}
