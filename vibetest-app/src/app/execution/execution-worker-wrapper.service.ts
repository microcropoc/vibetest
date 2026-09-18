import { Injectable } from '@angular/core';

import { ExecutionProtocolError, ExecutionTimeoutError } from './execution-errors';
import type { ExecutionRequest, ExecutionResponse } from './execution-messages';
import { parseExecutionResponse } from './execution-messages';

/**
 * Single entry for step runners (vt-8–vt-10): postMessage + timeout + parse responses.
 * UI/components must not call Worker APIs directly.
 */
@Injectable({ providedIn: 'root' })
export class ExecutionWorkerWrapperService {
  runRequest(
    worker: Worker,
    request: ExecutionRequest,
    timeoutMs: number,
  ): Promise<ExecutionResponse> {
    if (!Number.isFinite(timeoutMs) || timeoutMs < 100 || timeoutMs > 30_000) {
      return Promise.reject(
        new ExecutionProtocolError('timeoutMs must be between 100 and 30000'),
      );
    }

    return new Promise<ExecutionResponse>((resolve, reject) => {
      let settled = false;

      const finish = (handler: () => void) => {
        if (settled) {
          return;
        }
        settled = true;
        clearTimeout(timer);
        worker.removeEventListener('message', onMessage);
        worker.removeEventListener('error', onError);
        handler();
      };

      const onMessage = (event: MessageEvent<unknown>) => {
        let response: ExecutionResponse;
        try {
          response = parseExecutionResponse(event.data);
        } catch (error: unknown) {
          finish(() => reject(error));
          return;
        }
        if (response.id !== request.id) {
          return;
        }
        finish(() => resolve(response));
      };

      const onError = (event: ErrorEvent) => {
        finish(() => {
          worker.terminate();
          reject(new ExecutionProtocolError(event.message || 'Worker error'));
        });
      };

      const timer = setTimeout(() => {
        finish(() => {
          worker.terminate();
          reject(new ExecutionTimeoutError(timeoutMs));
        });
      }, timeoutMs);

      worker.addEventListener('message', onMessage);
      worker.addEventListener('error', onError);
      worker.postMessage(request);
    });
  }
}
