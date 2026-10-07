import type { SqlJsStatic } from 'sql.js';

import { loadSqlJsForSpecs } from '../courses/practice-reference-in-process-runners.spec-helper';

import {
  createSqlitePracticeDatabase,
  openSqlitePracticeSession,
  runSqliteForLastResult,
  runSqlitePracticeCase,
  SqliteSetupError,
  type SqlitePracticeCaseOutcome,
  type SqlitePracticeSessionConfig,
} from './sqlite-practice-core';

const setup = 'CREATE TABLE users(id INT, name TEXT);';
const reset = 'DELETE FROM users;';
const reference = 'SELECT id, name FROM users ORDER BY id;';

async function runOneCase(
  config: Partial<SqlitePracticeSessionConfig> & Pick<SqlitePracticeSessionConfig, 'userQuery'>,
  seed: string,
): Promise<SqlitePracticeCaseOutcome> {
  const SQL = await loadSqlJsForSpecs();
  const session = openSqlitePracticeSession(SQL, {
    setup,
    referenceQuery: reference,
    orderMatters: true,
    ...config,
  });
  const caseReset = config.setup === undefined ? reset : undefined;
  return runSqlitePracticeCase(session, { seed, userReset: caseReset, referenceReset: caseReset });
}

async function scalar(sql: string): Promise<unknown> {
  const SQL: SqlJsStatic = await loadSqlJsForSpecs();
  const db = createSqlitePracticeDatabase(SQL, '');
  try {
    return runSqliteForLastResult(db, sql).rows[0]?.[0];
  } finally {
    db.close();
  }
}

const twoUsers = "INSERT INTO users VALUES(1, 'Anna'), (2, 'Bob');";

describe('sqlite practice core (real sql.js)', () => {
  it('passes when user rows match reference rows', async () => {
    const outcome = await runOneCase({ userQuery: 'SELECT * FROM users ORDER BY id;' }, twoUsers);
    expect(outcome.pass).toBe(true);
    expect(outcome.diff).toBeUndefined();
  });

  it('starts every case from setup + seed only', async () => {
    const SQL = await loadSqlJsForSpecs();
    const session = openSqlitePracticeSession(SQL, {
      setup,
      userQuery:
        'CREATE TABLE extra(x INT); CREATE TEMP TABLE picked AS SELECT * FROM users; UPDATE users SET id = id + 10; SELECT COUNT(*) FROM picked;',
      referenceQuery: 'SELECT 1;',
      orderMatters: false,
    });
    for (const seed of ["INSERT INTO users VALUES(1, 'Anna');", "INSERT INTO users VALUES(2, 'Bob');"]) {
      const outcome = runSqlitePracticeCase(session, { seed });
      expect(outcome.message).toBeUndefined();
      expect(outcome.pass).toBe(true);
    }
  });

  it('fails with both results in the diff when rows differ', async () => {
    const outcome = await runOneCase(
      { userQuery: 'SELECT id, name FROM users WHERE id = 1;' },
      twoUsers,
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.message).toBe('Row count differs: expected 2, got 1');
    expect(outcome.diff).toEqual({
      user: { columns: ['id', 'name'], rows: [[1, 'Anna']], firstRow: 0, rowCount: 1 },
      expected: {
        columns: ['id', 'name'],
        rows: [
          [1, 'Anna'],
          [2, 'Bob'],
        ],
        firstRow: 0,
        rowCount: 2,
      },
    });
  });

  it('shows the preview window around a row that differs beyond the first 50', async () => {
    const outcome = await runOneCase(
      {
        setup: 'CREATE TABLE n(v INT);',
        userQuery:
          'WITH RECURSIVE s(v) AS (SELECT 1 UNION ALL SELECT v + 1 FROM s WHERE v < 80) SELECT CASE v WHEN 70 THEN 0 ELSE v END FROM s;',
        referenceQuery:
          'WITH RECURSIVE s(v) AS (SELECT 1 UNION ALL SELECT v + 1 FROM s WHERE v < 80) SELECT v FROM s;',
      },
      '',
    );
    expect(outcome.message).toBe('Query results do not match (row 70)');
    expect(outcome.diff?.mismatchRow).toBe(69);
    expect(outcome.diff?.user?.firstRow).toBe(64);
    expect(outcome.diff?.user?.rows[5]).toEqual([0]);
    expect(outcome.diff?.expected?.firstRow).toBe(64);
    expect(outcome.diff?.expected?.rows[5]).toEqual([70]);
    expect(outcome.diff?.expected?.rowCount).toBe(80);
  });

  it('reports a SQL error in the user query with the expected result', async () => {
    const outcome = await runOneCase({ userQuery: 'SELEC id FROM users;' }, twoUsers);
    expect(outcome.pass).toBe(false);
    expect(outcome.message).toContain('syntax error');
    expect(outcome.diff?.userError).toContain('syntax error');
    expect(outcome.diff?.user).toBeUndefined();
    expect(outcome.diff?.expected?.rowCount).toBe(2);
  });

  it('reports a broken reference query as an author error', async () => {
    const outcome = await runOneCase(
      { userQuery: reference, referenceQuery: 'SELECT nope FROM users;' },
      twoUsers,
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.message).toMatch(/^Reference SQL failed: no such column: nope/);
    expect(outcome.diff).toBeUndefined();
  });

  it('compares the last result set, after helper statements', async () => {
    const outcome = await runOneCase(
      {
        userQuery:
          'CREATE TEMP TABLE picked AS SELECT * FROM users; SELECT 42; SELECT id, name FROM picked ORDER BY id;',
      },
      twoUsers,
    );
    expect(outcome.pass).toBe(true);
  });

  it('keeps the column names of an empty result', async () => {
    const SQL = await loadSqlJsForSpecs();
    const db = createSqlitePracticeDatabase(SQL, setup);
    try {
      expect(runSqliteForLastResult(db, 'SELECT id AS user_id FROM users;')).toEqual({
        columns: ['user_id'],
        rows: [],
      });
      expect(runSqliteForLastResult(db, 'DELETE FROM users;')).toEqual({ columns: [], rows: [] });
    } finally {
      db.close();
    }
  });

  it('checks aliases only with checkColumnNames', async () => {
    const userQuery = 'SELECT id, name AS title FROM users ORDER BY id;';
    expect((await runOneCase({ userQuery }, twoUsers)).pass).toBe(true);
    const strict = await runOneCase({ userQuery, checkColumnNames: true }, twoUsers);
    expect(strict.pass).toBe(false);
    expect(strict.message).toBe('Column names differ: expected (id, name), got (id, title)');
  });

  it('applies floatTolerance to computed values', async () => {
    const config = {
      setup: 'CREATE TABLE t(v REAL);',
      userQuery: 'SELECT ROUND(AVG(v), 4) FROM t;',
      referenceQuery: 'SELECT AVG(v) FROM t;',
    };
    const seed = 'INSERT INTO t VALUES (1), (2), (4);';
    expect((await runOneCase(config, seed)).pass).toBe(false);
    expect((await runOneCase({ ...config, floatTolerance: 1e-3 }, seed)).pass).toBe(true);
  });

  it('compares checkQuery results for data-changing tasks', async () => {
    const config = {
      setup: 'CREATE TABLE person(id INT, email TEXT);',
      referenceQuery:
        'DELETE FROM person WHERE id NOT IN (SELECT MIN(id) FROM person GROUP BY email);',
      checkQuery: 'SELECT id, email FROM person ORDER BY id;',
    };
    const seed = "INSERT INTO person VALUES (1, 'a@x'), (2, 'b@x'), (3, 'a@x');";
    const good = await runOneCase(
      {
        ...config,
        userQuery:
          'DELETE FROM person WHERE id IN (SELECT p.id FROM person p JOIN person q ON p.email = q.email AND p.id > q.id); SELECT 1;',
      },
      seed,
    );
    expect(good.pass).toBe(true);

    const bad = await runOneCase({ ...config, userQuery: 'DELETE FROM person WHERE id = 1;' }, seed);
    expect(bad.pass).toBe(false);
    expect(bad.diff?.expected?.rows).toEqual([
      [1, 'a@x'],
      [2, 'b@x'],
    ]);
    expect(bad.diff?.user?.rows).toEqual([
      [2, 'b@x'],
      [3, 'a@x'],
    ]);
  });

  it('reports a failing checkQuery on the user side', async () => {
    const outcome = await runOneCase(
      {
        setup: 'CREATE TABLE person(id INT);',
        userQuery: 'DROP TABLE person;',
        referenceQuery: 'SELECT 1;',
        checkQuery: 'SELECT id FROM person;',
      },
      '',
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.message).toBe('Check query failed: no such table: person');
  });

  it('supports REGEXP with JavaScript syntax', async () => {
    const outcome = await runOneCase(
      {
        userQuery: "SELECT id, name FROM users WHERE name REGEXP '^[AB]' ORDER BY id;",
      },
      twoUsers,
    );
    expect(outcome.pass).toBe(true);
    expect(await scalar("SELECT 'Abc' REGEXP '^a'")).toBe(0);
    expect(await scalar('SELECT NULL REGEXP \'a\'')).toBeNull();
  });

  it('reports an invalid REGEXP pattern as a SQL error', async () => {
    const outcome = await runOneCase(
      { userQuery: "SELECT id, name FROM users WHERE name REGEXP '(';" },
      twoUsers,
    );
    expect(outcome.pass).toBe(false);
    expect(outcome.message).toMatch(/^REGEXP: Invalid regular expression/);
  });

  it('provides math functions missing from the sql.js build', async () => {
    expect(await scalar('SELECT ln(1)')).toBe(0);
    expect(await scalar('SELECT log2(8)')).toBe(3);
    expect(await scalar('SELECT pow(2, 10)')).toBe(1024);
    expect(await scalar('SELECT mod(7, 3)')).toBe(1);
    expect(await scalar('SELECT mod(7, 0)')).toBeNull();
    expect(await scalar('SELECT trunc(-2.7)')).toBe(-2);
    expect(await scalar('SELECT ceiling(2.1)')).toBe(3);
    expect(await scalar('SELECT ln(0)')).toBeNull();
  });

  it('keeps the math functions that sql.js already has', async () => {
    expect(await scalar('SELECT sqrt(16)')).toBe(4);
    expect(await scalar('SELECT power(2, 3)')).toBe(8);
    expect(await scalar('SELECT floor(2.5) + ceil(2.1)')).toBe(5);
    expect(await scalar('SELECT log10(100)')).toBe(2);
    expect(await scalar('SELECT round(log(exp(2)), 6)')).toBe(2);
  });

  it('serializes BLOB cells as hex', async () => {
    expect(await scalar("SELECT x'00ff'")).toBe("X'00FF'");
  });

  it('reports broken test data as such', async () => {
    const outcome = await runOneCase({ userQuery: reference }, 'INSERT INTO nope VALUES (1);');
    expect(outcome.pass).toBe(false);
    expect(outcome.message).toBe('Test data SQL failed: no such table: nope');
  });

  it('runs the statement iterator to its end when a statement fails mid-step', async () => {
    const SQL = await loadSqlJsForSpecs();
    const db = createSqlitePracticeDatabase(SQL, '');
    const iterate = db.iterateStatements.bind(db);
    const results: IteratorResult<unknown>[] = [];
    vi.spyOn(db, 'iterateStatements').mockImplementation((sql: string) => {
      const statements = iterate(sql);
      const next = statements.next.bind(statements);
      statements.next = () => {
        const result = next();
        results.push(result);
        return result;
      };
      return statements;
    });
    try {
      expect(() =>
        runSqliteForLastResult(db, "SELECT 1 WHERE 'a' REGEXP '('; SELECT 2; SELECT 3;"),
      ).toThrow(/^REGEXP: /);
      expect(results.map((result) => result.done)).toEqual([false, false, false, true]);
    } finally {
      db.close();
    }
  });

  it('survives many cases with failing statements in one session', async () => {
    const SQL = await loadSqlJsForSpecs();
    const session = openSqlitePracticeSession(SQL, {
      setup,
      userQuery: "SELECT id FROM users WHERE name REGEXP '(';",
      referenceQuery: 'SELECT id FROM users;',
      orderMatters: false,
    });
    for (let i = 0; i < 30; i += 1) {
      const outcome = runSqlitePracticeCase(session, {
        seed: `INSERT INTO users VALUES(${i}, 'n${i}');`,
      });
      expect(outcome.pass).toBe(false);
      expect(outcome.diff?.expected?.rows).toEqual([[i]]);
    }
  });

  it('throws SqliteSetupError with the SQLite message for invalid setup', async () => {
    const SQL = await loadSqlJsForSpecs();
    const open = () =>
      openSqlitePracticeSession(SQL, {
        setup: 'CREATE TABLE broken(',
        userQuery: 'SELECT 1;',
        referenceQuery: 'SELECT 1;',
        orderMatters: false,
      });
    expect(open).toThrow(SqliteSetupError);
    expect(open).toThrow(/^Setup SQL failed: /);
  });
});
