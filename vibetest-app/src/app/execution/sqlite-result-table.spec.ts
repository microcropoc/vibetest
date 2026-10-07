import {
  compareSqliteResultTables,
  previewSqliteResultTable,
  sqliteCellFromValue,
  sqlitePreviewFirstRow,
  type SqliteResultTable,
} from './sqlite-result-table';

function table(columns: readonly string[], rows: SqliteResultTable['rows']): SqliteResultTable {
  return { columns, rows };
}

describe('compareSqliteResultTables', () => {
  it('respects row order only when orderMatters', () => {
    const user = table(['id'], [[2], [1]]);
    const reference = table(['id'], [[1], [2]]);
    expect(compareSqliteResultTables(user, reference, { orderMatters: false }).pass).toBe(true);
    expect(compareSqliteResultTables(user, reference, { orderMatters: true })).toEqual({
      pass: false,
      message: 'Query results do not match (row 1)',
      mismatchRow: 0,
    });
  });

  it('pairs rows within floatTolerance even when sorting would pair them wrongly', () => {
    const user = table(['v', 'name'], [[1.0, 'bob'], [2.0, 'ann']]);
    const reference = table(['v', 'name'], [[1.5, 'ann'], [1.6, 'bob']]);
    expect(
      compareSqliteResultTables(user, reference, { orderMatters: false, floatTolerance: 0.6 }).pass,
    ).toBe(true);
    expect(
      compareSqliteResultTables(user, reference, { orderMatters: false, floatTolerance: 0.4 }).pass,
    ).toBe(false);
  });

  it('finds a full pairing within floatTolerance across several numeric columns', () => {
    const user = table(['x', 'y'], [[0, 0], [1, 1]]);
    const reference = table(['x', 'y'], [[0.5, 1], [0.6, 0]]);
    expect(
      compareSqliteResultTables(user, reference, { orderMatters: false, floatTolerance: 0.6 }).pass,
    ).toBe(true);
    expect(
      compareSqliteResultTables(
        table(['x'], [[0], [0.1]]),
        table(['x'], [[0.05], [1]]),
        { orderMatters: false, floatTolerance: 0.2 },
      ),
    ).toEqual({ pass: false, message: 'Query results do not match' });
  });

  it('compares rows as a multiset when order does not matter', () => {
    const result = compareSqliteResultTables(
      table(['id'], [[1], [1]]),
      table(['id'], [[1], [2]]),
      { orderMatters: false },
    );
    expect(result).toEqual({ pass: false, message: 'Query results do not match' });
  });

  it('sorts mixed NULL, numbers and text consistently', () => {
    const user = table(['v'], [['b'], [null], [2], ['a'], [1]]);
    const reference = table(['v'], [[1], ['a'], [null], ['b'], [2]]);
    expect(compareSqliteResultTables(user, reference, { orderMatters: false }).pass).toBe(true);
  });

  it('reports a different row count', () => {
    expect(
      compareSqliteResultTables(table(['id'], [[1]]), table(['id'], [[1], [2]]), {
        orderMatters: false,
      }),
    ).toEqual({ pass: false, message: 'Row count differs: expected 2, got 1' });
  });

  it('reports a different column count when there are rows', () => {
    expect(
      compareSqliteResultTables(table(['id', 'name'], [[1, 'A']]), table(['id'], [[1]]), {
        orderMatters: false,
      }),
    ).toEqual({ pass: false, message: 'Column count differs: expected 1, got 2' });
  });

  it('ignores column names by default and checks them case-insensitively when asked', () => {
    const user = table(['ID', 'Name'], [[1, 'A']]);
    const reference = table(['id', 'name'], [[1, 'A']]);
    expect(compareSqliteResultTables(user, reference, { orderMatters: false }).pass).toBe(true);
    expect(
      compareSqliteResultTables(user, reference, { orderMatters: false, checkColumnNames: true })
        .pass,
    ).toBe(true);
    expect(
      compareSqliteResultTables(table(['id', 'title'], [[1, 'A']]), reference, {
        orderMatters: false,
        checkColumnNames: true,
      }),
    ).toEqual({
      pass: false,
      message: 'Column names differ: expected (id, name), got (id, title)',
    });
  });

  it('checks column names of empty results only with checkColumnNames', () => {
    const user = table(['a'], []);
    const reference = table(['b', 'c'], []);
    expect(compareSqliteResultTables(user, reference, { orderMatters: true }).pass).toBe(true);
    expect(
      compareSqliteResultTables(user, reference, { orderMatters: true, checkColumnNames: true })
        .pass,
    ).toBe(false);
  });

  it('applies floatTolerance to numbers only', () => {
    const reference = table(['avg', 'name'], [[2.33333, 'A']]);
    const close = table(['avg', 'name'], [[2.333333333, 'A']]);
    expect(compareSqliteResultTables(close, reference, { orderMatters: true }).pass).toBe(false);
    expect(
      compareSqliteResultTables(close, reference, { orderMatters: true, floatTolerance: 1e-4 })
        .pass,
    ).toBe(true);
    expect(
      compareSqliteResultTables(table(['v'], [[2.35]]), table(['v'], [[2.34]]), {
        orderMatters: true,
        floatTolerance: 0.01,
      }).pass,
    ).toBe(true);
    expect(
      compareSqliteResultTables(table(['v'], [['2.3333']]), table(['v'], [['2.33333']]), {
        orderMatters: true,
        floatTolerance: 0.1,
      }).pass,
    ).toBe(false);
  });

  it('treats integer and real values with the same number as equal', () => {
    expect(
      compareSqliteResultTables(table(['v'], [[1]]), table(['v'], [[1.0]]), { orderMatters: true })
        .pass,
    ).toBe(true);
  });
});

describe('sqliteCellFromValue', () => {
  it('keeps numbers, text and NULL, and turns BLOB into hex', () => {
    expect(sqliteCellFromValue(3.5)).toBe(3.5);
    expect(sqliteCellFromValue('x')).toBe('x');
    expect(sqliteCellFromValue(null)).toBeNull();
    expect(sqliteCellFromValue(new Uint8Array([0, 15, 255]))).toBe("X'000FFF'");
  });
});

describe('previewSqliteResultTable', () => {
  it('caps rows and keeps the full row count', () => {
    const rows = Array.from({ length: 60 }, (_, i) => [i]);
    const preview = previewSqliteResultTable(table(['n'], rows));
    expect(preview.rows).toHaveLength(50);
    expect(preview.firstRow).toBe(0);
    expect(preview.rowCount).toBe(60);
    expect(preview.columns).toEqual(['n']);
  });

  it('starts the window a few rows above a mismatch beyond the first page', () => {
    const rows = Array.from({ length: 200 }, (_, i) => [i]);
    expect(sqlitePreviewFirstRow(undefined)).toBe(0);
    expect(sqlitePreviewFirstRow(49)).toBe(0);
    expect(sqlitePreviewFirstRow(120)).toBe(115);
    const preview = previewSqliteResultTable(table(['n'], rows), 115);
    expect(preview.firstRow).toBe(115);
    expect(preview.rows[0]).toEqual([115]);
    expect(preview.rows).toHaveLength(50);
    expect(previewSqliteResultTable(table(['n'], rows.slice(0, 3)), 10)).toMatchObject({
      firstRow: 3,
      rows: [],
    });
  });
});
