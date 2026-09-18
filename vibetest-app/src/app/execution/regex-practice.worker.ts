import { parseExecutionRequest } from './execution-messages';
import { compileRegexPattern, regexTestMatch } from './regex-pattern';

/// <reference lib="webworker" />

declare const self: Worker;

interface RegexRuntime {
  readonly userPattern: RegExp;
  readonly referencePattern: RegExp;
}

let runtime: RegexRuntime | undefined;

function compileRuntime(userSource: string, referenceSource: string): RegexRuntime {
  return {
    userPattern: compileRegexPattern(userSource),
    referencePattern: compileRegexPattern(referenceSource),
  };
}

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  try {
    const request = parseExecutionRequest(event.data);
    switch (request.type) {
      case 'regexInit': {
        try {
          runtime = compileRuntime(request.userPattern, request.referencePattern);
          self.postMessage({ type: 'regexInited', id: request.id });
        } catch (error: unknown) {
          runtime = undefined;
          const message =
            error instanceof SyntaxError
              ? 'Invalid regular expression'
              : error instanceof Error
                ? error.message
                : 'Invalid regular expression';
          self.postMessage({
            type: 'error',
            id: request.id,
            message,
          });
        }
        break;
      }
      case 'regexRunCase': {
        if (!runtime) {
          self.postMessage({
            type: 'error',
            id: request.id,
            message: 'Worker not initialized',
          });
          break;
        }
        try {
          const userResult = runtime.userPattern.test(request.input);
          const referenceResult = runtime.referencePattern.test(request.input);
          const pass = regexTestMatch(userResult, referenceResult);
          self.postMessage({
            type: 'regexCaseResult',
            id: request.id,
            pass,
            userResult,
            referenceResult,
            message: pass ? undefined : 'RegExp.test results do not match',
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Regex error';
          self.postMessage({
            type: 'regexCaseResult',
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
