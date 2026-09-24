export type JavascriptCallStep = {
  readonly args: readonly unknown[];
  readonly method?: string;
};

export function applyJavascriptCalls(
  initial: unknown,
  calls: readonly JavascriptCallStep[] | undefined,
): unknown {
  let current = initial;
  if (calls === undefined || calls.length === 0) {
    return current;
  }
  for (const call of calls) {
    if (call.method !== undefined) {
      if (current === null || current === undefined) {
        throw new Error(`Method "${call.method}": value is null or undefined`);
      }
      const fn = Reflect.get(Object(current), call.method);
      if (typeof fn !== 'function') {
        throw new Error(`Method "${call.method}" is not a function`);
      }
      current = fn.apply(current, [...call.args]);
    } else if (typeof current === 'function') {
      current = current(...call.args);
    } else {
      throw new Error('Value is not callable');
    }
  }
  return current;
}
