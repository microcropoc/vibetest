import { compileRegexAnswer } from './regex-pattern';
import {
  buildRegexCaseDiff,
  evaluateRegexMode,
  regexModeMismatchMessage,
  regexSerializedResultsEqual,
  type RegexAnswerFormat,
  type RegexCaseDiff,
  type RegexPracticeMode,
  type RegexSerializedResult,
} from './regex-result';

export type {
  RegexAnswerFormat,
  RegexCaseDiff,
  RegexMatchItem,
  RegexPracticeMode,
  RegexSerializedResult,
} from './regex-result';

export {
  REGEX_DIFF_INPUT_MAX_CHARS,
  REGEX_DIFF_MAX_ITEMS,
  REGEX_DIFF_OUTPUT_MAX_CHARS,
  highlightSpansForDiff,
} from './regex-result';

export interface RegexPracticeSessionConfig {
  readonly userPattern: string;
  readonly referencePattern: string;
  readonly flags?: string;
  readonly answerFormat?: RegexAnswerFormat;
  readonly mode?: RegexPracticeMode;
  readonly replacement?: string;
  readonly unordered?: boolean;
}

export interface RegexPracticeSession {
  readonly userRegExp: RegExp;
  readonly referenceRegExp: RegExp;
  readonly mode: RegexPracticeMode;
  readonly replacement: string;
  readonly unordered: boolean;
}

export interface RegexPracticeCaseInput {
  readonly input: string;
}

export interface RegexPracticeCaseOutcome {
  readonly pass: boolean;
  readonly userResult?: boolean;
  readonly referenceResult?: boolean;
  readonly message?: string;
  readonly diff?: RegexCaseDiff;
  readonly userMs: number;
  readonly referenceMs: number;
}

export class RegexPatternCompileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RegexPatternCompileError';
  }
}

function compileSide(
  answer: string,
  config: RegexPracticeSessionConfig,
): RegExp {
  try {
    return compileRegexAnswer(
      answer,
      config.answerFormat ?? 'pattern',
      config.flags,
      config.mode ?? 'test',
    );
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
    userRegExp: compileSide(config.userPattern, config),
    referenceRegExp: compileSide(config.referencePattern, config),
    mode: config.mode ?? 'test',
    replacement: config.replacement ?? '',
    unordered: config.unordered ?? false,
  };
}

function evaluateSide(
  session: RegexPracticeSession,
  re: RegExp,
  input: string,
): RegexSerializedResult {
  return evaluateRegexMode(re, input, session.mode, session.replacement);
}

export function runRegexPracticeCase(
  session: RegexPracticeSession,
  input: RegexPracticeCaseInput,
): RegexPracticeCaseOutcome {
  try {
    const userStart = performance.now();
    const userValue = evaluateSide(session, session.userRegExp, input.input);
    const userMs = performance.now() - userStart;
    const referenceStart = performance.now();
    const referenceValue = evaluateSide(session, session.referenceRegExp, input.input);
    const referenceMs = performance.now() - referenceStart;
    const pass = regexSerializedResultsEqual(
      userValue,
      referenceValue,
      session.mode,
      session.unordered,
    );
    const outcome: RegexPracticeCaseOutcome = {
      pass,
      message: pass ? undefined : regexModeMismatchMessage(session.mode),
      diff: pass
        ? undefined
        : buildRegexCaseDiff(session.mode, input.input, userValue, referenceValue),
      userMs,
      referenceMs,
    };
    if (session.mode === 'test' && userValue.kind === 'test' && referenceValue.kind === 'test') {
      return {
        ...outcome,
        userResult: userValue.value,
        referenceResult: referenceValue.value,
      };
    }
    return outcome;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Regex error';
    return { pass: false, message, userMs: 0, referenceMs: 0 };
  }
}
