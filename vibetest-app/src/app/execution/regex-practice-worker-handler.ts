import type { ExecutionRequest } from './execution-messages';
import {
  openRegexPracticeSession,
  RegexPatternCompileError,
  runRegexPracticeCase,
  type RegexPracticeSession,
} from './regex-practice-core';

export interface RegexPracticeWorkerState {
  session: RegexPracticeSession | undefined;
}

export function createRegexPracticeWorkerState(): RegexPracticeWorkerState {
  return { session: undefined };
}

export function handleRegexPracticeWorkerMessage(
  request: ExecutionRequest,
  postMessage: (message: unknown) => void,
  state: RegexPracticeWorkerState,
): void {
  switch (request.type) {
    case 'regexInit': {
      try {
        state.session = openRegexPracticeSession({
          userPattern: request.userPattern,
          referencePattern: request.referencePattern,
          flags: request.flags,
          answerFormat: request.answerFormat,
          mode: request.mode,
          replacement: request.replacement,
          unordered: request.unordered,
        });
        postMessage({ type: 'regexInited', id: request.id });
      } catch (error: unknown) {
        state.session = undefined;
        const message =
          error instanceof RegexPatternCompileError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Invalid regular expression';
        postMessage({ type: 'error', id: request.id, message });
      }
      break;
    }
    case 'regexRunCase': {
      if (state.session === undefined) {
        postMessage({
          type: 'error',
          id: request.id,
          message: 'Worker not initialized',
        });
        break;
      }
      const outcome = runRegexPracticeCase(state.session, { input: request.input });
      postMessage({
        type: 'regexCaseResult',
        id: request.id,
        pass: outcome.pass,
        userResult: outcome.userResult,
        referenceResult: outcome.referenceResult,
        message: outcome.message,
        diff: outcome.diff,
        userMs: outcome.userMs,
        referenceMs: outcome.referenceMs,
      });
      break;
    }
    default:
      break;
  }
}
