import { compileJavascriptPracticeCallable } from './javascript-practice-compile';
import type { FakeTimerController } from './javascript-fake-timers';
import { parseExecutionRequest } from './execution-messages';
import type { PracticeGlobalBag } from './javascript-practice-global';
import { runJavascriptCaseComparison } from '../player/step-engine/javascript/run-javascript-case';

/// <reference lib="webworker" />

declare const self: Worker;

interface PracticeRuntime {
  readonly invokeUser: (args: readonly unknown[]) => unknown;
  readonly invokeReference: (args: readonly unknown[]) => unknown;
  readonly applyUserReset: (reset: string) => void;
  readonly applyReferenceReset: (reset: string) => void;
  readonly userTimers: FakeTimerController;
  readonly referenceTimers: FakeTimerController;
  readonly userGlobal: PracticeGlobalBag;
  readonly referenceGlobal: PracticeGlobalBag;
}

let runtime: PracticeRuntime | undefined;
let caseInFlight = false;

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
          userTimers: user.timers,
          referenceTimers: reference.timers,
          userGlobal: user.globalBag,
          referenceGlobal: reference.globalBag,
        };
        self.postMessage({ type: 'javascriptInited', id: request.id });
        break;
      }
      case 'javascriptRunCase': {
        const active = runtime;
        if (!active) {
          self.postMessage({
            type: 'error',
            id: request.id,
            message: 'Worker not initialized',
          });
          break;
        }
        if (caseInFlight) {
          self.postMessage({
            type: 'error',
            id: request.id,
            message: 'Case already running',
          });
          break;
        }
        caseInFlight = true;
        void (async () => {
          try {
            active.applyUserReset(request.userReset ?? '');
            active.applyReferenceReset(request.referenceReset ?? '');
            const result = await runJavascriptCaseComparison(
              active.invokeUser,
              active.invokeReference,
              request.args,
              request.calls,
              {
                rejects: request.rejects,
                deadlineMs: request.deadlineMs,
                expectInvocations: request.expectInvocations,
                advanceMs: request.advanceMs,
                flushMicrotasks: request.flushMicrotasks,
                resultMode: request.resultMode,
                structure: request.structure,
                userTimers: active.userTimers,
                referenceTimers: active.referenceTimers,
                userGlobal: active.userGlobal,
                referenceGlobal: active.referenceGlobal,
              },
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
          } finally {
            caseInFlight = false;
          }
        })();
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
