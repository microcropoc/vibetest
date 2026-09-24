import { describe, expect, it } from 'vitest';

import { compileJavascriptPracticeCallable } from '../../../execution/javascript-practice-compile';

import { runJavascriptCaseComparison } from './run-javascript-case';

function dualEnv(
  userCode: string,
  referenceCode: string,
  functionName: string,
  setup = '',
): {
  invokeUser: (args: readonly unknown[]) => unknown;
  invokeReference: (args: readonly unknown[]) => unknown;
} {
  const user = compileJavascriptPracticeCallable(setup, userCode, functionName);
  const reference = compileJavascriptPracticeCallable(setup, referenceCode, functionName);
  return {
    invokeUser: (args) => user.invoke(args),
    invokeReference: (args) => reference.invoke(args),
  };
}

describe('runJavascriptCaseComparison', () => {
  it('passes without calls (add regression)', async () => {
    const env = dualEnv(
      'const add = (a, b) => a + b;',
      'const add = (a, b) => a + b;',
      'add',
    );
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [1, 2], undefined),
    ).resolves.toMatchObject({ pass: true });
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [3, 4], undefined),
    ).resolves.toMatchObject({ pass: true });
  });

  it('fails when starter add is wrong without calls', async () => {
    const env = dualEnv('const add = (a, b) => 0;', 'const add = (a, b) => a + b;', 'add');
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [1, 2], undefined),
    ).resolves.toMatchObject({ pass: false });
  });

  it('supports curry calls chain', async () => {
    const code = 'const mul = (a) => (b) => (c) => a * b * c;';
    const env = dualEnv(code, code, 'mul');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [2], [
      { args: [3] },
      { args: [4] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 24, referenceValue: 24 });
  });

  it('supports counter with three empty call steps', async () => {
    const code = `
      function makeCounter() {
        let n = 0;
        function step() {
          n += 1;
          return n < 3 ? step : n;
        }
        return step;
      }
    `;
    const env = dualEnv(code, code, 'makeCounter');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { args: [] },
      { args: [] },
      { args: [] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 3 });
  });

  it('supports method calls on returned object', async () => {
    const code = `
      function makeCounter() {
        return {
          n: 0,
          inc() { this.n += 1; return this; },
          get() { return this.n; },
        };
      }
    `;
    const env = dualEnv(code, code, 'makeCounter');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { method: 'inc', args: [] },
      { method: 'inc', args: [] },
      { method: 'get', args: [] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 2 });
  });

  it('fails when method is missing', async () => {
    const code = `
      function makeCounter() {
        return { get() { return 1; } };
      }
    `;
    const env = dualEnv(code, code, 'makeCounter');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { method: 'inc', args: [] },
    ]);
    expect(result.pass).toBe(false);
    expect(result.message).toMatch(/not a function/);
  });

  it('with calls: [] compares only primary args result', async () => {
    const code = 'const id = (x) => x;';
    const env = dualEnv(code, code, 'id');
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [42], []),
    ).resolves.toMatchObject({ pass: true, userValue: 42 });
  });

  it('fails when starter returns noop callable but reference is real counter', async () => {
    const userCode = `
      function makeCounter() {
        let n = 0;
        function step() {
          n += 1;
          return n < 3 ? step : 0;
        }
        return step;
      }
    `;
    const refCode = `
      function makeCounter() {
        let n = 0;
        function step() {
          n += 1;
          return n < 3 ? step : n;
        }
        return step;
      }
    `;
    const env = dualEnv(userCode, refCode, 'makeCounter');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { args: [] },
      { args: [] },
      { args: [] },
    ]);
    expect(result.pass).toBe(false);
  });

  it('fails with non-JSON result when final value is a function', async () => {
    const code = 'const getFn = () => () => 1;';
    const env = dualEnv(code, code, 'getFn');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('fails with non-JSON result when final value is symbol', async () => {
    const code = 'const sym = () => Symbol("x");';
    const env = dualEnv(code, code, 'sym');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('fails with non-JSON result when final value is bigint', async () => {
    const code = 'const big = () => 1n;';
    const env = dualEnv(code, code, 'big');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('supports method on function via Reflect.get semantics', async () => {
    const code = `
      function makeFn() {
        const fn = () => 0;
        fn.getValue = function() { return 42; };
        return fn;
      }
    `;
    const env = dualEnv(code, code, 'makeFn');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { method: 'getValue', args: [] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 42 });
  });

  it('fails case on runtime error mid calls chain', async () => {
    const code = 'const bad = () => { throw new Error("boom"); };';
    const env = dualEnv(code, code, 'bad');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { args: [] },
    ]);
    expect(result).toMatchObject({ pass: false, message: 'boom' });
  });

  it('passes when user sync and reference returns Promise.resolve', async () => {
    const env = dualEnv('const f = () => 42;', 'const f = () => Promise.resolve(42);', 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: true, userValue: 42 });
  });

  it('passes when both return Promise.resolve(1)', async () => {
    const code = 'const f = () => Promise.resolve(1);';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: true, userValue: 1 });
  });

  it('fails when thenable never settles before deadline', async () => {
    const code = 'const hang = () => new Promise(() => {});';
    const env = dualEnv(code, code, 'hang');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, {
      deadlineMs: Date.now() + 50,
    });
    expect(result.pass).toBe(false);
    expect(result.message).toBe('Timeout');
  });

  it('passes rejects when both reject with string reason', async () => {
    const code = 'const f = () => Promise.reject("err");';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, {
      rejects: true,
    });
    expect(result).toMatchObject({ pass: true, userValue: 'err', referenceValue: 'err' });
  });

  it('passes rejects when both reject with Error message', async () => {
    const code = 'const f = () => Promise.reject(new Error("x"));';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, {
      rejects: true,
    });
    expect(result).toMatchObject({ pass: true, userValue: 'x', referenceValue: 'x' });
  });

  it('fails when both reject without rejects flag', async () => {
    const code = 'const f = () => Promise.reject("err");';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'Promise rejected' });
  });

  it('fails when user fulfills and reference rejects', async () => {
    const env = dualEnv(
      'const f = () => 1;',
      'const f = () => Promise.reject("err");',
      'f',
    );
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result.pass).toBe(false);
  });

  it('supports async calls chain resolving to callable', async () => {
    const code = `
      function getPromiseFn() {
        return Promise.resolve(function add(x) { return x + 1; });
      }
    `;
    const env = dualEnv(code, code, 'getPromiseFn');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [{ args: [1] }]);
    expect(result).toMatchObject({ pass: true, userValue: 2 });
  });

  it('supports mixed sync call then Promise result', async () => {
    const code = `
      function start() {
        return function next() {
          return Promise.resolve(2);
        };
      }
    `;
    const env = dualEnv(code, code, 'start');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [{ args: [] }]);
    expect(result).toMatchObject({ pass: true, userValue: 2 });
  });

  it('awaits custom thenable fulfill (non-Promise)', async () => {
    const code = `
      const f = () => ({
        then(resolve) { resolve(7); },
      });
    `;
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: true, userValue: 7 });
  });

  it('fails custom thenable reject without rejects flag', async () => {
    const code = `
      const f = () => ({
        then(_resolve, reject) { reject('nope'); },
      });
    `;
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'Promise rejected' });
  });

  it('passes custom thenable reject with rejects flag', async () => {
    const code = `
      const f = () => ({
        then(_resolve, reject) { reject('nope'); },
      });
    `;
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, {
      rejects: true,
    });
    expect(result).toMatchObject({ pass: true, userValue: 'nope', referenceValue: 'nope' });
  });

  it('fails rejects true when both sides sync throw instead of reject', async () => {
    const code = 'const f = () => { throw new Error("boom"); };';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, {
      rejects: true,
    });
    expect(result).toMatchObject({ pass: false, message: 'boom' });
  });
});
