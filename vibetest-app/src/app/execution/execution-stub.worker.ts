import { parseExecutionRequest } from './execution-messages';

/// <reference lib="webworker" />

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

ctx.addEventListener('message', (event: MessageEvent<unknown>) => {
  try {
    const request = parseExecutionRequest(event.data);
    switch (request.type) {
      case 'ping':
        ctx.postMessage({ type: 'pong', id: request.id });
        break;
      case 'echo':
        ctx.postMessage({ type: 'echoResult', id: request.id, payload: request.payload });
        break;
      default: {
        const _exhaustive: never = request;
        void _exhaustive;
      }
    }
  } catch {
    ctx.postMessage({
      type: 'error',
      id: 'unknown',
      message: 'Invalid request',
    });
  }
});
