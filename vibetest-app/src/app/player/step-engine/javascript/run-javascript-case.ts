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
};

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

function fail(message: string): JavascriptCaseRunResult {
  return { pass: false, message };
}

function compareJsonValues(
  userValue: unknown,
  referenceValue: unknown,
  mismatchMessage: string,
): JavascriptCaseRunResult {
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

function compareRejected(
  userReason: unknown,
  referenceReason: unknown,
): JavascriptCaseRunResult {
  const userValue = normalizeRejectReason(userReason);
  const referenceValue = normalizeRejectReason(referenceReason);
  return compareJsonValues(userValue, referenceValue, 'Reject reasons do not match');
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
  userArgs: readonly unknown[],
  referenceArgs: readonly unknown[],
  userCalls: readonly JavascriptCallStep[] | undefined,
  referenceCalls: readonly JavascriptCallStep[] | undefined,
  deadlineMs: number | undefined,
):
  | [JavascriptSideOutcome, JavascriptSideOutcome]
  | Promise<[JavascriptSideOutcome, JavascriptSideOutcome]> {
  const userRun = runJavascriptSideChain(invokeUser, userArgs, userCalls, deadlineMs);
  const referenceRun = runJavascriptSideChain(invokeReference, referenceArgs, referenceCalls, deadlineMs);
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
): JavascriptCaseRunResult {
  try {
    const resultKind: StructureKind | undefined = structure?.result;
    const structureArgs = structure?.args;

    if (resultMode === 'return' || resultMode === 'both') {
      const userSerialized = maybeUnordered(serializeResult(user.value, resultKind), unordered);
      const referenceSerialized = maybeUnordered(
        serializeResult(reference.value, resultKind),
        unordered,
      );
      const returnCompare = compareJsonValues(
        userSerialized,
        referenceSerialized,
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
      const userSerializedArgs = maybeUnordered(serializeArgs(userArgs, structureArgs), unordered);
      const referenceSerializedArgs = maybeUnordered(
        serializeArgs(referenceArgs, structureArgs),
        unordered,
      );
      const argsCompare = compareJsonValues(
        userSerializedArgs,
        referenceSerializedArgs,
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
        userValue: maybeUnordered(serializeResult(user.value, resultKind), unordered),
        referenceValue: maybeUnordered(serializeResult(reference.value, resultKind), unordered),
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
): Promise<JavascriptCaseRunResult> {
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
): Promise<JavascriptCaseRunResult> {
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
      return fail(error.message);
    }
    const message = error instanceof Error ? error.message : 'Materialize error';
    return fail(message);
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

  return mergeSideOutcomes(
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
}
