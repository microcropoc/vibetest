import { readSpyInvocationCount, type PracticeGlobalBag } from '../../../execution/javascript-practice-global';

export type SpyInvocationCompareResult =
  | { readonly pass: true }
  | { readonly pass: false; readonly message: string };

export function compareSpyInvocations(
  userBag: PracticeGlobalBag,
  referenceBag: PracticeGlobalBag,
  expectInvocations: Readonly<Record<string, number>>,
): SpyInvocationCompareResult {
  for (const [spyName, expected] of Object.entries(expectInvocations)) {
    const userCount = readSpyInvocationCount(userBag, spyName);
    const referenceCount = readSpyInvocationCount(referenceBag, spyName);
    if (userCount === undefined || referenceCount === undefined) {
      return { pass: false, message: `Spy "${spyName}" is not registered` };
    }
    if (userCount !== referenceCount) {
      return {
        pass: false,
        message: `Spy "${spyName}" invocation count mismatch (user ${userCount}, reference ${referenceCount})`,
      };
    }
    if (userCount !== expected) {
      return {
        pass: false,
        message: `Spy "${spyName}" expected ${expected} invocations, got ${userCount}`,
      };
    }
  }
  return { pass: true };
}
