import { ThenableTimeoutError, awaitThenable, isThenable } from './await-thenable';
import { jsonCompatibleEqual } from './json-value-equal';
import { sortUnordered } from './sort-unordered';
import { serializeList, serializeTree } from './structure-codec';

/** Isolated checker sandbox timeout (SPEC). */
export const JAVASCRIPT_CHECKER_TIMEOUT_MS = 250;

export type JavascriptCheckerPayload = {
  readonly userResult: unknown;
  readonly refResult: unknown;
  readonly userArgs: readonly unknown[];
  readonly refArgs: readonly unknown[];
};

export class JavascriptCheckerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JavascriptCheckerError';
  }
}

function buildCtx(payload: JavascriptCheckerPayload): Record<string, unknown> {
  return {
    userResult: payload.userResult,
    refResult: payload.refResult,
    userArgs: payload.userArgs,
    refArgs: payload.refArgs,
    deepEqual: jsonCompatibleEqual,
    serializeList,
    serializeTree,
    sortUnordered,
  };
}

function invokeCheckerSource(source: string, ctx: Record<string, unknown>): unknown {
  const factory = new Function(
    'ctx',
    `"use strict";
const __checker = (${source});
if (typeof __checker !== "function") {
  throw new Error("checker must be a function");
}
return __checker(ctx);`,
  );
  return factory(ctx);
}

function assertBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new JavascriptCheckerError('checker must return boolean');
  }
  return value;
}

/**
 * Runs author `checker` in an isolated context (not user/reference globals).
 * Thenable returns are awaited with {@link JAVASCRIPT_CHECKER_TIMEOUT_MS}.
 * Sync infinite loops are not preempted here — covered by step `timeoutMs` / Worker terminate.
 */
export async function runJavascriptChecker(
  source: string,
  payload: JavascriptCheckerPayload,
): Promise<boolean> {
  const ctx = buildCtx(payload);
  let raw: unknown;
  try {
    raw = invokeCheckerSource(source, ctx);
  } catch (error: unknown) {
    if (error instanceof JavascriptCheckerError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Checker error';
    throw new JavascriptCheckerError(message);
  }

  if (isThenable(raw)) {
    try {
      raw = await awaitThenable(raw, Date.now() + JAVASCRIPT_CHECKER_TIMEOUT_MS);
    } catch (error: unknown) {
      if (error instanceof ThenableTimeoutError) {
        throw new JavascriptCheckerError('Checker timeout');
      }
      if (error instanceof JavascriptCheckerError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Checker error';
      throw new JavascriptCheckerError(message);
    }
  }

  return assertBoolean(raw);
}
