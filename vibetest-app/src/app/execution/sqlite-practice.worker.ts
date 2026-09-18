import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';

import { parseExecutionRequest } from './execution-messages';
import { collectRowsFromExecResults, compareSqliteResultRows } from './sqlite-result-rows';

/// <reference lib="webworker" />

declare const self: Worker;

interface SqliteRuntime {
  readonly userDb: Database;
  readonly referenceDb: Database;
  readonly userQuery: string;
  readonly referenceQuery: string;
  readonly orderMatters: boolean;
}

let sqlModulePromise: Promise<SqlJsStatic> | undefined;
let runtime: SqliteRuntime | undefined;

function loadSqlModule(wasmUrl: string): Promise<SqlJsStatic> {
  if (sqlModulePromise === undefined) {
    sqlModulePromise = initSqlJs({ locateFile: () => wasmUrl });
  }
  return sqlModulePromise as Promise<SqlJsStatic>;
}

function runOptionalSql(db: Database, sql: string | undefined): void {
  const trimmed = (sql ?? '').trim();
  if (trimmed === '') {
    return;
  }
  db.exec(trimmed);
}

function queryResultRows(db: Database, sql: string): readonly string[] {
  const results = db.exec(sql);
  return collectRowsFromExecResults(results);
}

function createRuntime(
  SQL: SqlJsStatic,
  setup: string,
  userQuery: string,
  referenceQuery: string,
  orderMatters: boolean,
): SqliteRuntime {
  const userDb = new SQL.Database();
  const referenceDb = new SQL.Database();
  runOptionalSql(userDb, setup);
  runOptionalSql(referenceDb, setup);
  return { userDb, referenceDb, userQuery, referenceQuery, orderMatters };
}

async function handleMessage(event: MessageEvent<unknown>): Promise<void> {
  try {
    const request = parseExecutionRequest(event.data);
    switch (request.type) {
      case 'sqliteInit': {
        const SQL = await loadSqlModule(request.wasmUrl);
        runtime?.userDb.close();
        runtime?.referenceDb.close();
        runtime = createRuntime(
          SQL,
          request.setup,
          request.userQuery,
          request.referenceQuery,
          request.orderMatters,
        );
        self.postMessage({ type: 'sqliteInited', id: request.id });
        break;
      }
      case 'sqliteRunCase': {
        if (!runtime) {
          self.postMessage({
            type: 'error',
            id: request.id,
            message: 'Worker not initialized',
          });
          break;
        }
        try {
          runOptionalSql(runtime.userDb, request.userReset);
          runOptionalSql(runtime.referenceDb, request.referenceReset);
          runOptionalSql(runtime.userDb, request.seed);
          runOptionalSql(runtime.referenceDb, request.seed);
          const userRows = queryResultRows(runtime.userDb, runtime.userQuery);
          const referenceRows = queryResultRows(runtime.referenceDb, runtime.referenceQuery);
          const pass = compareSqliteResultRows(userRows, referenceRows, runtime.orderMatters);
          self.postMessage({
            type: 'sqliteCaseResult',
            id: request.id,
            pass,
            userRows: [...userRows],
            referenceRows: [...referenceRows],
            message: pass ? undefined : 'Query results do not match',
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'SQL error';
          self.postMessage({
            type: 'sqliteCaseResult',
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
}

self.addEventListener('message', (event: MessageEvent<unknown>) => {
  void handleMessage(event);
});
