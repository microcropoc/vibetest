import { compileRegexPattern, regexTestMatch } from './regex-pattern';

describe('regex practice semantics', () => {
  it('passes when user and reference agree on match vs non-match', () => {
    const user = compileRegexPattern('^\\d+$');
    const reference = compileRegexPattern('^\\d+$');
    expect(regexTestMatch(user.test('123'), reference.test('123'))).toBe(true);
    expect(regexTestMatch(user.test('abc'), reference.test('abc'))).toBe(true);
  });

  it('fails when booleans differ for same input', () => {
    const user = compileRegexPattern('^\\d+$');
    const reference = compileRegexPattern('^\\d+$');
    expect(regexTestMatch(user.test('12a'), reference.test('123'))).toBe(false);
  });
});
