import { describe, expect, it } from 'vitest';

import {
  JAVASCRIPT_CHECKER_TIMEOUT_MS,
  JavascriptCheckerError,
  runJavascriptChecker,
} from './run-javascript-checker';

describe('runJavascriptChecker', () => {
  it('returns true when checker returns true', async () => {
    const pass = await runJavascriptChecker('(ctx) => ctx.deepEqual(ctx.userResult, ctx.refResult)', {
      userResult: 1,
      refResult: 1,
      userArgs: [],
      refArgs: [],
    });
    expect(pass).toBe(true);
  });

  it('returns false when checker returns false', async () => {
    const pass = await runJavascriptChecker('(ctx) => false', {
      userResult: 1,
      refResult: 1,
      userArgs: [],
      refArgs: [],
    });
    expect(pass).toBe(false);
  });

  it('fails when checker returns non-boolean', async () => {
    await expect(
      runJavascriptChecker('(ctx) => 1', {
        userResult: null,
        refResult: null,
        userArgs: [],
        refArgs: [],
      }),
    ).rejects.toThrow(JavascriptCheckerError);
    await expect(
      runJavascriptChecker('(ctx) => 1', {
        userResult: null,
        refResult: null,
        userArgs: [],
        refArgs: [],
      }),
    ).rejects.toThrow(/boolean/);
  });

  it('fails when checker throws', async () => {
    await expect(
      runJavascriptChecker('(ctx) => { throw new Error("boom"); }', {
        userResult: null,
        refResult: null,
        userArgs: [],
        refArgs: [],
      }),
    ).rejects.toThrow(/boom/);
  });

  it('times out never-settling thenable', async () => {
    const started = Date.now();
    await expect(
      runJavascriptChecker('(ctx) => new Promise(() => {})', {
        userResult: null,
        refResult: null,
        userArgs: [],
        refArgs: [],
      }),
    ).rejects.toThrow(/Checker timeout/);
    expect(Date.now() - started).toBeGreaterThanOrEqual(JAVASCRIPT_CHECKER_TIMEOUT_MS - 20);
  });

  it('exposes helpers on ctx', async () => {
    const pass = await runJavascriptChecker(
      `(ctx) => {
        const a = ctx.sortUnordered([2, 1]);
        const b = ctx.sortUnordered([1, 2]);
        return ctx.deepEqual(a, b);
      }`,
      {
        userResult: null,
        refResult: null,
        userArgs: [],
        refArgs: [],
      },
    );
    expect(pass).toBe(true);
  });
});
