export interface JavascriptPracticeCallable {
  readonly invoke: (args: readonly unknown[]) => unknown;
  readonly applyReset: (reset: string) => void;
}

export function compileJavascriptPracticeCallable(
  setup: string,
  code: string,
  functionName: string,
): JavascriptPracticeCallable {
  const recompile = (): ((...args: unknown[]) => unknown) => {
    const factory = new Function(
      `"use strict";
${setup}
${code}
if (typeof ${functionName} !== "function") {
  throw new Error("Function ${functionName} is not defined");
}
return ${functionName};`,
    );
    return factory() as (...args: unknown[]) => unknown;
  };

  let fn = recompile();

  return {
    invoke(args: readonly unknown[]) {
      return fn(...args);
    },
    applyReset(reset: string) {
      if (reset.trim() !== '') {
        const resetRunner = new Function(`"use strict"; ${reset}`);
        resetRunner();
      }
      fn = recompile();
    },
  };
}
