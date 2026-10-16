import {
  buildRegexCaseDiff,
  evaluateRegexMode,
  regexSerializedResultsEqual,
} from './regex-result';
import { compileRegexAnswer, compileRegexPattern } from './regex-pattern';

describe('regex-result', () => {
  it('evaluates fullMatch only when entire input matches', () => {
    const re = compileRegexPattern('^\\d+$');
    expect(evaluateRegexMode(re, '123', 'fullMatch', '').kind).toBe('fullMatch');
    expect(evaluateRegexMode(re, '123', 'fullMatch', '')).toEqual({
      kind: 'fullMatch',
      value: true,
    });
    expect(evaluateRegexMode(re, '12a', 'fullMatch', '')).toEqual({
      kind: 'fullMatch',
      value: false,
    });
  });

  it('compares matchAll as multiset when unordered', () => {
    const left = {
      kind: 'matchAll' as const,
      matches: [
        { match: 'b', index: 1, groups: [] },
        { match: 'a', index: 0, groups: [] },
      ],
      totalCount: 2,
    };
    const right = {
      kind: 'matchAll' as const,
      matches: [
        { match: 'a', index: 0, groups: [] },
        { match: 'b', index: 2, groups: [] },
      ],
      totalCount: 2,
    };
    expect(regexSerializedResultsEqual(left, right, 'matchAll', true)).toBe(true);
    expect(regexSerializedResultsEqual(left, right, 'matchAll', false)).toBe(false);
  });

  it('treats namedGroups as equal when keys differ only in insertion order', () => {
    const base = { match: '2026-10', index: 0, groups: ['2026', '10'] as const };
    const left = {
      kind: 'match' as const,
      match: {
        ...base,
        namedGroups: { a: '2026', b: '10' },
      },
    };
    const right = {
      kind: 'match' as const,
      match: {
        ...base,
        namedGroups: { b: '10', a: '2026' },
      },
    };
    expect(regexSerializedResultsEqual(left, right, 'match', false)).toBe(true);
  });

  it('rejects match when positional capture groups are swapped', () => {
    const input = '2026-10';
    const expectedRe = compileRegexAnswer('(\\d{4})-(\\d{2})', 'pattern', undefined, 'match');
    const userRe = compileRegexAnswer('(?=.*-(\\d{2}))(\\d{4})-\\d{2}', 'pattern', undefined, 'match');
    const expected = evaluateRegexMode(expectedRe, input, 'match', '');
    const user = evaluateRegexMode(userRe, input, 'match', '');
    expect(regexSerializedResultsEqual(user, expected, 'match', false)).toBe(false);
  });

  it('rejects matchAll when positional capture groups are swapped within a match', () => {
    const input = '2026-10';
    const expectedRe = compileRegexAnswer('(\\d{4})-(\\d{2})', 'pattern', undefined, 'matchAll');
    const userRe = compileRegexAnswer('(?=.*-(\\d{2}))(\\d{4})-\\d{2}', 'pattern', undefined, 'matchAll');
    const expected = evaluateRegexMode(expectedRe, input, 'matchAll', '');
    const user = evaluateRegexMode(userRe, input, 'matchAll', '');
    expect(regexSerializedResultsEqual(user, expected, 'matchAll', false)).toBe(false);
  });

  it('builds a capped diff on mismatch', () => {
    const diff = buildRegexCaseDiff(
      'replace',
      'hello world',
      { kind: 'replace', output: '[hello] [world]', truncated: false },
      { kind: 'replace', output: '[hello] world', truncated: false },
    );
    expect(diff.user.kind).toBe('replace');
    expect(diff.expected.kind).toBe('replace');
  });
});
