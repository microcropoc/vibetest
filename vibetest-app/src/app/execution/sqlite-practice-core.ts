import type { Database, SqlJsStatic } from 'sql.js';

import { collectRowsFromExecResults, compareSqliteResultRows } from './sqlite-result-rows';

export interface SqlitePracticeSessionConfig {
  readonly setup: string;
  readonly userQuery: string;
  readonly referenceQuery: string;
  readonly orderMatters: boolean;
}

export interface SqlitePracticeSession {
  readonly userDb: Database;
  readonly referenceDb: Database;
  readonly userQuery: string;
  readonly referenceQuery: string;
  readonly orderMatters: boolean;
}

export interface SqlitePracticeCaseInput {
  readonly seed: string;
  readonly userReset?: string;
  readonly referenceReset?: string;
}

export interface SqlitePracticeCaseOutcome {
  readonly pass: boolean;
  readonly userRows?: readonly string[];
  readonly referenceRows?: readonly string[];
  readonly message?: string;
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
  return error instanceof Error ? error.message : fallback;
}

function runOptionalSql(db: Database, sql: string | undefined): void {
  const trimmed = (sql ?? '').trim();
  if (trimmed === '') {
    return;
  }
  db.exec(trimmed);
}

function queryResultRows(db: Database, sql: string): readonly string[] {
  return collectRowsFromExecResults(db.exec(sql));
}

/** Creates user and reference databases and runs `setup` on both; throws `SqliteSetupError`. */
export function openSqlitePracticeSession(
  SQL: SqlJsStatic,
  config: SqlitePracticeSessionConfig,
): SqlitePracticeSession {
  const userDb = new SQL.Database();
  const referenceDb = new SQL.Database();
  try {
    runOptionalSql(userDb, config.setup);
    runOptionalSql(referenceDb, config.setup);
  } catch (error: unknown) {
    userDb.close();
    referenceDb.close();
    throw new SqliteSetupError(`Setup SQL failed: ${errorMessage(error, 'SQL error')}`);
  }
  return {
    userDb,
    referenceDb,
    userQuery: config.userQuery,
    referenceQuery: config.referenceQuery,
    orderMatters: config.orderMatters,
  };
}

export function runSqlitePracticeCase(
  session: SqlitePracticeSession,
  input: SqlitePracticeCaseInput,
): SqlitePracticeCaseOutcome {
  try {
    runOptionalSql(session.userDb, input.userReset);
    runOptionalSql(session.referenceDb, input.referenceReset);
    runOptionalSql(session.userDb, input.seed);
    runOptionalSql(session.referenceDb, input.seed);
    const userStart = performance.now();
    const userRows = queryResultRows(session.userDb, session.userQuery);
    const userMs = performance.now() - userStart;
    const referenceStart = performance.now();
    const referenceRows = queryResultRows(session.referenceDb, session.referenceQuery);
    const referenceMs = performance.now() - referenceStart;
    const pass = compareSqliteResultRows(userRows, referenceRows, session.orderMatters);
    return {
      pass,
      userRows,
      referenceRows,
      message: pass ? undefined : 'Query results do not match',
      userMs,
      referenceMs,
    };
  } catch (error: unknown) {
    return { pass: false, message: errorMessage(error, 'SQL error'), userMs: 0, referenceMs: 0 };
  }
}

export function closeSqlitePracticeSession(session: SqlitePracticeSession): void {
  session.userDb.close();
  session.referenceDb.close();
}
