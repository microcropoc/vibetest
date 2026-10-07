import { loadSqlJsForSpecs } from '../courses/practice-reference-in-process-runners.spec-helper';

import {
  closeSqlitePracticeSession,
  openSqlitePracticeSession,
  runSqlitePracticeCase,
  SqliteSetupError,
} from './sqlite-practice-core';

const setup = 'CREATE TABLE users(id INT, name TEXT);';
const reset = 'DELETE FROM users;';
const reference = 'SELECT id, name FROM users ORDER BY id;';

describe('sqlite practice core (real sql.js)', () => {
  it('passes when user rows match reference rows', async () => {
    const SQL = await loadSqlJsForSpecs();
    const session = openSqlitePracticeSession(SQL, {
      setup,
      userQuery: 'SELECT * FROM users ORDER BY id;',
      referenceQuery: reference,
      orderMatters: true,
    });
    try {
      const outcome = runSqlitePracticeCase(session, {
        seed: "INSERT INTO users VALUES(1, 'Anna'), (2, 'Bob');",
        userReset: reset,
        referenceReset: reset,
      });
      expect(outcome.pass).toBe(true);
      expect(outcome.userRows).toEqual(['[1,"Anna"]', '[2,"Bob"]']);
    } finally {
      closeSqlitePracticeSession(session);
    }
  });

  it('resets data between cases', async () => {
    const SQL = await loadSqlJsForSpecs();
    const session = openSqlitePracticeSession(SQL, {
      setup,
      userQuery: 'SELECT COUNT(*) FROM users;',
      referenceQuery: 'SELECT COUNT(*) FROM users;',
      orderMatters: false,
    });
    try {
      runSqlitePracticeCase(session, {
        seed: "INSERT INTO users VALUES(1, 'Anna');",
        userReset: reset,
        referenceReset: reset,
      });
      const second = runSqlitePracticeCase(session, {
        seed: "INSERT INTO users VALUES(2, 'Bob');",
        userReset: reset,
        referenceReset: reset,
      });
      expect(second.userRows).toEqual(['[1]']);
    } finally {
      closeSqlitePracticeSession(session);
    }
  });

  it('fails with a mismatch message when rows differ', async () => {
    const SQL = await loadSqlJsForSpecs();
    const session = openSqlitePracticeSession(SQL, {
      setup,
      userQuery: 'SELECT id, name FROM users WHERE id = 1;',
      referenceQuery: reference,
      orderMatters: true,
    });
    try {
      const outcome = runSqlitePracticeCase(session, {
        seed: "INSERT INTO users VALUES(1, 'Anna'), (2, 'Bob');",
      });
      expect(outcome.pass).toBe(false);
      expect(outcome.message).toBe('Query results do not match');
    } finally {
      closeSqlitePracticeSession(session);
    }
  });

  it('reports a SQL error in the user query as a failed case', async () => {
    const SQL = await loadSqlJsForSpecs();
    const session = openSqlitePracticeSession(SQL, {
      setup,
      userQuery: 'SELEC id FROM users;',
      referenceQuery: reference,
      orderMatters: false,
    });
    try {
      const outcome = runSqlitePracticeCase(session, { seed: '' });
      expect(outcome.pass).toBe(false);
      expect(outcome.message).toContain('syntax error');
    } finally {
      closeSqlitePracticeSession(session);
    }
  });

  it('throws SqliteSetupError with the SQLite message for invalid setup', async () => {
    const SQL = await loadSqlJsForSpecs();
    expect(() =>
      openSqlitePracticeSession(SQL, {
        setup: 'CREATE TABLE broken(',
        userQuery: 'SELECT 1;',
        referenceQuery: 'SELECT 1;',
        orderMatters: false,
      }),
    ).toThrow(SqliteSetupError);
    expect(() =>
      openSqlitePracticeSession(SQL, {
        setup: 'CREATE TABLE broken(',
        userQuery: 'SELECT 1;',
        referenceQuery: 'SELECT 1;',
        orderMatters: false,
      }),
    ).toThrow(/^Setup SQL failed: /);
  });
});
