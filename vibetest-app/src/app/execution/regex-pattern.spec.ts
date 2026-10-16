import { compileRegexAnswer, compileRegexPattern, parseRegexLiteral, regexTestMatch } from './regex-pattern';

describe('regex pattern helpers', () => {
  it('compiles valid patterns', () => {
    expect(compileRegexPattern('^\\d+$').test('123')).toBe(true);
  });

  it('throws on invalid patterns', () => {
    expect(() => compileRegexPattern('(')).toThrow(SyntaxError);
  });

  it('parses literals with slash inside a character class', () => {
    expect(parseRegexLiteral('/[a/b]/i')).toEqual({ pattern: '[a/b]', flags: 'i' });
    expect(parseRegexLiteral('/https?:[/][/]/')).toEqual({ pattern: 'https?:[/][/]', flags: '' });
    const nested = parseRegexLiteral('/[[a-z]--[/]]/v');
    expect(nested).toEqual({ pattern: '[[a-z]--[/]]', flags: 'v' });
  });

  it('matches when user and reference booleans agree', () => {
    expect(regexTestMatch(true, true)).toBe(true);
    expect(regexTestMatch(false, false)).toBe(true);
    expect(regexTestMatch(true, false)).toBe(false);
  });
});
