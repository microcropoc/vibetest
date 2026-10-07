import type { SqlJsStatic } from 'sql.js';

import { parseExecutionRequest, requestIdFromUnknown } from './execution-messages';
import { loadSqlJs } from './sqlite-engine';
import {
  openSqlitePracticeSession,
  runSqlitePracticeCase,
  type SqlitePracticeSession,
} from './sqlite-practice-core';

/// <reference lib="webworker" />

declare const self: Worker;

let sqlModulePromise: Promise<SqlJsStatic> | undefined;
let session: SqlitePracticeSession | undefined;

function loadEngine(wasmUrl: string): Promise<SqlJsStatic> {
  if (sqlModulePromise === undefined) {
    const loading = loadSqlJs({ locateFile: () => wasmUrl });
    sqlModulePromise = loading;
    loading.catch(() => {
      if (sqlModulePromise === loading) {
        sqlModulePromise = undefined;
      }
    });
  }
  return sqlModulePromise;
}

async function loadEngineOrReply(id: string, wasmUrl: string): Promise<SqlJsStatic | undefined> {
  try {
    return await loadEngine(wasmUrl);
  } catch (error: unknown) {
    const reason = error instanceof Error ? error.message : 'unknown error';
    self.postMessage({ type: 'error', id, message: `Failed to load SQLite engine: ${reason}` });
    return undefined;
  }
}

async function handleMessage(event: MessageEvent<unknown>): Promise<void> {
  try {
    const request = parseExecutionRequest(event.data);
    switch (request.type) {
      case 'sqliteLoad': {
        const SQL = await loadEngineOrReply(request.id, request.wasmUrl);
        if (SQL !== undefined) {
          self.postMessage({ type: 'sqliteLoaded', id: request.id });
        }
        break;
      }
      case 'sqliteInit': {
        const SQL = await loadEngineOrReply(request.id, request.wasmUrl);
        if (SQL === undefined) {
          break;
        }
        session = undefined;
        try {
          session = openSqlitePracticeSession(SQL, {
            setup: request.setup,
            userQuery: request.userQuery,
            referenceQuery: request.referenceQuery,
            orderMatters: request.orderMatters,
            checkColumnNames: request.checkColumnNames,
            floatTolerance: request.floatTolerance,
            checkQuery: request.checkQuery,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Setup SQL failed';
          self.postMessage({ type: 'error', id: request.id, message });
          break;
        }
        self.postMessage({ type: 'sqliteInited', id: request.id });
        break;
      }
      case 'sqliteRunCase': {
        if (session === undefined) {
          self.postMessage({
            type: 'error',
            id: request.id,
            message: 'Worker not initialized',
          });
          break;
        }
        const outcome = runSqlitePracticeCase(session, {
          seed: request.seed,
          userReset: request.userReset,
          referenceReset: request.referenceReset,
        });
        self.postMessage({
          type: 'sqliteCaseResult',
          id: request.id,
          pass: outcome.pass,
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
  } catch {
    self.postMessage({
      type: 'error',
      id: requestIdFromUnknown(event.data),
      message: 'Invalid request',
    });
  }
}

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  void handleMessage(event);
});
