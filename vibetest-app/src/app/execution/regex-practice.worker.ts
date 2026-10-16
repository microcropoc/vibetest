import { parseExecutionRequest, requestIdFromUnknown } from './execution-messages';
import {
  createRegexPracticeWorkerState,
  handleRegexPracticeWorkerMessage,
} from './regex-practice-worker-handler';

/// <reference lib="webworker" />

declare const self: Worker;

const state = createRegexPracticeWorkerState();

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  try {
    const request = parseExecutionRequest(event.data);
    handleRegexPracticeWorkerMessage(request, (message) => self.postMessage(message), state);
  } catch {
    self.postMessage({
      type: 'error',
      id: requestIdFromUnknown(event.data),
      message: 'Invalid request',
    });
  }
});
