import { parseExecutionRequest } from './execution-messages';

/// <reference lib="webworker" />

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

interface PracticeRuntime {
  readonly invokeUser: (args: readonly unknown[]) => unknown;
  readonly invokeReference: (args: readonly unknown[]) => unknown;
  readonly applyUserReset: (reset: string) => void;
  readonly applyReferenceReset: (reset: string) => void;
}

let runtime: PracticeRuntime | undefined;

function compileCallable(
  setup: string,
  code: string,
  functionName: string,
): {
  invoke: (args: readonly unknown[]) => unknown;
  applyReset: (reset: string, recompile: () => (...args: unknown[]) => unknown) => void;
  recompile: () => (...args: unknown[]) => unknown;
} {
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
    recompile,
    applyReset(reset: string, recompileFn: () => (...args: unknown[]) => unknown) {
      if (reset.trim() !== '') {
        const resetRunner = new Function(`"use strict"; ${reset}`);
        resetRunner();
      }
      fn = recompileFn();
    },
  };
}

function jsonCompatibleEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

ctx.addEventListener('message', (event: MessageEvent<unknown>) => {
  try {
    const request = parseExecutionRequest(event.data);
    switch (request.type) {
      case 'javascriptInit': {
        const user = compileCallable(request.setup, request.userCode, request.functionName);
        const reference = compileCallable(
          request.setup,
          request.referenceCode,
          request.functionName,
        );
        runtime = {
          invokeUser: (args) => user.invoke(args),
          invokeReference: (args) => reference.invoke(args),
          applyUserReset: (reset) => user.applyReset(reset, user.recompile),
          applyReferenceReset: (reset) => reference.applyReset(reset, reference.recompile),
        };
        ctx.postMessage({ type: 'javascriptInited', id: request.id });
        break;
      }
      case 'javascriptRunCase': {
        if (!runtime) {
          ctx.postMessage({
            type: 'error',
            id: request.id,
            message: 'Worker not initialized',
          });
          break;
        }
        try {
          runtime.applyUserReset(request.userReset ?? '');
          runtime.applyReferenceReset(request.referenceReset ?? '');
          const userValue = runtime.invokeUser(request.args);
          const referenceValue = runtime.invokeReference(request.args);
          const pass = jsonCompatibleEqual(userValue, referenceValue);
          ctx.postMessage({
            type: 'javascriptCaseResult',
            id: request.id,
            pass,
            userValue,
            referenceValue,
            message: pass ? undefined : 'Return values do not match',
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Runtime error';
          ctx.postMessage({
            type: 'javascriptCaseResult',
            id: request.id,
            pass: false,
            message,
          });
        }
        break;
      }
      default:
        break;
    }
  } catch {
    ctx.postMessage({
      type: 'error',
      id: 'unknown',
      message: 'Invalid request',
    });
  }
});
