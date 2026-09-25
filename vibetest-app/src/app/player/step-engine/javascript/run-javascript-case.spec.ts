import { describe, expect, it } from 'vitest';

import { compileJavascriptPracticeCallable } from '../../../execution/javascript-practice-compile';
import type { JavascriptPracticeTarget } from '../../../execution/javascript-practice-compile';

import { runJavascriptCaseComparison, type JavascriptCaseRunOptions } from './run-javascript-case';

function resolveTarget(
  target: string | JavascriptPracticeTarget,
): JavascriptPracticeTarget {
  if (typeof target === 'string') {
    return { kind: 'function', name: target };
  }
  return target;
}

function dualEnv(
  userCode: string,
  referenceCode: string,
  target: string | JavascriptPracticeTarget,
  setup = '',
): {
  invokeUser: (args: readonly unknown[]) => unknown;
  invokeReference: (args: readonly unknown[]) => unknown;
  opts: (extra?: Partial<JavascriptCaseRunOptions>) => JavascriptCaseRunOptions;
  applyUserReset: (reset: string) => void;
  applyReferenceReset: (reset: string) => void;
} {
  const resolved = resolveTarget(target);
  const user = compileJavascriptPracticeCallable(setup, userCode, resolved);
  const reference = compileJavascriptPracticeCallable(setup, referenceCode, resolved);
  const opts = (extra: Partial<JavascriptCaseRunOptions> = {}): JavascriptCaseRunOptions => ({
    userTimers: user.timers,
    referenceTimers: reference.timers,
    userGlobal: user.globalBag,
    referenceGlobal: reference.globalBag,
    ...extra,
  });
  return {
    invokeUser: (args) => user.invoke(args),
    invokeReference: (args) => reference.invoke(args),
    opts,
    applyUserReset: (reset) => user.applyReset(reset),
    applyReferenceReset: (reset) => reference.applyReset(reset),
  };
}

const memoizeSetup = `
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
`;

describe('runJavascriptCaseComparison', () => {
  it('passes without calls (add regression)', async () => {
    const env = dualEnv(
      'const add = (a, b) => a + b;',
      'const add = (a, b) => a + b;',
      'add',
    );
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [1, 2], undefined, env.opts()),
    ).resolves.toMatchObject({ pass: true });
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [3, 4], undefined, env.opts()),
    ).resolves.toMatchObject({ pass: true });
  });

  it('fails when starter add is wrong without calls', async () => {
    const env = dualEnv('const add = (a, b) => 0;', 'const add = (a, b) => a + b;', 'add');
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [1, 2], undefined, env.opts()),
    ).resolves.toMatchObject({ pass: false });
  });

  it('supports curry calls chain', async () => {
    const code = 'const mul = (a) => (b) => (c) => a * b * c;';
    const env = dualEnv(code, code, 'mul');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [2], [
      { args: [3] },
      { args: [4] },
    ], env.opts());
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
    ], env.opts());
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
    ], env.opts());
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
    ], env.opts());
    expect(result.pass).toBe(false);
    expect(result.message).toMatch(/not a function/);
  });

  it('with calls: [] compares only primary args result', async () => {
    const code = 'const id = (x) => x;';
    const env = dualEnv(code, code, 'id');
    await expect(
      runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [42], [], env.opts()),
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
    ], env.opts());
    expect(result.pass).toBe(false);
  });

  it('fails with non-JSON result when final value is a function', async () => {
    const code = 'const getFn = () => () => 1;';
    const env = dualEnv(code, code, 'getFn');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('fails with non-JSON result when final value is symbol', async () => {
    const code = 'const sym = () => Symbol("x");';
    const env = dualEnv(code, code, 'sym');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('fails with non-JSON result when final value is bigint', async () => {
    const code = 'const big = () => 1n;';
    const env = dualEnv(code, code, 'big');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
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
    ], env.opts());
    expect(result).toMatchObject({ pass: true, userValue: 42 });
  });

  it('fails case on runtime error mid calls chain', async () => {
    const code = 'const bad = () => { throw new Error("boom"); };';
    const env = dualEnv(code, code, 'bad');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [
      { args: [] },
    ], env.opts());
    expect(result).toMatchObject({ pass: false, message: 'boom' });
  });

  it('passes when user sync and reference returns Promise.resolve', async () => {
    const env = dualEnv('const f = () => 42;', 'const f = () => Promise.resolve(42);', 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result).toMatchObject({ pass: true, userValue: 42 });
  });

  it('passes when both return Promise.resolve(1)', async () => {
    const code = 'const f = () => Promise.resolve(1);';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result).toMatchObject({ pass: true, userValue: 1 });
  });

  it('fails when thenable never settles before deadline', async () => {
    const code = 'const hang = () => new Promise(() => {});';
    const env = dualEnv(code, code, 'hang');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts({
      deadlineMs: Date.now() + 50,
    }));
    expect(result.pass).toBe(false);
    expect(result.message).toBe('Timeout');
  });

  it('passes rejects when both reject with string reason', async () => {
    const code = 'const f = () => Promise.reject("err");';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts({
      rejects: true,
    }));
    expect(result).toMatchObject({ pass: true, userValue: 'err', referenceValue: 'err' });
  });

  it('passes rejects when both reject with Error message', async () => {
    const code = 'const f = () => Promise.reject(new Error("x"));';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts({
      rejects: true,
    }));
    expect(result).toMatchObject({ pass: true, userValue: 'x', referenceValue: 'x' });
  });

  it('fails when both reject without rejects flag', async () => {
    const code = 'const f = () => Promise.reject("err");';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result).toMatchObject({ pass: false, message: 'Promise rejected' });
  });

  it('fails when user fulfills and reference rejects', async () => {
    const env = dualEnv(
      'const f = () => 1;',
      'const f = () => Promise.reject("err");',
      'f',
    );
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result.pass).toBe(false);
  });

  it('supports async calls chain resolving to callable', async () => {
    const code = `
      function getPromiseFn() {
        return Promise.resolve(function add(x) { return x + 1; });
      }
    `;
    const env = dualEnv(code, code, 'getPromiseFn');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [{ args: [1] }], env.opts());
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
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], [{ args: [] }], env.opts());
    expect(result).toMatchObject({ pass: true, userValue: 2 });
  });

  it('awaits custom thenable fulfill (non-Promise)', async () => {
    const code = `
      const f = () => ({
        then(resolve) { resolve(7); },
      });
    `;
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result).toMatchObject({ pass: true, userValue: 7 });
  });

  it('fails custom thenable reject without rejects flag', async () => {
    const code = `
      const f = () => ({
        then(_resolve, reject) { reject('nope'); },
      });
    `;
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts());
    expect(result).toMatchObject({ pass: false, message: 'Promise rejected' });
  });

  it('passes custom thenable reject with rejects flag', async () => {
    const code = `
      const f = () => ({
        then(_resolve, reject) { reject('nope'); },
      });
    `;
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts({
      rejects: true,
    }));
    expect(result).toMatchObject({ pass: true, userValue: 'nope', referenceValue: 'nope' });
  });

  it('fails rejects true when both sides sync throw instead of reject', async () => {
    const code = 'const f = () => { throw new Error("boom"); };';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(env.invokeUser, env.invokeReference, [], undefined, env.opts({
      rejects: true,
    }));
    expect(result).toMatchObject({ pass: false, message: 'boom' });
  });

  it('memoize: two same-arg calls invoke spy once', async () => {
    const setup = `${memoizeSetup}
const fn = registerSpy('fn', (x) => x * 2);
const m = memoize(fn);
`;
    const code = `
function solve() {
  return function step1(x) {
    m(x);
    return function step2(x2) {
      return m(x2);
    };
  };
}
`;
    const env = dualEnv(code, code, 'solve', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      [{ args: [1] }, { args: [1] }],
      env.opts({ expectInvocations: { fn: 1 } }),
    );
    expect(result).toMatchObject({ pass: true, userValue: 2 });
  });

  it('fails when broken memoize double-invokes spy', async () => {
    const setup = `${memoizeSetup}
const fn = registerSpy('fn', (x) => x * 2);
const m = memoize(fn);
`;
    const userCode = `
function solve() {
  return function step1(x) {
    fn(x);
    return function step2(x2) {
      return fn(x2);
    };
  };
}
`;
    const refCode = `
function solve() {
  return function step1(x) {
    m(x);
    return function step2(x2) {
      return m(x2);
    };
  };
}
`;
    const env = dualEnv(userCode, refCode, 'solve', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      [{ args: [1] }, { args: [1] }],
      env.opts({ expectInvocations: { fn: 1 } }),
    );
    expect(result.pass).toBe(false);
  });

  it('memoize: different args invoke spy twice', async () => {
    const setup = `${memoizeSetup}
const fn = registerSpy('fn', (x) => x);
const m = memoize(fn);
`;
    const code = `
function solve() {
  return function step1(x) {
    m(x);
    return function step2(x2) {
      return m(x2);
    };
  };
}
`;
    const env = dualEnv(code, code, 'solve', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      [{ args: [1] }, { args: [2] }],
      env.opts({ expectInvocations: { fn: 2 } }),
    );
    expect(result).toMatchObject({ pass: true });
  });

  it('once: second call does not increment spy', async () => {
    const setup = `
function once(fn) {
  let called = false;
  let result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
const fn = registerSpy('fn', (x) => x + 1);
const o = once(fn);
`;
    const code = `
function solve() {
  return function step1(x) {
    o(x);
    return function step2(x2) {
      return o(x2);
    };
  };
}
`;
    const env = dualEnv(code, code, 'solve', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      [{ args: [1] }, { args: [99] }],
      env.opts({ expectInvocations: { fn: 1 } }),
    );
    expect(result).toMatchObject({ pass: true, userValue: 2 });
  });

  it('resets spy count between cases after applyReset', async () => {
    const setup = `
const fn = registerSpy('fn', (x) => x);
`;
    const code = 'const solve = (x) => fn(x);';
    const env = dualEnv(code, code, 'solve', setup);
    env.applyUserReset('');
    env.applyReferenceReset('');
    await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [1],
      undefined,
      env.opts({ expectInvocations: { fn: 1 } }),
    );
    env.applyUserReset('');
    env.applyReferenceReset('');
    const second = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [2],
      undefined,
      env.opts({ expectInvocations: { fn: 1 } }),
    );
    expect(second).toMatchObject({ pass: true });
  });

  it('delay: spy not called until advanceMs', async () => {
    const setup = `
function delay(fn, ms) {
  setTimeout(fn, ms);
}
const fn = registerSpy('fn', () => 1);
`;
    const code = `
const run = () => {
  delay(fn, 100);
  return 0;
};
`;
    const beforeEnv = dualEnv(code, code, 'run', setup);
    const before = await runJavascriptCaseComparison(
      beforeEnv.invokeUser,
      beforeEnv.invokeReference,
      [],
      undefined,
      beforeEnv.opts({ expectInvocations: { fn: 0 } }),
    );
    expect(before).toMatchObject({ pass: true });
    const afterEnv = dualEnv(code, code, 'run', setup);
    const after = await runJavascriptCaseComparison(
      afterEnv.invokeUser,
      afterEnv.invokeReference,
      [],
      undefined,
      afterEnv.opts({ expectInvocations: { fn: 1 }, advanceMs: 100 }),
    );
    expect(after).toMatchObject({ pass: true });
  });

  it('debounce: burst before window then advance fires once', async () => {
    const setup = `
function debounce(fn, wait) {
  let t;
  return function(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
const fn = registerSpy('fn', (x) => x);
const d = debounce(fn, 50);
`;
    const burstCode = `
const burst = () => {
  d(1);
  d(2);
  d(3);
  return 0;
};
`;
    const tooSoonEnv = dualEnv(burstCode, burstCode, 'burst', setup);
    const tooSoon = await runJavascriptCaseComparison(
      tooSoonEnv.invokeUser,
      tooSoonEnv.invokeReference,
      [],
      undefined,
      tooSoonEnv.opts({ expectInvocations: { fn: 0 }, advanceMs: 40 }),
    );
    expect(tooSoon).toMatchObject({ pass: true });
    const firedCode = `
const burst = () => {
  d(1);
  d(2);
  return 0;
};
`;
    const firedEnv = dualEnv(firedCode, firedCode, 'burst', setup);
    const fired = await runJavascriptCaseComparison(
      firedEnv.invokeUser,
      firedEnv.invokeReference,
      [],
      undefined,
      firedEnv.opts({ expectInvocations: { fn: 1 }, advanceMs: 50 }),
    );
    expect(fired).toMatchObject({ pass: true });
  });

  it('nested timeouts fire after cumulative advance', async () => {
    const setup = `
const fn = registerSpy('fn', () => 1);
`;
    const code = `
const nested = () => {
  setTimeout(() => setTimeout(fn, 50), 50);
  return 0;
};
`;
    const partialEnv = dualEnv(code, code, 'nested', setup);
    const partial = await runJavascriptCaseComparison(
      partialEnv.invokeUser,
      partialEnv.invokeReference,
      [],
      undefined,
      partialEnv.opts({ expectInvocations: { fn: 0 }, advanceMs: 80 }),
    );
    expect(partial).toMatchObject({ pass: true });
    const doneEnv = dualEnv(code, code, 'nested', setup);
    const done = await runJavascriptCaseComparison(
      doneEnv.invokeUser,
      doneEnv.invokeReference,
      [],
      undefined,
      doneEnv.opts({ expectInvocations: { fn: 1 }, advanceMs: 100 }),
    );
    expect(done).toMatchObject({ pass: true });
  });

  it('clearTimeout prevents spy invocation', async () => {
    const setup = `
const fn = registerSpy('fn', () => 1);
`;
    const code = `
const schedule = () => {
  const id = setTimeout(fn, 100);
  clearTimeout(id);
  return 0;
};
`;
    const env = dualEnv(code, code, 'schedule', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ expectInvocations: { fn: 0 }, advanceMs: 200 }),
    );
    expect(result).toMatchObject({ pass: true });
  });

  it('does not drain microtasks scheduled inside timer callback without flushMicrotasks', async () => {
    const setup = `
const log = registerSpy('log', (x) => x);
`;
    const code = `
const order = () => {
  setTimeout(() => {
    Promise.resolve().then(() => log('micro'));
    log('macro');
  }, 0);
  return [];
};
`;
    const env = dualEnv(code, code, 'order', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ advanceMs: 0, expectInvocations: { log: 1 } }),
    );
    expect(result).toMatchObject({ pass: true, userValue: [] });
  });

  it('without flushMicrotasks only macro runs after advanceMs (micro from invoke pending)', async () => {
    const setup = `
const log = registerSpy('log', (x) => x);
`;
    const code = `
const order = () => {
  Promise.resolve().then(() => log('micro'));
  setTimeout(() => log('macro'), 0);
  return [];
};
`;
    const env = dualEnv(code, code, 'order', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ advanceMs: 0, expectInvocations: { log: 1 } }),
    );
    expect(result).toMatchObject({ pass: true, userValue: [] });
  });

  it('flushMicrotasks runs invoke micro before setTimeout macro on advanceMs', async () => {
    const setup = `
const log = registerSpy('log', (x) => x);
`;
    const code = `
const order = () => {
  Promise.resolve().then(() => log('micro'));
  setTimeout(() => log('macro'), 0);
  return [];
};
`;
    const env = dualEnv(code, code, 'order', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ flushMicrotasks: true, advanceMs: 0, expectInvocations: { log: 2 } }),
    );
    expect(result).toMatchObject({ pass: true, userValue: [] });
  });

  it('times out when Promise waits on fake setTimeout without advanceMs', async () => {
    const code = `
const later = () =>
  new Promise((resolve) => {
    setTimeout(() => resolve(5), 10);
  });
`;
    const env = dualEnv(code, code, 'later');
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ deadlineMs: Date.now() + 50 }),
    );
    expect(result).toMatchObject({ pass: false, message: 'Timeout' });
  });

  it('fails rejects when both reject with undefined reason (non-JSON)', async () => {
    const code = 'const f = () => Promise.reject(undefined);';
    const env = dualEnv(code, code, 'f');
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ rejects: true }),
    );
    expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
  });

  it('settled Promise plus fake timer and advanceMs in one case', async () => {
    const setup = `
const fn = registerSpy('fn', () => 1);
`;
    const code = `
const run = () => {
  setTimeout(fn, 10);
  return Promise.resolve(1);
};
`;
    const env = dualEnv(code, code, 'run', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ expectInvocations: { fn: 1 }, advanceMs: 10 }),
    );
    expect(result).toMatchObject({ pass: true, userValue: 1 });
  });

  it('clearTimeout in same due batch prevents cleared callback', async () => {
    const setup = `
const fn = registerSpy('fn', () => 1);
`;
    const code = `
const run = () => {
  let second;
  setTimeout(() => {
    clearTimeout(second);
    fn();
  }, 0);
  second = setTimeout(() => fn(), 0);
  return 0;
};
`;
    const env = dualEnv(code, code, 'run', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ expectInvocations: { fn: 1 }, advanceMs: 0 }),
    );
    expect(result).toMatchObject({ pass: true });
  });

  it('reports sync throw before expectInvocations spy check', async () => {
    const setup = `
const fn = registerSpy('fn', () => 1);
`;
    const code = 'const boom = () => { throw new Error("boom"); };';
    const env = dualEnv(code, code, 'boom', setup);
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ expectInvocations: { fn: 1 } }),
    );
    expect(result).toMatchObject({ pass: false, message: 'boom' });
  });

  it('reports throw after thenable settle mid calls as case fail not rejection', async () => {
    const code = `
function start() {
  return Promise.resolve({
    boom() { throw new Error("late"); },
  });
}
`;
    const env = dualEnv(code, code, 'start');
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      [{ method: 'boom', args: [] }],
      env.opts(),
    );
    expect(result).toMatchObject({ pass: false, message: 'late' });
  });

  it('fails when interval exceeds callback cap', async () => {
    const code = `
const spin = () => {
  setInterval(() => {}, 1);
  return 0;
};
`;
    const env = dualEnv(code, code, 'spin');
    const result = await runJavascriptCaseComparison(
      env.invokeUser,
      env.invokeReference,
      [],
      undefined,
      env.opts({ advanceMs: 10000 }),
    );
    expect(result).toMatchObject({ pass: false, message: 'Too many timer callbacks' });
  });

  describe('resultMode', () => {
    const rotateRef = `
function rotate(nums, k) {
  const n = nums.length;
  k = ((k % n) + n) % n;
  const reverse = (l, r) => {
    while (l < r) {
      const t = nums[l];
      nums[l] = nums[r];
      nums[r] = t;
      l += 1;
      r -= 1;
    }
  };
  reverse(0, n - 1);
  reverse(0, k - 1);
  reverse(k, n - 1);
}
`;

    it('return mode fails on void undefined (regression)', async () => {
      const env = dualEnv(rotateRef, rotateRef, 'rotate');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3, 4, 5, 6, 7], 3],
        undefined,
        env.opts({ resultMode: 'return' }),
      );
      expect(result).toMatchObject({ pass: false, message: 'non-JSON result' });
    });

    it('args mode passes in-place rotate with undefined return', async () => {
      const env = dualEnv(rotateRef, rotateRef, 'rotate');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3, 4, 5, 6, 7], 3],
        undefined,
        env.opts({ resultMode: 'args' }),
      );
      expect(result.pass).toBe(true);
      expect(result.userValue).toEqual([[5, 6, 7, 1, 2, 3, 4], 3]);
    });

    it('args mode fails when user does not mutate', async () => {
      const env = dualEnv('function rotate(nums, k) {}', rotateRef, 'rotate');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3, 4, 5, 6, 7], 3],
        undefined,
        env.opts({ resultMode: 'args' }),
      );
      expect(result).toMatchObject({ pass: false, message: 'Args values do not match' });
    });

    it('both mode requires matching return and args', async () => {
      const bothCode = `
function rotate(nums, k) {
  const n = nums.length;
  k = ((k % n) + n) % n;
  nums.push(...nums.splice(0, n - k));
  return nums;
}
`;
      const env = dualEnv(bothCode, bothCode, 'rotate');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3, 4, 5, 6, 7], 3],
        undefined,
        env.opts({ resultMode: 'both' }),
      );
      expect(result.pass).toBe(true);
      expect(result.userValue).toEqual([5, 6, 7, 1, 2, 3, 4]);
    });

    it('both mode fails when return matches but args do not', async () => {
      const userCode = `
function rotate(nums, k) {
  const n = nums.length;
  k = ((k % n) + n) % n;
  const rotated = nums.slice(n - k).concat(nums.slice(0, n - k));
  return rotated;
}
`;
      const refCode = `
function rotate(nums, k) {
  const n = nums.length;
  k = ((k % n) + n) % n;
  nums.push(...nums.splice(0, n - k));
  return nums.slice();
}
`;
      const env = dualEnv(userCode, refCode, 'rotate');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3, 4, 5, 6, 7], 3],
        undefined,
        env.opts({ resultMode: 'both' }),
      );
      expect(result).toMatchObject({ pass: false, message: 'Args values do not match' });
    });

    it('rejects ignores resultMode and compares reasons', async () => {
      const code = `const boom = () => Promise.reject(new Error("x"));`;
      const env = dualEnv(code, code, 'boom');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [],
        undefined,
        env.opts({ rejects: true, resultMode: 'args' }),
      );
      expect(result).toMatchObject({ pass: true, userValue: 'x', referenceValue: 'x' });
    });
  });

  describe('structure', () => {
    const reverseList = `
function reverseList(head) {
  let prev = null;
  let cur = head;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}
`;

    it('list args and result reverseList', async () => {
      const env = dualEnv(reverseList, reverseList, 'reverseList');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3]],
        undefined,
        env.opts({ structure: { args: ['list'], result: 'list' } }),
      );
      expect(result).toMatchObject({ pass: true, userValue: [3, 2, 1] });
    });

    it('materializes list structure on calls[].args', async () => {
      const code = `
function make() {
  return {
    reverse(head) {
      let prev = null;
      let cur = head;
      while (cur) {
        const next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
      }
      return prev;
    },
  };
}
`;
      const env = dualEnv(code, code, 'make');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [],
        [{ method: 'reverse', args: [[1, 2, 3]] }],
        env.opts({ structure: { args: ['list'], result: 'list' } }),
      );
      expect(result).toMatchObject({ pass: true, userValue: [3, 2, 1] });
    });

    it('empty list []', async () => {
      const env = dualEnv(reverseList, reverseList, 'reverseList');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[]],
        undefined,
        env.opts({ structure: { args: ['list'], result: 'list' } }),
      );
      expect(result).toMatchObject({ pass: true, userValue: [] });
    });

    it('cycle in return list fails without hanging', async () => {
      const cyclic = `
function reverseList(head) {
  if (head) head.next = head;
  return head;
}
`;
      const env = dualEnv(cyclic, reverseList, 'reverseList');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2]],
        undefined,
        env.opts({ structure: { args: ['list'], result: 'list' } }),
      );
      expect(result.pass).toBe(false);
      expect(result.message).toMatch(/cycle/);
    });

    it('tree invertTree level-order', async () => {
      const invert = `
function invertTree(root) {
  if (!root) return null;
  const left = invertTree(root.left);
  const right = invertTree(root.right);
  root.left = right;
  root.right = left;
  return root;
}
`;
      const env = dualEnv(invert, invert, 'invertTree');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[4, 2, 7, 1, 3, 6, 9]],
        undefined,
        env.opts({ structure: { args: ['tree'], result: 'tree' } }),
      );
      expect(result).toMatchObject({ pass: true, userValue: [4, 7, 2, 9, 6, 3, 1] });
    });

    it('user and ref get separate list objects', async () => {
      const mutateShared = `
function reverseList(head) {
  return head;
}
`;
      const env = dualEnv(mutateShared, reverseList, 'reverseList');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3]],
        undefined,
        env.opts({ structure: { args: ['list'], result: 'list' } }),
      );
      expect(result).toMatchObject({ pass: false, message: 'Return values do not match' });
    });

    it('raw default still compares arrays', async () => {
      const code = 'const id = (a) => a;';
      const env = dualEnv(code, code, 'id');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3]],
        undefined,
        env.opts(),
      );
      expect(result).toMatchObject({ pass: true, userValue: [1, 2, 3] });
    });
  });

  describe('construct', () => {
    const lruCode = `
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const first = this.map.keys().next().value;
      this.map.delete(first);
    }
    return this;
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
}
`;

    it('LRU-like construct + calls put/get passes', async () => {
      const env = dualEnv(lruCode, lruCode, { kind: 'construct', className: 'LRUCache' });
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [2],
        [
          { method: 'put', args: [1, 1] },
          { method: 'put', args: [2, 2] },
          { method: 'get', args: [1] },
        ],
        env.opts(),
      );
      expect(result).toMatchObject({ pass: true, userValue: 1 });
    });

    it('fails when user get is wrong', async () => {
      const broken = `
class LRUCache {
  constructor(capacity) { this.capacity = capacity; this.map = new Map(); }
  put(key, value) { this.map.set(key, value); return this; }
  get(key) { return 0; }
}
`;
      const env = dualEnv(broken, lruCode, { kind: 'construct', className: 'LRUCache' });
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [2],
        [
          { method: 'put', args: [1, 1] },
          { method: 'get', args: [1] },
        ],
        env.opts(),
      );
      expect(result.pass).toBe(false);
    });

    it('throws when className is missing in environment', () => {
      expect(() =>
        dualEnv('const x = 1;', 'const x = 1;', { kind: 'construct', className: 'Missing' }),
      ).toThrow(/Class Missing is not defined/);
    });

    it('construct + resultMode args compares mutated constructor args', async () => {
      const code = `
class Mut {
  constructor(nums) {
    nums.push(99);
  }
}
`;
      const env = dualEnv(code, code, { kind: 'construct', className: 'Mut' });
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2]],
        undefined,
        env.opts({ resultMode: 'args' }),
      );
      expect(result.pass).toBe(true);
      expect(result.userValue).toEqual([[1, 2, 99]]);
    });
  });

  describe('unordered', () => {
    it('fails without unordered when group order differs', async () => {
      const user = 'const f = () => [[3], [1, 2]];';
      const ref = 'const f = () => [[1, 2], [3]];';
      const env = dualEnv(user, ref, 'f');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [],
        undefined,
        env.opts(),
      );
      expect(result).toMatchObject({ pass: false, message: 'Return values do not match' });
    });

    it('passes with unordered when group order differs', async () => {
      const user = 'const f = () => [[3], [1, 2]];';
      const ref = 'const f = () => [[1, 2], [3]];';
      const env = dualEnv(user, ref, 'f');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [],
        undefined,
        env.opts({ unordered: true }),
      );
      expect(result.pass).toBe(true);
    });

    it('passes when element order inside groups differs', async () => {
      const user = 'const f = () => [[0, -1, 1]];';
      const ref = 'const f = () => [[-1, 0, 1]];';
      const env = dualEnv(user, ref, 'f');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [],
        undefined,
        env.opts({ unordered: true }),
      );
      expect(result.pass).toBe(true);
      expect(result.userValue).toEqual([[-1, 0, 1]]);
    });

    it('fails when multisets differ even with unordered', async () => {
      const user = 'const f = () => [[1, 2], [3]];';
      const ref = 'const f = () => [[1, 2], [4]];';
      const env = dualEnv(user, ref, 'f');
      const result = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [],
        undefined,
        env.opts({ unordered: true }),
      );
      expect(result.pass).toBe(false);
    });

    it('serializes list before unordered normalize', async () => {
      const identity = 'function f(head) { return head; }';
      const reverse = `
function f(head) {
  let prev = null;
  let cur = head;
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return prev;
}
`;
      const env = dualEnv(identity, reverse, 'f');
      const without = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3]],
        undefined,
        env.opts({ structure: { args: ['list'], result: 'list' } }),
      );
      expect(without.pass).toBe(false);
      const withUnordered = await runJavascriptCaseComparison(
        env.invokeUser,
        env.invokeReference,
        [[1, 2, 3]],
        undefined,
        env.opts({ structure: { args: ['list'], result: 'list' }, unordered: true }),
      );
      expect(withUnordered.pass).toBe(true);
      expect(withUnordered.userValue).toEqual([1, 2, 3]);
    });
  });
});
