import type { RegexAnswerFormat, RegexPracticeMode } from './regex-result';

const VALID_FLAG_CHARS = new Set(['g', 'i', 'm', 's', 'u', 'v', 'y', 'd']);

export interface ParsedRegexLiteral {
  readonly pattern: string;
  readonly flags: string;
}

export function parseRegexLiteral(source: string): ParsedRegexLiteral {
  const trimmed = source.trim();
  if (!trimmed.startsWith('/')) {
    throw new SyntaxError('Regex literal must start with /');
  }
  let bracketDepth = 0;
  let i = 1;
  while (i < trimmed.length) {
    const char = trimmed[i];
    if (char === '\\') {
      i += 2;
      continue;
    }
    if (char === '[') {
      bracketDepth += 1;
      i += 1;
      continue;
    }
    if (char === ']' && bracketDepth > 0) {
      bracketDepth -= 1;
      i += 1;
      continue;
    }
    if (char === '/' && bracketDepth === 0) {
      const pattern = trimmed.slice(1, i);
      const flags = trimmed.slice(i + 1);
      validateFlagString(flags);
      return { pattern, flags };
    }
    i += 1;
  }
  throw new SyntaxError('Unterminated regex literal');
}

function validateFlagString(flags: string): void {
  const seen = new Set<string>();
  for (const char of flags) {
    if (!VALID_FLAG_CHARS.has(char)) {
      throw new SyntaxError(`Invalid RegExp flag: ${char}`);
    }
    if (seen.has(char)) {
      throw new SyntaxError(`Duplicate RegExp flag: ${char}`);
    }
    seen.add(char);
  }
  if (seen.has('u') && seen.has('v')) {
    throw new SyntaxError('RegExp flags u and v cannot be used together');
  }
}

export function effectiveFlagsForMode(flags: string, mode: RegexPracticeMode): string {
  if (mode !== 'matchAll' || flags.includes('g')) {
    return flags;
  }
  return `${flags}g`;
}

export function compileRegexPattern(source: string, flags = ''): RegExp {
  validateFlagString(flags);
  return new RegExp(source, flags);
}

export function regexTestMatch(userResult: boolean, referenceResult: boolean): boolean {
  return userResult === referenceResult;
}

export function compileRegexAnswer(
  answer: string,
  answerFormat: RegexAnswerFormat,
  stepFlags: string | undefined,
  mode: RegexPracticeMode,
): RegExp {
  if (answerFormat === 'literal') {
    const parsed = parseRegexLiteral(answer);
    const flags = effectiveFlagsForMode(parsed.flags, mode);
    return compileRegexPattern(parsed.pattern, flags);
  }
  const flags = effectiveFlagsForMode(stepFlags ?? '', mode);
  return compileRegexPattern(answer, flags);
}
