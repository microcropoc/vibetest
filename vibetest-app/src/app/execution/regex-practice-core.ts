import { compileRegexPattern, regexTestMatch } from './regex-pattern';

export interface RegexPracticeSessionConfig {
  readonly userPattern: string;
  readonly referencePattern: string;
}

export interface RegexPracticeSession {
  readonly userPattern: RegExp;
  readonly referencePattern: RegExp;
}

export interface RegexPracticeCaseInput {
  readonly input: string;
}

export interface RegexPracticeCaseOutcome {
  readonly pass: boolean;
  readonly userResult?: boolean;
  readonly referenceResult?: boolean;
  readonly message?: string;
  readonly userMs: number;
  readonly referenceMs: number;
}

export class RegexPatternCompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegexPatternCompileError';
  }
}

function compilePattern(source: string): RegExp {
  try {
    return compileRegexPattern(source);
  } catch (error: unknown) {
    const message =
      error instanceof SyntaxError
        ? 'Invalid regular expression'
        : error instanceof Error
          ? error.message
          : 'Invalid regular expression';
    throw new RegexPatternCompileError(message);
  }
}

export function openRegexPracticeSession(config: RegexPracticeSessionConfig): RegexPracticeSession {
  return {
    userPattern: compilePattern(config.userPattern),
    referencePattern: compilePattern(config.referencePattern),
  };
}

export function runRegexPracticeCase(
  session: RegexPracticeSession,
  input: RegexPracticeCaseInput,
): RegexPracticeCaseOutcome {
  try {
    const userStart = performance.now();
    const userResult = session.userPattern.test(input.input);
    const userMs = performance.now() - userStart;
    const referenceStart = performance.now();
    const referenceResult = session.referencePattern.test(input.input);
    const referenceMs = performance.now() - referenceStart;
    const pass = regexTestMatch(userResult, referenceResult);
    return {
      pass,
      userResult,
      referenceResult,
      message: pass ? undefined : 'RegExp.test results do not match',
      userMs,
      referenceMs,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Regex error';
    return { pass: false, message, userMs: 0, referenceMs: 0 };
  }
}
