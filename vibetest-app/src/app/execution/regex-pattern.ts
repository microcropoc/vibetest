export function compileRegexPattern(source: string): RegExp {
  return new RegExp(source);
}

export function regexTestMatch(userResult: boolean, referenceResult: boolean): boolean {
  return userResult === referenceResult;
}
