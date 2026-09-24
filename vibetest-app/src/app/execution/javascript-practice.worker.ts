import { compileJavascriptPracticeCallable } from './javascript-practice-compile';
import { parseExecutionRequest } from './execution-messages';
import { runJavascriptCaseComparison } from '../player/step-engine/javascript/run-javascript-case';

/// <reference lib="webworker" />

declare const self: Worker;

interface PracticeRuntime {
  readonly invokeUser: (args: readonly unknown[]) => unknown;
  readonly invokeReference: (args: readonly unknown[]) => unknown;
  readonly applyUserReset: (reset: string) => void;
  readonly applyReferenceReset: (reset: string) => void;
}

let runtime: PracticeRuntime | undefined;

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  try {
    const request = parseExecutionRequest(event.data);
    switch (request.type) {
      case 'javascriptInit': {
        const user = compileJavascriptPracticeCallable(
          request.setup,
          request.userCode,
          request.functionName,
        );
        const reference = compileJavascriptPracticeCallable(
          request.setup,
          request.referenceCode,
          request.functionName,
        );
        runtime = {
          invokeUser: (args) => user.invoke(args),
          invokeReference: (args) => reference.invoke(args),
          applyUserReset: (reset) => user.applyReset(reset),
          applyReferenceReset: (reset) => reference.applyReset(reset),
        };
        self.postMessage({ type: 'javascriptInited', id: request.id });
        break;
      }
      case 'javascriptRunCase': {
        if (!runtime) {
          self.postMessage({
            type: 'error',
            id: request.id,
            message: 'Worker not initialized',
          });
          break;
        }
        try {
          runtime.applyUserReset(request.userReset ?? '');
          runtime.applyReferenceReset(request.referenceReset ?? '');
          const result = runJavascriptCaseComparison(
            runtime.invokeUser,
            runtime.invokeReference,
            request.args,
            request.calls,
          );
          self.postMessage({
            type: 'javascriptCaseResult',
            id: request.id,
            pass: result.pass,
            userValue: result.userValue,
            referenceValue: result.referenceValue,
            message: result.message,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Runtime error';
          self.postMessage({
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
    self.postMessage({
      type: 'error',
      id: 'unknown',
      message: 'Invalid request',
    });
  }
});
