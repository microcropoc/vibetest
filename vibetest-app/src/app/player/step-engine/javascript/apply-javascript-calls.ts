export type JavascriptCallStep = {
  readonly args: readonly unknown[];
  readonly method?: string;
};

export function applyJavascriptCallStep(current: unknown, call: JavascriptCallStep): unknown {
  if (call.method !== undefined) {
    if (current === null || current === undefined) {
      throw new Error(`Method "${call.method}": value is null or undefined`);
    }
    const fn = Reflect.get(Object(current), call.method);
    if (typeof fn !== 'function') {
      throw new Error(`Method "${call.method}" is not a function`);
    }
    return fn.apply(current, [...call.args]);
  }
  if (typeof current === 'function') {
    return current(...call.args);
  }
  throw new Error('Value is not callable');
}
