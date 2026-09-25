import { describe, expect, it } from 'vitest';

import {
  listFrom,
  prepareArgs,
  serializeList,
  serializeResult,
  serializeTree,
  StructureCodecError,
  treeFrom,
} from './structure-codec';

describe('structure-codec list', () => {
  it('roundtrips number[]', () => {
    const head = listFrom([1, 2, 3]);
    expect(serializeList(head)).toEqual([1, 2, 3]);
  });

  it('empty array becomes null and serializes to []', () => {
    expect(listFrom([])).toBeNull();
    expect(serializeList(null)).toEqual([]);
  });

  it('throws on cycle', () => {
    const a = listFrom([1, 2]);
    if (a === null || a.next === null) {
      throw new Error('expected list');
    }
    a.next.next = a;
    expect(() => serializeList(a)).toThrow(StructureCodecError);
    expect(() => serializeList(a)).toThrow(/cycle/);
  });
});

describe('structure-codec tree', () => {
  it('roundtrips level-order', () => {
    const root = treeFrom([4, 2, 7, 1, 3, 6, 9]);
    expect(serializeTree(root)).toEqual([4, 2, 7, 1, 3, 6, 9]);
  });

  it('empty / null root', () => {
    expect(treeFrom([])).toBeNull();
    expect(treeFrom([null])).toBeNull();
    expect(serializeTree(null)).toEqual([]);
  });

  it('trims trailing nulls', () => {
    const root = treeFrom([1, null, 2]);
    expect(serializeTree(root)).toEqual([1, null, 2]);
  });
});

describe('structure-codec prepareArgs', () => {
  it('materializes list and clones raw', () => {
    const raw = [[1, 2], 0] as const;
    const a = prepareArgs(raw, ['list', 'raw']);
    const b = prepareArgs(raw, ['list', 'raw']);
    expect(serializeList(a[0])).toEqual([1, 2]);
    expect(a[0]).not.toBe(b[0]);
    expect(a[1]).toBe(0);
  });

  it('prepareArgs default raw without structure', () => {
    const args = prepareArgs([[1, 2]], undefined);
    expect(args[0]).toEqual([1, 2]);
  });

  it('serializeResult list', () => {
    expect(serializeResult(listFrom([3, 2, 1]), 'list')).toEqual([3, 2, 1]);
  });
});
