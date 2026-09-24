import { applyJavascriptCalls, type JavascriptCallStep } from './apply-javascript-calls';
import { isJsonCompatibleValue, jsonCompatibleEqual } from './json-value-equal';

export type JavascriptCaseRunResult = {
  readonly pass: boolean;
  readonly userValue?: unknown;
  readonly referenceValue?: unknown;
  readonly message?: string;
};

export function runJavascriptCaseComparison(
  invokeUser: (args: readonly unknown[]) => unknown,
  invokeReference: (args: readonly unknown[]) => unknown,
  args: readonly unknown[],
  calls: readonly JavascriptCallStep[] | undefined,
): JavascriptCaseRunResult {
  const userValue = applyJavascriptCalls(invokeUser(args), calls);
  const referenceValue = applyJavascriptCalls(invokeReference(args), calls);

  if (!isJsonCompatibleValue(userValue) || !isJsonCompatibleValue(referenceValue)) {
    return { pass: false, message: 'non-JSON result' };
  }

  const pass = jsonCompatibleEqual(userValue, referenceValue);
  return {
    pass,
    userValue,
    referenceValue,
    message: pass ? undefined : 'Return values do not match',
  };
}
