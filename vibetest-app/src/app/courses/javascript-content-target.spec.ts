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
});
