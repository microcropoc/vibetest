import { describe, expect, it } from 'vitest';

import { sortUnordered } from './sort-unordered';

describe('sortUnordered', () => {
  it('sorts top-level arrays by stable key', () => {
    expect(sortUnordered([[3], [1, 2]])).toEqual([[1, 2], [3]]);
  });

  it('sorts nested arrays inside elements', () => {
    expect(sortUnordered([[0, -1, 1], [-1, 0, 1]].map((t) => [...t]))).toEqual([
      [-1, 0, 1],
      [-1, 0, 1],
    ]);
    expect(sortUnordered([[0, -1, 1]])).toEqual([[-1, 0, 1]]);
  });

  it('normalizes plain object values and sorts keys', () => {
    expect(sortUnordered({ b: [2, 1], a: 1 })).toEqual({ a: 1, b: [1, 2] });
  });

  it('leaves primitives unchanged', () => {
    expect(sortUnordered(3)).toBe(3);
    expect(sortUnordered(null)).toBeNull();
  });
});
