import { normalizeRejectReason } from './await-thenable';
import {
  runJavascriptSideChain,
  type JavascriptSideOutcome,
} from './apply-javascript-calls-async';
import type { JavascriptCallStep } from './apply-javascript-calls';
import { compareSpyInvocations } from './compare-spy-invocations';
import type { FakeTimerController } from '../../../execution/javascript-fake-timers';
import type { PracticeGlobalBag } from '../../../execution/javascript-practice-global';
import { encodeSpecialValues } from '../../../execution/javascript-special-values';
import { isJsonCompatibleValue, jsonCompatibleEqual } from './json-value-equal';
import { JavascriptCheckerError, runJavascriptChecker } from './run-javascript-checker';
import { sortUnordered } from './sort-unordered';
import {
  prepareArgs,
  prepareCalls,
  serializeArgs,
  serializeResult,
  StructureCodecError,
  type JavascriptStructure,
  type StructureKind,
} from './structure-codec';

export type JavascriptResultMode = 'return' | 'args' | 'both';

export type JavascriptCaseRunResult = {
  readonly pass: boolean;
  readonly userValue?: unknown;
  readonly referenceValue?: unknown;
  readonly message?: string;
  readonly userMs: number;
  readonly referenceMs: number;
};

type JavascriptCaseCompareResult = Omit<JavascriptCaseRunResult, 'userMs' | 'referenceMs'>;

export type JavascriptCaseRunOptions = {
  readonly rejects?: boolean;
  readonly deadlineMs?: number;
  readonly expectInvocations?: Readonly<Record<string, number>>;
  readonly advanceMs?: number;
  readonly flushMicrotasks?: boolean;
  readonly resultMode?: JavascriptResultMode;
  readonly structure?: JavascriptStructure;
  readonly unordered?: boolean;
  /** Escape hatch: replaces equal / resultMode / unordered on fulfilled path. */
  readonly checker?: string;
  readonly userTimers: FakeTimerController;
  readonly referenceTimers: FakeTimerController;
  readonly userGlobal: PracticeGlobalBag;
  readonly referenceGlobal: PracticeGlobalBag;
};

function fail(message: string): JavascriptCaseCompareResult {
  return { pass: false, message };
}

function failBeforeSideChains(message: string): JavascriptCaseRunResult {
  return { pass: false, message, userMs: 0, referenceMs: 0 };
}

function compareJsonValues(
  userValue: unknown,
  referenceValue: unknown,
  mismatchMessage: string,
): JavascriptCaseCompareResult {
  if (!isJsonCompatibleValue(userValue) || !isJsonCompatibleValue(referenceValue)) {
    return fail('non-JSON result');
  }
  const pass = jsonCompatibleEqual(userValue, referenceValue);
  return {
    pass,
    userValue,
    referenceValue,
    message: pass ? undefined : mismatchMessage,
  };
}

function toComparable(value: unknown, unordered: boolean): unknown {
  return maybeUnordered(encodeSpecialValues(value), unordered);
}

function compareRejected(
  userReason: unknown,
  referenceReason: unknown,
): JavascriptCaseCompareResult {
  const userValue = normalizeRejectReason(userReason);
  const referenceValue = normalizeRejectReason(referenceReason);
  if (userValue === undefined || referenceValue === undefined) {
    return fail('non-JSON result');
  }
  return compareJsonValues(
    toComparable(userValue, false),
    toComparable(referenceValue, false),
    'Reject reasons do not match',
  );
}

function failOnThrownSideOutcomes(
  user: JavascriptSideOutcome,
  reference: JavascriptSideOutcome,
): JavascriptCaseCompareResult | undefined {
  if (user.kind === 'thrown') {
    return fail(user.message);
  }
  if (reference.kind === 'thrown') {
    return fail(reference.message);
  }
  return undefined;
}

function applyTimerPhaseSync(options: JavascriptCaseRunOptions): JavascriptCaseCompareResult | undefined {
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

type TimedSideOutcome = {
  readonly outcome: JavascriptSideOutcome;
  readonly ms: number;
};

function timeJavascriptSideChain(
  invoke: (args: readonly unknown[]) => unknown,
  args: readonly unknown[],
  calls: readonly JavascriptCallStep[] | undefined,
  deadlineMs: number | undefined,
): TimedSideOutcome | Promise<TimedSideOutcome> {
  const start = performance.now();
  const run = runJavascriptSideChain(invoke, args, calls, deadlineMs);
  if (run instanceof Promise) {
    return run.then((outcome) => ({ outcome, ms: performance.now() - start }));
  }
  return { outcome: run, ms: performance.now() - start };
}

type ResolvedSideChains = {
  readonly user: JavascriptSideOutcome;
  readonly reference: JavascriptSideOutcome;
  readonly userMs: number;
  readonly referenceMs: number;
};

function resolveBothSideChains(
  invokeUser: (args: readonly unknown[]) => unknown,
  invokeReference: (args: readonly unknown[]) => unknown,
  userArgs: readonly unknown[],
  referenceArgs: readonly unknown[],
  userCalls: readonly JavascriptCallStep[] | undefined,
  referenceCalls: readonly JavascriptCallStep[] | undefined,
  deadlineMs: number | undefined,
): ResolvedSideChains | Promise<ResolvedSideChains> {
  function mergeTimed(
    user: TimedSideOutcome,
    reference: TimedSideOutcome,
  ): ResolvedSideChains {
    return {
      user: user.outcome,
      reference: reference.outcome,
      userMs: user.ms,
      referenceMs: reference.ms,
    };
  }

  function afterUser(user: TimedSideOutcome): ResolvedSideChains | Promise<ResolvedSideChains> {
    const referenceTimed = timeJavascriptSideChain(
      invokeReference,
      referenceArgs,
      referenceCalls,
      deadlineMs,
    );
    if (referenceTimed instanceof Promise) {
      return referenceTimed.then((reference) => mergeTimed(user, reference));
    }
    return mergeTimed(user, referenceTimed);
  }

  const userTimed = timeJavascriptSideChain(invokeUser, userArgs, userCalls, deadlineMs);
  if (userTimed instanceof Promise) {
    return userTimed.then(afterUser);
  }
  return afterUser(userTimed);
}

function withCaseTimings(
  result: JavascriptCaseCompareResult,
  userMs: number,
  referenceMs: number,
): JavascriptCaseRunResult {
  return { ...result, userMs, referenceMs };
}

function maybeUnordered(value: unknown, unordered: boolean): unknown {
  return unordered ? sortUnordered(value) : value;
}

function compareFulfilledWithMode(
  user: Extract<JavascriptSideOutcome, { kind: 'fulfilled' }>,
  reference: Extract<JavascriptSideOutcome, { kind: 'fulfilled' }>,
  userArgs: readonly unknown[],
  referenceArgs: readonly unknown[],
  resultMode: JavascriptResultMode,
  structure: JavascriptStructure | undefined,
  unordered: boolean,
): JavascriptCaseCompareResult {
  try {
    const resultKind: StructureKind | undefined = structure?.result;
    const structureArgs = structure?.args;

    if (resultMode === 'return' || resultMode === 'both') {
      if (user.value === undefined || reference.value === undefined) {
        return fail('non-JSON result');
      }
      const userSerialized = serializeResult(user.value, resultKind);
      const referenceSerialized = serializeResult(reference.value, resultKind);
      const returnCompare = compareJsonValues(
        toComparable(userSerialized, unordered),
        toComparable(referenceSerialized, unordered),
        'Return values do not match',
      );
      if (!returnCompare.pass) {
        return returnCompare;
      }
      if (resultMode === 'return') {
        return returnCompare;
      }
    }

    if (resultMode === 'args' || resultMode === 'both') {
      const userSerializedArgs = serializeArgs(userArgs, structureArgs);
      const referenceSerializedArgs = serializeArgs(referenceArgs, structureArgs);
      const argsCompare = compareJsonValues(
        toComparable(userSerializedArgs, unordered),
        toComparable(referenceSerializedArgs, unordered),
        'Args values do not match',
      );
      if (!argsCompare.pass) {
        return argsCompare;
      }
      if (resultMode === 'args') {
        return {
          pass: true,
          userValue: userSerializedArgs,
          referenceValue: referenceSerializedArgs,
        };
      }
      return {
        pass: true,
        userValue: toComparable(serializeResult(user.value, resultKind), unordered),
        referenceValue: toComparable(serializeResult(reference.value, resultKind), unordered),
      };
    }

    return fail('Invalid resultMode');
  } catch (error: unknown) {
    if (error instanceof StructureCodecError) {
      return fail(error.message);
    }
    const message = error instanceof Error ? error.message : 'Serialize error';
    return fail(message);
  }
}

async function compareWithChecker(
  user: Extract<JavascriptSideOutcome, { kind: 'fulfilled' }>,
  reference: Extract<JavascriptSideOutcome, { kind: 'fulfilled' }>,
  userArgs: readonly unknown[],
  referenceArgs: readonly unknown[],
  checker: string,
): Promise<JavascriptCaseCompareResult> {
  try {
    const pass = await runJavascriptChecker(checker, {
      userResult: user.value,
      refResult: reference.value,
      userArgs,
      refArgs: referenceArgs,
    });
    return {
      pass,
      userValue: user.value,
      referenceValue: reference.value,
      message: pass ? undefined : 'Checker rejected',
    };
  } catch (error: unknown) {
    if (error instanceof JavascriptCheckerError) {
      return fail(error.message);
    }
    const message = error instanceof Error ? error.message : 'Checker error';
    return fail(message);
  }
}

async function mergeSideOutcomes(
  user: JavascriptSideOutcome,
  reference: JavascriptSideOutcome,
  rejects: boolean,
  userArgs: readonly unknown[],
  referenceArgs: readonly unknown[],
  resultMode: JavascriptResultMode,
  structure: JavascriptStructure | undefined,
  unordered: boolean,
  checker: string | undefined,
): Promise<JavascriptCaseCompareResult> {
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
    if (checker !== undefined && checker.length > 0) {
      return compareWithChecker(user, reference, userArgs, referenceArgs, checker);
    }
    return compareFulfilledWithMode(
      user,
      reference,
      userArgs,
      referenceArgs,
      resultMode,
      structure,
      unordered,
    );
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
  options: JavascriptCaseRunOptions,
): Promise<JavascriptCaseRunResult> {
  const { rejects = false, deadlineMs, expectInvocations } = options;
  const resultMode: JavascriptResultMode = options.resultMode ?? 'return';
  const { structure } = options;
  const unordered = options.unordered === true;
  const checker =
    options.checker !== undefined && options.checker.length > 0 ? options.checker : undefined;

  let userArgs: unknown[];
  let referenceArgs: unknown[];
  let userCalls: readonly JavascriptCallStep[] | undefined;
  let referenceCalls: readonly JavascriptCallStep[] | undefined;
  try {
    userArgs = prepareArgs(args, structure?.args);
    referenceArgs = prepareArgs(args, structure?.args);
    userCalls = prepareCalls(calls, structure?.args);
    referenceCalls = prepareCalls(calls, structure?.args);
  } catch (error: unknown) {
    if (error instanceof StructureCodecError) {
      return failBeforeSideChains(error.message);
    }
    const message = error instanceof Error ? error.message : 'Materialize error';
    return failBeforeSideChains(message);
  }

  const sideOutcomes = resolveBothSideChains(
    invokeUser,
    invokeReference,
    userArgs,
    referenceArgs,
    userCalls,
    referenceCalls,
    deadlineMs,
  );
  const resolved = sideOutcomes instanceof Promise ? await sideOutcomes : sideOutcomes;
  const { user, reference, userMs, referenceMs } = resolved;

  const thrownEarly = failOnThrownSideOutcomes(user, reference);
  if (thrownEarly) {
    return withCaseTimings(thrownEarly, userMs, referenceMs);
  }

  if (options.flushMicrotasks) {
    await Promise.resolve();
  }

  const timerError = applyTimerPhaseSync(options);
  if (timerError) {
    return withCaseTimings(timerError, userMs, referenceMs);
  }

  if (expectInvocations !== undefined && Object.keys(expectInvocations).length > 0) {
    const spyResult = compareSpyInvocations(options.userGlobal, options.referenceGlobal, expectInvocations);
    if (!spyResult.pass) {
      return withCaseTimings(fail(spyResult.message), userMs, referenceMs);
    }
  }

  const merged = await mergeSideOutcomes(
    user,
    reference,
    rejects,
    userArgs,
    referenceArgs,
    resultMode,
    structure,
    unordered,
    checker,
  );
  return withCaseTimings(merged, userMs, referenceMs);
}
