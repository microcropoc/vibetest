import { describe, expect, it } from 'vitest';

import { isJsonCompatibleValue, jsonCompatibleEqual } from './json-value-equal';

describe('jsonCompatibleEqual', () => {
  it('compares NaN and signed zero with Object.is semantics', () => {
    expect(jsonCompatibleEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(jsonCompatibleEqual(Number.NaN, null)).toBe(false);
    expect(jsonCompatibleEqual(+0, -0)).toBe(false);
    expect(jsonCompatibleEqual(+0, +0)).toBe(true);
  });

  it('compares plain objects regardless of key order', () => {
    expect(jsonCompatibleEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
  });

  it('distinguishes arrays from objects with numeric keys', () => {
    expect(jsonCompatibleEqual([1, 2], { 0: 1, 1: 2 })).toBe(false);
  });

  it('returns false for cyclic structures without throwing', () => {
    const a: Record<string, unknown> = { x: 1 };
    a['self'] = a;
    const b: Record<string, unknown> = { x: 1 };
    b['self'] = b;
    expect(() => jsonCompatibleEqual(a, b)).not.toThrow();
    expect(jsonCompatibleEqual(a, b)).toBe(false);
  });

  it('compares nested arrays and objects', () => {
    expect(jsonCompatibleEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
    expect(jsonCompatibleEqual({ a: [1, { b: 2 }] }, { a: [1, { b: 3 }] })).toBe(false);
  });

  it('rejects undefined and other non-JSON values in comparison', () => {
    expect(jsonCompatibleEqual(undefined, undefined)).toBe(false);
    expect(isJsonCompatibleValue(undefined)).toBe(false);
    expect(jsonCompatibleEqual({ a: undefined }, { a: undefined })).toBe(false);
    expect(isJsonCompatibleValue(() => 1)).toBe(false);
    expect(isJsonCompatibleValue(Symbol('x'))).toBe(false);
    expect(isJsonCompatibleValue(1n)).toBe(false);
  });

  it('allows Infinity as JSON-compatible number', () => {
    expect(isJsonCompatibleValue(Number.POSITIVE_INFINITY)).toBe(true);
    expect(jsonCompatibleEqual(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY)).toBe(true);
  });
});
