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
  it('passes without calls (add regression)', () => {
    const env = dualEnv(
      'const add = (a, b) => a + b;',
      'const add = (a, b) => a + b;',
      'add',
    );
    expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [1, 2], undefined),
    ).toMatchObject({ pass: true });
    expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [3, 4], undefined),
    ).toMatchObject({ pass: true });
  });

  it('fails when starter add is wrong without calls', () => {
    const env = dualEnv('const add = (a, b) => 0;', 'const add = (a, b) => a + b;', 'add');
    expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [1, 2], undefined),
    ).toMatchObject({ pass: false });
  });

  it('supports curry calls chain', () => {
    const code = 'const mul = (a) => (b) => (c) => a * b * c;';
    const env = dualEnv(code, code, 'mul');
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [2], [
      { args: [3] },
      { args: [4] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 24, referenceValue: 24 });
  });

  it('supports counter with three empty call steps', () => {
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
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { args: [] },
      { args: [] },
      { args: [] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 3 });
  });

  it('supports method calls on returned object', () => {
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
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { method: 'inc', args: [] },
      { method: 'inc', args: [] },
      { method: 'get', args: [] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 2 });
  });

  it('fails when method is missing', () => {
    const code = `
      function makeCounter() {
        return { get() { return 1; } };
      }
    `;
    const env = dualEnv(code, code, 'makeCounter');
    expect(() =>
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
        { method: 'inc', args: [] },
      ]),
    ).toThrow(/not a function/);
  });

  it('with calls: [] compares only primary args result', () => {
    const code = 'const id = (x) => x;';
    const env = dualEnv(code, code, 'id');
    expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [42], []),
    ).toMatchObject({ pass: true, userValue: 42 });
  });

  it('fails when starter returns noop callable but reference is real counter', () => {
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
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { args: [] },
      { args: [] },
      { args: [] },
    ]);
    expect(result.pass).toBe(false);
  });

  it('fails with non-JSON result when final value is a function', () => {
    const code = 'const getFn = () => () => 1;';
    const env = dualEnv(code, code, 'getFn');
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('fails with non-JSON result when final value is symbol', () => {
    const code = 'const sym = () => Symbol("x");';
    const env = dualEnv(code, code, 'sym');
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('fails with non-JSON result when final value is bigint', () => {
    const code = 'const big = () => 1n;';
    const env = dualEnv(code, code, 'big');
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined);
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('supports method on function via Reflect.get semantics', () => {
    const code = `
      function makeFn() {
        const fn = () => 0;
        fn.getValue = function() { return 42; };
        return fn;
      }
    `;
    const env = dualEnv(code, code, 'makeFn');
    const result = runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { method: 'getValue', args: [] },
    ]);
    expect(result).toMatchObject({ pass: true, userValue: 42 });
  });

  it('fails case on runtime error mid calls chain', () => {
    const code = 'const bad = () => { throw new Error("boom"); };';
    const env = dualEnv(code, code, 'bad');
    expect(() =>
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [{ args: [] }]),
    ).toThrow('boom');
  });
});
