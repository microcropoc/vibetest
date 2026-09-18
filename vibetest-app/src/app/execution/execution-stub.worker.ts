import { parseExecutionRequest } from './execution-messages';

/// <reference lib="webworker" />

declare const self: Worker;

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  try {
    const request = parseExecutionRequest(event.data);
    switch (request.type) {
      case 'ping':
        self.postMessage({ type: 'pong', id: request.id });
        break;
      case 'echo':
        self.postMessage({ type: 'echoResult', id: request.id, payload: request.payload });
        break;
      case 'javascriptInit':
      case 'javascriptRunCase':
      case 'sqliteInit':
      case 'sqliteRunCase':
        self.postMessage({
          type: 'error',
          id: request.id,
          message: 'Not implemented in stub worker',
        });
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
