import { parseExecutionRequest } from './execution-messages';
import { collectRowsFromExecResults, compareSqliteResultRows } from './sqlite-result-rows';
import type { InitSqlJs, SqlJsDatabase, SqlJsStatic } from './sqlite-worker-types';

/// <reference lib="webworker" />

declare const self: Worker;

interface SqliteRuntime {
  readonly userDb: SqlJsDatabase;
  readonly referenceDb: SqlJsDatabase;
  readonly userQuery: string;
  readonly referenceQuery: string;
  readonly orderMatters: boolean;
}

let sqlModulePromise: Promise<SqlJsStatic> | undefined;
let runtime: SqliteRuntime | undefined;

function sqlWasmScriptUrl(wasmUrl: string): string {
  return new URL('sql-wasm.js', wasmUrl).href;
}

async function loadSqlModule(wasmUrl: string): Promise<SqlJsStatic> {
  if (sqlModulePromise === undefined) {
    const scriptUrl = sqlWasmScriptUrl(wasmUrl);
    const module = (await import(/* @vite-ignore */ scriptUrl)) as {
      default: InitSqlJs;
    };
    sqlModulePromise = module.default({ locateFile: () => wasmUrl });
  }
  return sqlModulePromise;
}

function runOptionalSql(db: SqlJsDatabase, sql: string | undefined): void {
  const trimmed = (sql ?? '').trim();
  if (trimmed === '') {
    return;
  }
  db.exec(trimmed);
}

function queryResultRows(db: SqlJsDatabase, sql: string): readonly string[] {
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
