import { compareSqliteResultRows } from './sqlite-result-rows';

describe('compareSqliteResultRows', () => {
  it('requires exact order when orderMatters is true', () => {
    expect(compareSqliteResultRows(['[1]', '[2]'], ['[1]', '[2]'], true)).toBe(true);
    expect(compareSqliteResultRows(['[2]', '[1]'], ['[1]', '[2]'], true)).toBe(false);
  });

  it('compares multiset when orderMatters is false', () => {
    expect(compareSqliteResultRows(['[2]', '[1]'], ['[1]', '[2]'], false)).toBe(true);
    expect(compareSqliteResultRows(['[1]', '[1]'], ['[1]', '[2]'], false)).toBe(false);
  });
});
