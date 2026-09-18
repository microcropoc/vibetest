/** Minimal sql.js surface used by the SQLite practice worker (no import from `sql.js`). */

export interface SqlJsExecResult {
  readonly columns: string[];
  readonly values: unknown[][];
}

export interface SqlJsDatabase {
  exec(sql: string): SqlJsExecResult[];
  close(): void;
}

export interface SqlJsStatic {
  Database: new () => SqlJsDatabase;
}

export type InitSqlJs = (config: { locateFile: (file: string) => string }) => Promise<SqlJsStatic>;
