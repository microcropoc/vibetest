import { compileRegexPattern, regexTestMatch } from './regex-pattern';

describe('regex pattern helpers', () => {
  it('compiles valid patterns', () => {
    expect(compileRegexPattern('^\\d+$').test('123')).toBe(true);
  });

  it('throws on invalid patterns', () => {
    expect(() => compileRegexPattern('(')).toThrow(SyntaxError);
  });

  it('matches when user and reference booleans agree', () => {
    expect(regexTestMatch(true, true)).toBe(true);
    expect(regexTestMatch(false, false)).toBe(true);
    expect(regexTestMatch(true, false)).toBe(false);
  });
});
