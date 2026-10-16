export type RegexPracticeMode = 'test' | 'fullMatch' | 'match' | 'matchAll' | 'replace' | 'split';

export type RegexAnswerFormat = 'pattern' | 'literal';

export interface RegexMatchItem {
  readonly match: string;
  readonly index: number;
  readonly groups: readonly (string | null)[];
  readonly namedGroups?: Readonly<Record<string, string | null>>;
}

export type RegexSerializedResult =
  | { readonly kind: 'test' | 'fullMatch'; readonly value: boolean }
  | { readonly kind: 'match'; readonly match: RegexMatchItem | null }
  | { readonly kind: 'matchAll'; readonly matches: readonly RegexMatchItem[]; readonly totalCount: number }
  | { readonly kind: 'replace'; readonly output: string; readonly truncated: boolean }
  | { readonly kind: 'split'; readonly items: readonly string[]; readonly totalCount: number };

export interface RegexCaseDiff {
  readonly mode: RegexPracticeMode;
  readonly inputPreview: string;
  readonly inputTruncated: boolean;
  readonly user: RegexSerializedResult;
  readonly expected: RegexSerializedResult;
}

export const REGEX_DIFF_INPUT_MAX_CHARS = 500;
export const REGEX_DIFF_MAX_ITEMS = 25;
export const REGEX_DIFF_OUTPUT_MAX_CHARS = 500;

const MODE_MISMATCH_MESSAGES: Record<RegexPracticeMode, string> = {
  test: 'RegExp.test results do not match',
  fullMatch: 'Full match results do not match',
  match: 'Match results do not match',
  matchAll: 'MatchAll results do not match',
  replace: 'Replace results do not match',
  split: 'Split results do not match',
};

export function regexModeMismatchMessage(mode: RegexPracticeMode): string {
  return MODE_MISMATCH_MESSAGES[mode];
}

function namedGroupsFromExec(groups: RegExpExecArray['groups']): Record<string, string | null> | undefined {
  if (groups === undefined || groups === null) {
    return undefined;
  }
  const keys = Object.keys(groups).sort();
  if (keys.length === 0) {
    return undefined;
  }
  const result: Record<string, string | null> = {};
  for (const key of keys) {
    result[key] = groups[key] ?? null;
  }
  return result;
}

function matchItemFromExec(m: RegExpExecArray): RegexMatchItem {
  const namedGroups = namedGroupsFromExec(m.groups);
  const item: RegexMatchItem = {
    match: m[0],
    index: m.index,
    groups: m.slice(1).map((g) => g ?? null),
  };
  return namedGroups === undefined ? item : { ...item, namedGroups };
}

function resetLastIndex(re: RegExp): void {
  re.lastIndex = 0;
}

export function evaluateRegexMode(
  re: RegExp,
  input: string,
  mode: RegexPracticeMode,
  replacement: string,
): RegexSerializedResult {
  resetLastIndex(re);
  switch (mode) {
    case 'test':
      return { kind: 'test', value: re.test(input) };
    case 'fullMatch': {
      const m = re.exec(input);
      const value =
        m !== null && m.index === 0 && m[0].length === input.length;
      return { kind: 'fullMatch', value };
    }
    case 'match': {
      const m = re.exec(input);
      return { kind: 'match', match: m === null ? null : matchItemFromExec(m) };
    }
    case 'matchAll': {
      resetLastIndex(re);
      const all = Array.from(input.matchAll(re)).map((m) => matchItemFromExec(m));
      return { kind: 'matchAll', matches: all, totalCount: all.length };
    }
    case 'replace': {
      resetLastIndex(re);
      const output = input.replace(re, replacement);
      return {
        kind: 'replace',
        output,
        truncated: output.length > REGEX_DIFF_OUTPUT_MAX_CHARS,
      };
    }
    case 'split': {
      resetLastIndex(re);
      const items = input.split(re);
      return { kind: 'split', items, totalCount: items.length };
    }
  }
}

function matchItemMultisetKey(item: RegexMatchItem): string {
  const { match, groups, namedGroups } = item;
  return JSON.stringify({
    match,
    groups,
    namedGroups: namedGroups === undefined ? null : JSON.parse(canonicalNamedGroupsJson(namedGroups)),
  });
}

function sortedMultisetKeys(items: readonly RegexMatchItem[]): string[] {
  return items.map(matchItemMultisetKey).sort();
}

function booleanResultsEqual(
  a: RegexSerializedResult,
  b: RegexSerializedResult,
): boolean {
  if (a.kind !== b.kind || (a.kind !== 'test' && a.kind !== 'fullMatch')) {
    return false;
  }
  return a.value === (b as typeof a).value;
}

function canonicalNamedGroupsJson(
  groups: Readonly<Record<string, string | null>> | undefined,
): string {
  if (groups === undefined) {
    return 'null';
  }
  const sorted: Record<string, string | null> = {};
  for (const key of Object.keys(groups).sort()) {
    sorted[key] = groups[key];
  }
  return JSON.stringify(sorted);
}

function matchResultsEqual(
  a: RegexSerializedResult,
  b: RegexSerializedResult,
): boolean {
  if (a.kind !== 'match' || b.kind !== 'match') {
    return false;
  }
  const left = a.match;
  const right = b.match;
  if (left === null || right === null) {
    return left === right;
  }
  return (
    left.match === right.match &&
    left.index === right.index &&
    left.groups.length === right.groups.length &&
    left.groups.every((g, i) => g === right.groups[i]) &&
    canonicalNamedGroupsJson(left.namedGroups) === canonicalNamedGroupsJson(right.namedGroups)
  );
}

function matchAllResultsEqual(
  a: RegexSerializedResult,
  b: RegexSerializedResult,
  unordered: boolean,
): boolean {
  if (a.kind !== 'matchAll' || b.kind !== 'matchAll') {
    return false;
  }
  if (a.totalCount !== b.totalCount) {
    return false;
  }
  if (unordered) {
    const left = sortedMultisetKeys(a.matches);
    const right = sortedMultisetKeys(b.matches);
    return left.length === right.length && left.every((key, i) => key === right[i]);
  }
  if (a.matches.length !== b.matches.length) {
    return false;
  }
  for (let i = 0; i < a.matches.length; i += 1) {
    if (
      !matchResultsEqual(
        { kind: 'match', match: a.matches[i] },
        { kind: 'match', match: b.matches[i] },
      )
    ) {
      return false;
    }
  }
  return true;
}

function replaceResultsEqual(a: RegexSerializedResult, b: RegexSerializedResult): boolean {
  if (a.kind !== 'replace' || b.kind !== 'replace') {
    return false;
  }
  return a.output === b.output;
}

function splitResultsEqual(a: RegexSerializedResult, b: RegexSerializedResult): boolean {
  if (a.kind !== 'split' || b.kind !== 'split') {
    return false;
  }
  if (a.totalCount !== b.totalCount) {
    return false;
  }
  return a.items.length === b.items.length && a.items.every((item, i) => item === b.items[i]);
}

export function regexSerializedResultsEqual(
  user: RegexSerializedResult,
  expected: RegexSerializedResult,
  mode: RegexPracticeMode,
  unordered: boolean,
): boolean {
  if (user.kind !== expected.kind) {
    return false;
  }
  switch (mode) {
    case 'test':
    case 'fullMatch':
      return booleanResultsEqual(user, expected);
    case 'match':
      return matchResultsEqual(user, expected);
    case 'matchAll':
      return matchAllResultsEqual(user, expected, unordered);
    case 'replace':
      return replaceResultsEqual(user, expected);
    case 'split':
      return splitResultsEqual(user, expected);
  }
}

function truncateString(text: string, max: number): { readonly text: string; readonly truncated: boolean } {
  if (text.length <= max) {
    return { text, truncated: false };
  }
  return { text: text.slice(0, max), truncated: true };
}

function previewMatchItem(item: RegexMatchItem): RegexMatchItem {
  const matchPreview = truncateString(item.match, REGEX_DIFF_OUTPUT_MAX_CHARS);
  return {
    ...item,
    match: matchPreview.text,
  };
}

export function previewRegexSerializedResult(result: RegexSerializedResult): RegexSerializedResult {
  switch (result.kind) {
    case 'test':
    case 'fullMatch':
      return result;
    case 'match':
      return {
        kind: 'match',
        match: result.match === null ? null : previewMatchItem(result.match),
      };
    case 'matchAll':
      return {
        kind: 'matchAll',
        matches: result.matches.slice(0, REGEX_DIFF_MAX_ITEMS).map(previewMatchItem),
        totalCount: result.totalCount,
      };
    case 'replace': {
      const preview = truncateString(result.output, REGEX_DIFF_OUTPUT_MAX_CHARS);
      return {
        kind: 'replace',
        output: preview.text,
        truncated: result.truncated || preview.truncated,
      };
    }
    case 'split':
      return {
        kind: 'split',
        items: result.items.slice(0, REGEX_DIFF_MAX_ITEMS).map((item) =>
          truncateString(item, REGEX_DIFF_OUTPUT_MAX_CHARS).text,
        ),
        totalCount: result.totalCount,
      };
  }
}

export function previewRegexInput(input: string): { readonly inputPreview: string; readonly inputTruncated: boolean } {
  const preview = truncateString(input, REGEX_DIFF_INPUT_MAX_CHARS);
  return { inputPreview: preview.text, inputTruncated: preview.truncated };
}

export function buildRegexCaseDiff(
  mode: RegexPracticeMode,
  input: string,
  user: RegexSerializedResult,
  expected: RegexSerializedResult,
): RegexCaseDiff {
  const { inputPreview, inputTruncated } = previewRegexInput(input);
  return {
    mode,
    inputPreview,
    inputTruncated,
    user: previewRegexSerializedResult(user),
    expected: previewRegexSerializedResult(expected),
  };
}

/** Match spans within inputPreview for highlighting (indices in preview coordinates). */
export function highlightSpansForDiff(
  diff: RegexCaseDiff,
  side: 'user' | 'expected',
): readonly { readonly start: number; readonly end: number }[] {
  const result = side === 'user' ? diff.user : diff.expected;
  const previewLen = diff.inputPreview.length;
  const spans: { start: number; end: number }[] = [];

  const addSpan = (index: number, length: number): void => {
    if (length <= 0 || index < 0 || index >= previewLen) {
      return;
    }
    const end = Math.min(previewLen, index + length);
    spans.push({ start: index, end });
  };

  if (result.kind === 'match' && result.match !== null) {
    addSpan(result.match.index, result.match.match.length);
  }
  if (result.kind === 'matchAll') {
    for (const item of result.matches) {
      addSpan(item.index, item.match.length);
    }
  }
  return spans;
}
