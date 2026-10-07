import type { Database, SqlJsStatic, StatementIterator } from 'sql.js';

import { registerSqliteFunctions } from './sqlite-functions';
import {
  compareSqliteResultTables,
  EMPTY_SQLITE_RESULT_TABLE,
  previewSqliteResultTable,
  sqliteCellFromValue,
  sqlitePreviewFirstRow,
  type SqliteCaseDiff,
  type SqliteCell,
  type SqliteCompareOptions,
  type SqliteResultTable,
} from './sqlite-result-table';

export interface SqlitePracticeSessionConfig extends SqliteCompareOptions {
  readonly setup: string;
  readonly userQuery: string;
  readonly referenceQuery: string;
  readonly checkQuery?: string;
}

/** Validated step config; every case gets fresh databases, so nothing the SQL creates leaks into the next one. */
export interface SqlitePracticeSession extends SqliteCompareOptions {
  readonly SQL: SqlJsStatic;
  readonly setup: string;
  readonly userQuery: string;
  readonly referenceQuery: string;
  readonly checkQuery?: string;
}

export interface SqlitePracticeCaseInput {
  readonly seed: string;
  readonly userReset?: string;
  readonly referenceReset?: string;
}

export interface SqlitePracticeCaseOutcome {
  readonly pass: boolean;
  readonly message?: string;
  /** Present on failure when there is something to show the student. */
  readonly diff?: SqliteCaseDiff;
  readonly userMs: number;
  readonly referenceMs: number;
}

export class SqliteSetupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SqliteSetupError';
  }
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message !== '') {
    return error.message;
  }
  return typeof error === 'string' && error !== '' ? error : fallback;
}

function runOptionalSql(db: Database, sql: string | undefined): void {
  const trimmed = (sql ?? '').trim();
  if (trimmed === '') {
    return;
  }
  db.exec(trimmed);
}

/**
 * Runs every statement and returns the result of the last one that has columns
 * (an empty SELECT keeps its column names); no such statement → empty table.
 */
export function runSqliteForLastResult(db: Database, sql: string): SqliteResultTable {
  const statements = db.iterateStatements(sql);
  let last: SqliteResultTable = EMPTY_SQLITE_RESULT_TABLE;
  try {
    for (let next = statements.next(); !next.done; next = statements.next()) {
      const statement = next.value;
      const columns = statement.getColumnNames();
      const rows: (readonly SqliteCell[])[] = [];
      while (statement.step()) {
        rows.push(statement.get().map(sqliteCellFromValue));
      }
      if (columns.length > 0) {
        last = { columns, rows };
      }
    }
  } catch (error: unknown) {
    drainStatementIterator(statements);
    throw error;
  }
  return last;
}

/**
 * sql.js frees the iterator's SQL buffer and active statement only when `next()` reaches the end or
 * fails to prepare (its `finalize` is not public), so a failed `step()` would leak them in the wasm heap.
 * The remaining statements are only prepared here, never executed.
 */
function drainStatementIterator(statements: StatementIterator): void {
  try {
    while (!statements.next().done) {
      // Each `next()` frees the previously prepared statement.
    }
  } catch {
    // A failed prepare frees the buffer as well.
  }
}

interface SideRun {
  readonly table?: SqliteResultTable;
  readonly error?: string;
  readonly ms: number;
}

function runSide(db: Database, query: string, checkQuery: string | undefined): SideRun {
  const start = performance.now();
  let table: SqliteResultTable;
  try {
    table = runSqliteForLastResult(db, query);
  } catch (error: unknown) {
    return { error: errorMessage(error, 'SQL error'), ms: performance.now() - start };
  }
  const ms = performance.now() - start;
  if (checkQuery === undefined) {
    return { table, ms };
  }
  try {
    return { table: runSqliteForLastResult(db, checkQuery), ms };
  } catch (error: unknown) {
    return { error: `Check query failed: ${errorMessage(error, 'SQL error')}`, ms };
  }
}

/** In-memory database with REGEXP/math functions and `setup` applied; throws `SqliteSetupError`. */
export function createSqlitePracticeDatabase(SQL: SqlJsStatic, setup: string): Database {
  const db = new SQL.Database();
  try {
    registerSqliteFunctions(db);
    runOptionalSql(db, setup);
  } catch (error: unknown) {
    db.close();
    throw new SqliteSetupError(`Setup SQL failed: ${errorMessage(error, 'SQL error')}`);
  }
  return db;
}

/** Validates `setup` once; throws `SqliteSetupError`. */
export function openSqlitePracticeSession(
  SQL: SqlJsStatic,
  config: SqlitePracticeSessionConfig,
): SqlitePracticeSession {
  createSqlitePracticeDatabase(SQL, config.setup).close();
  const checkQuery = config.checkQuery?.trim();
  return {
    SQL,
    setup: config.setup,
    userQuery: config.userQuery,
    referenceQuery: config.referenceQuery,
    checkQuery: checkQuery === '' ? undefined : checkQuery,
    orderMatters: config.orderMatters,
    checkColumnNames: config.checkColumnNames,
    floatTolerance: config.floatTolerance,
  };
}

/** Order per case: fresh databases → setup → reset → seed → user / reference SQL → compare. */
export function runSqlitePracticeCase(
  session: SqlitePracticeSession,
  input: SqlitePracticeCaseInput,
): SqlitePracticeCaseOutcome {
  const opened: Database[] = [];
  try {
    const userDb = createSqlitePracticeDatabase(session.SQL, session.setup);
    opened.push(userDb);
    const referenceDb = createSqlitePracticeDatabase(session.SQL, session.setup);
    opened.push(referenceDb);
    return runCaseOnDatabases(session, input, userDb, referenceDb);
  } catch (error: unknown) {
    return { pass: false, message: errorMessage(error, 'SQL error'), userMs: 0, referenceMs: 0 };
  } finally {
    for (const db of opened) {
      db.close();
    }
  }
}

function runCaseOnDatabases(
  session: SqlitePracticeSession,
  input: SqlitePracticeCaseInput,
  userDb: Database,
  referenceDb: Database,
): SqlitePracticeCaseOutcome {
  try {
    runOptionalSql(userDb, input.userReset);
    runOptionalSql(referenceDb, input.referenceReset);
    runOptionalSql(userDb, input.seed);
    runOptionalSql(referenceDb, input.seed);
  } catch (error: unknown) {
    return {
      pass: false,
      message: `Test data SQL failed: ${errorMessage(error, 'SQL error')}`,
      userMs: 0,
      referenceMs: 0,
    };
  }

  const user = runSide(userDb, session.userQuery, session.checkQuery);
  const reference = runSide(referenceDb, session.referenceQuery, session.checkQuery);
  const timings = { userMs: user.ms, referenceMs: reference.ms };

  if (reference.table === undefined) {
    return {
      pass: false,
      message: `Reference SQL failed: ${reference.error ?? 'SQL error'}`,
      ...timings,
    };
  }
  const expected = previewSqliteResultTable(reference.table);
  if (user.table === undefined) {
    const userError = user.error ?? 'SQL error';
    return { pass: false, message: userError, diff: { expected, userError }, ...timings };
  }

  const comparison = compareSqliteResultTables(user.table, reference.table, session);
  if (comparison.pass) {
    return { pass: true, ...timings };
  }
  const { mismatchRow } = comparison;
  const firstRow = sqlitePreviewFirstRow(mismatchRow);
  return {
    pass: false,
    message: comparison.message,
    diff: {
      user: previewSqliteResultTable(user.table, firstRow),
      expected: previewSqliteResultTable(reference.table, firstRow),
      ...(mismatchRow === undefined ? {} : { mismatchRow }),
    },
    ...timings,
  };
}