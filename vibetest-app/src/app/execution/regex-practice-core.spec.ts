import {
  openRegexPracticeSession,
  RegexPatternCompileError,
  runRegexPracticeCase,
} from './regex-practice-core';

describe('regex practice core', () => {
  it('opens a session with compiled patterns', () => {
    const session = openRegexPracticeSession({
      userPattern: '^\\d+$',
      referencePattern: '^\\d+$',
    });
    expect(session.userRegExp.test('123')).toBe(true);
    expect(session.referenceRegExp.test('abc')).toBe(false);
  });

  it('throws RegexPatternCompileError for invalid user pattern', () => {
    expect(() =>
      openRegexPracticeSession({ userPattern: '(', referencePattern: 'x' }),
    ).toThrow(RegexPatternCompileError);
    expect(() =>
      openRegexPracticeSession({ userPattern: '(', referencePattern: 'x' }),
    ).toThrow('Invalid regular expression');
  });

  it('passes when user and reference agree on match vs non-match', () => {
    const session = openRegexPracticeSession({
      userPattern: '^\\d+$',
      referencePattern: '^\\d+$',
    });
    expect(runRegexPracticeCase(session, { input: '123' }).pass).toBe(true);
    expect(runRegexPracticeCase(session, { input: 'abc' }).pass).toBe(true);
  });

  it('fails when booleans differ for the same input', () => {
    const session = openRegexPracticeSession({
      userPattern: '^\\d+$',
      referencePattern: '^x$',
    });
    const outcome = runRegexPracticeCase(session, { input: '123' });
    expect(outcome.pass).toBe(false);
    expect(outcome.message).toBe('RegExp.test results do not match');
  });
});
