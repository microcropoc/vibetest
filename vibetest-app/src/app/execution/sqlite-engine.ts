import initSqlJs, { type SqlJsConfig, type SqlJsStatic } from 'sql.js';

/**
 * Single entry for sql.js: the worker passes `locateFile` (wasm URL), Node specs pass `wasmBinary`.
 * The wasm asset is copied from `node_modules/sql.js/dist` at build so it always matches this JS.
 */
export function loadSqlJs(config: SqlJsConfig): Promise<SqlJsStatic> {
  return initSqlJs(config);
}
