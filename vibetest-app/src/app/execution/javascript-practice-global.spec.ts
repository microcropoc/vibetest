import { describe, expect, it } from 'vitest';

import { compileJavascriptPracticeCallable } from './javascript-practice-compile';
import {
  clearSpyRegistry,
  createPracticeGlobalBag,
  readSpyInvocationCount,
} from './javascript-practice-global';

describe('createPracticeGlobalBag', () => {
  it('uses a null prototype for bag and spy registry', () => {
    const bag = createPracticeGlobalBag();
    expect(Object.getPrototypeOf(bag)).toBeNull();
    expect(Object.getPrototypeOf(bag['__vibetestSpies'] as object)).toBeNull();
  });
});

describe('readSpyInvocationCount', () => {
  it('returns count for a registered spy', () => {
    const callable = compileJavascriptPracticeCallable(
      'const log = registerSpy("log", () => {}); log(); log();',
      'function add() { return 1; }',
      { kind: 'function', name: 'add' },
    );
    expect(readSpyInvocationCount(callable.globalBag, 'log')).toBe(2);
  });

  it('ignores __vibetestGetCount on Object.prototype', () => {
    const bag = createPracticeGlobalBag();
    const registry = bag['__vibetestSpies'] as Record<string, unknown>;
    registry['fakeSpy'] = function fakeSpy() {};

    const proto = Object.prototype as Record<string, unknown>;
    const previous = proto['__vibetestGetCount'];
    proto['__vibetestGetCount'] = () => 999;
    try {
      expect(readSpyInvocationCount(bag, 'fakeSpy')).toBeUndefined();
    } finally {
      if (previous === undefined) {
        delete proto['__vibetestGetCount'];
      } else {
        proto['__vibetestGetCount'] = previous;
      }
    }
  });

  it('clears registry on clearSpyRegistry', () => {
    const callable = compileJavascriptPracticeCallable(
      'const fn = registerSpy("fn", () => 1); fn();',
      'function add() { return 1; }',
      { kind: 'function', name: 'add' },
    );
    expect(readSpyInvocationCount(callable.globalBag, 'fn')).toBe(1);
    clearSpyRegistry(callable.globalBag);
    expect(readSpyInvocationCount(callable.globalBag, 'fn')).toBeUndefined();
  });
});
