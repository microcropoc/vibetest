import { describe, expect, it } from 'vitest';

import { assertPracticeIdentifier } from './javascript-practice-identifier';
import { compileJavascriptPracticeCallable } from './javascript-practice-compile';

describe('assertPracticeIdentifier', () => {
  it('accepts valid identifiers', () => {
    expect(() => assertPracticeIdentifier('add', 'functionName')).not.toThrow();
    expect(() => assertPracticeIdentifier('_$x1', 'className')).not.toThrow();
  });

  it('rejects invalid syntax and reserved words', () => {
    expect(() => assertPracticeIdentifier('a-b', 'functionName')).toThrow(/Invalid functionName/);
    expect(() => assertPracticeIdentifier('class', 'className')).toThrow(/reserved word/);
    expect(() => assertPracticeIdentifier('static', 'functionName')).toThrow(/reserved word/);
    expect(() => assertPracticeIdentifier('eval', 'className')).toThrow(/reserved word/);
  });
});

describe('compileJavascriptPracticeCallable identifier gate', () => {
  it('throws before compiling when functionName is invalid', () => {
    expect(() =>
      compileJavascriptPracticeCallable('', 'function x() {}', {
        kind: 'function',
        name: 'not valid',
      }),
    ).toThrow(/Invalid functionName/);
  });

  it('throws before compiling when className is invalid', () => {
    expect(() =>
      compileJavascriptPracticeCallable('', 'class Foo {}', {
        kind: 'construct',
        className: 'static',
      }),
    ).toThrow(/Invalid className/);
  });
});
