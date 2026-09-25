import { describe, expect, it } from 'vitest';

import { JavascriptContentWithTargetSchema } from './javascript-content-target';

const base = {
  description: 'd',
  starterCode: '',
  referenceSolution: 'class A {}',
  setup: '',
  timeoutMs: 1000,
  tests: [{ args: [] }],
};

describe('JavascriptContentWithTargetSchema', () => {
  it('accepts functionName only', () => {
    expect(
      JavascriptContentWithTargetSchema.safeParse({ ...base, functionName: 'fn' }).success,
    ).toBe(true);
  });

  it('accepts construct only', () => {
    expect(
      JavascriptContentWithTargetSchema.safeParse({
        ...base,
        construct: { className: 'LRUCache' },
      }).success,
    ).toBe(true);
  });

  it('rejects both functionName and construct', () => {
    const result = JavascriptContentWithTargetSchema.safeParse({
      ...base,
      functionName: 'fn',
      construct: { className: 'A' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects neither functionName nor construct', () => {
    const result = JavascriptContentWithTargetSchema.safeParse(base);
    expect(result.success).toBe(false);
  });

  it('accepts non-empty checker', () => {
    expect(
      JavascriptContentWithTargetSchema.safeParse({
        ...base,
        functionName: 'fn',
        checker: '(ctx) => true',
      }).success,
    ).toBe(true);
  });

  it('rejects empty checker string', () => {
    const result = JavascriptContentWithTargetSchema.safeParse({
      ...base,
      functionName: 'fn',
      checker: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects reserved functionName', () => {
    const result = JavascriptContentWithTargetSchema.safeParse({
      ...base,
      functionName: 'class',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid className on construct', () => {
    const result = JavascriptContentWithTargetSchema.safeParse({
      ...base,
      construct: { className: 'static' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid method in calls', () => {
    const result = JavascriptContentWithTargetSchema.safeParse({
      ...base,
      functionName: 'fn',
      tests: [{ args: [], calls: [{ args: [], method: 'bad-name' }] }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts reserved-word method names used via Reflect.get', () => {
    expect(
      JavascriptContentWithTargetSchema.safeParse({
        ...base,
        functionName: 'fn',
        tests: [{ args: [], calls: [{ args: [], method: 'delete' }] }],
      }).success,
    ).toBe(true);
  });

  it('accepts LRUCache construct', () => {
    expect(
      JavascriptContentWithTargetSchema.safeParse({
        ...base,
        construct: { className: 'LRUCache' },
      }).success,
    ).toBe(true);
  });
});
