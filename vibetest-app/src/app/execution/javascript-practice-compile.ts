import { installFakeTimers, JAVASCRIPT_PRACTICE_TIMER_PREAMBLE, type FakeTimerController } from './javascript-fake-timers';
import {
  clearSpyRegistry,
  createPracticeGlobalBag,
  JAVASCRIPT_PRACTICE_SPY_PREAMBLE,
  type PracticeGlobalBag,
} from './javascript-practice-global';

export type JavascriptPracticeTarget =
  | { readonly kind: 'function'; readonly name: string }
  | { readonly kind: 'construct'; readonly className: string };

export interface JavascriptPracticeCallable {
  readonly invoke: (args: readonly unknown[]) => unknown;
  readonly applyReset: (reset: string) => void;
  readonly timers: FakeTimerController;
  readonly globalBag: PracticeGlobalBag;
}

const COMPILE_PREAMBLE = `
var globalThis = __vibetestGlobal;
${JAVASCRIPT_PRACTICE_SPY_PREAMBLE}
${JAVASCRIPT_PRACTICE_TIMER_PREAMBLE}
`;

function buildReturnExpression(target: JavascriptPracticeTarget): string {
  if (target.kind === 'function') {
    return `
if (typeof ${target.name} !== "function") {
  throw new Error("Function ${target.name} is not defined");
}
return ${target.name};`;
  }
  return `
if (typeof ${target.className} !== "function") {
  throw new Error("Class ${target.className} is not defined");
}
return function (...args) {
  return new ${target.className}(...args);
};`;
}

export function compileJavascriptPracticeCallable(
  setup: string,
  code: string,
  target: JavascriptPracticeTarget,
): JavascriptPracticeCallable {
  const globalBag = createPracticeGlobalBag();
  const timers = installFakeTimers(globalBag);

  const recompile = (): ((...args: unknown[]) => unknown) => {
    clearSpyRegistry(globalBag);
    const factory = new Function(
      '__vibetestGlobal',
      `"use strict";
${COMPILE_PREAMBLE}
${setup}
${code}
${buildReturnExpression(target)}`,
    );
    return factory(globalBag) as (...args: unknown[]) => unknown;
  };

  let fn = recompile();

  return {
    invoke(args: readonly unknown[]) {
      return fn(...args);
    },
    applyReset(reset: string) {
      if (reset.trim() !== '') {
        const resetRunner = new Function(
          '__vibetestGlobal',
          `"use strict";
var globalThis = __vibetestGlobal;
${JAVASCRIPT_PRACTICE_TIMER_PREAMBLE}
${reset}`,
        );
        resetRunner(globalBag);
      }
      timers.reset();
      fn = recompile();
    },
    timers,
    globalBag,
  };
}
