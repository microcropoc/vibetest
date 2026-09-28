import { describe, expect, it } from 'vitest';

import {
  decodeSpecialValues,
  encodeSpecialValues,
  findSpecialValueIssues,
  JavascriptSpecialValueError,
} from './javascript-special-values';

describe('decodeSpecialValues', () => {
  it('decodes scalar tags', () => {
    expect(decodeSpecialValues({ $js: 'undefined' })).toBe(undefined);
    expect(Number.isNaN(decodeSpecialValues({ $js: 'NaN' }) as number)).toBe(true);
    expect(decodeSpecialValues({ $js: 'Infinity' })).toBe(Infinity);
    expect(decodeSpecialValues({ $js: '-Infinity' })).toBe(-Infinity);
    expect(Object.is(decodeSpecialValues({ $js: '-0' }) as number, -0)).toBe(true);
  });

  it('decodes bigint tag', () => {
    expect(decodeSpecialValues({ $js: 'bigint', value: '-42' })).toBe(-42n);
  });

  it('decodes nested tags in arrays and objects', () => {
    const decoded = decodeSpecialValues({
      a: [{ $js: 'undefined' }, 1],
      b: { $js: 'NaN' },
    });
    expect(decoded).toEqual({
      a: [undefined, 1],
      b: NaN,
    });
  });

  it('throws on invalid tag', () => {
    expect(() => decodeSpecialValues({ $js: 'unknown' })).toThrow(JavascriptSpecialValueError);
    expect(() => decodeSpecialValues({ $js: 'undefined', extra: 1 })).toThrow(
      JavascriptSpecialValueError,
    );
  });
});

describe('encodeSpecialValues', () => {
  it('round-trips scalar and bigint values', () => {
    const values: unknown[] = [undefined, NaN, Infinity, -Infinity, -0, 42n];
    for (const v of values) {
      expect(decodeSpecialValues(encodeSpecialValues(v))).toEqual(v);
    }
  });

  it('encodes explicit undefined array elements as tags', () => {
    expect(encodeSpecialValues([undefined, 1])).toEqual([{ $js: 'undefined' }, 1]);
  });

  it('encodes sparse array holes as undefined tags', () => {
    const sparse: unknown[] = [];
    sparse[1] = 1;
    expect(encodeSpecialValues(sparse)).toEqual([{ $js: 'undefined' }, 1]);
  });

  it('encodes undefined object values as tags (distinct from missing keys)', () => {
    expect(encodeSpecialValues({ a: undefined })).toEqual({ a: { $js: 'undefined' } });
    expect(encodeSpecialValues({})).toEqual({});
  });
});

describe('findSpecialValueIssues', () => {
  it('returns no issues for valid tags', () => {
    expect(
      findSpecialValueIssues([{ $js: 'undefined' }, { $js: 'bigint', value: '0' }]),
    ).toEqual([]);
  });

  it('reports path for invalid bigint tag', () => {
    const issues = findSpecialValueIssues([{ $js: 'bigint', value: '12.3' }]);
    expect(issues).toHaveLength(1);
    expect(issues[0]?.path).toEqual([0]);
  });

  it('reports nested path', () => {
    const issues = findSpecialValueIssues({ calls: [{ $js: 'bad' }] });
    expect(issues[0]?.path).toEqual(['calls', 0]);
  });
});
