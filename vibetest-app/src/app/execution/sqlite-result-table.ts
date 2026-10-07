/** One cell of a SQL result: INTEGER/REAL → number, TEXT → string, NULL → null, BLOB → "X'HEX'". */
export type SqliteCell = number | string | null;

export interface SqliteResultTable {
  readonly columns: readonly string[];
  readonly rows: readonly (readonly SqliteCell[])[];
}

/**
 * Window of a result shown to the student: at most `SQLITE_RESULT_PREVIEW_ROWS` rows starting at the
 * 0-based `firstRow` of the full result; `rowCount` is the full size.
 */
export interface SqliteResultPreview extends SqliteResultTable {
  readonly firstRow: number;
  readonly rowCount: number;
}

/** Why a case failed: both results (when they ran) and the SQL error of the student's query. */
export interface SqliteCaseDiff {
  readonly user?: SqliteResultPreview;
  readonly expected?: SqliteResultPreview;
  readonly userError?: string;
  /** 0-based row of the full results that differs first (ordered comparison only). */
  readonly mismatchRow?: number;
}

export interface SqliteCompareOptions {
  readonly orderMatters: boolean;
  readonly checkColumnNames?: boolean;
  readonly floatTolerance?: number;
}

export type SqliteTableComparison =
  | { readonly pass: true }
  | { readonly pass: false; readonly message: string; readonly mismatchRow?: number };

export const SQLITE_RESULT_PREVIEW_ROWS = 50;

/** Rows shown above the first differing row when it lies beyond the first preview window. */
export const SQLITE_RESULT_PREVIEW_CONTEXT_ROWS = 5;

export const EMPTY_SQLITE_RESULT_TABLE: SqliteResultTable = { columns: [], rows: [] };

const QUERY_MISMATCH_MESSAGE = 'Query results do not match';

function blobToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, '0');
  }
  return `X'${hex.toUpperCase()}'`;
}

/** Normalizes a raw sql.js value into a cell that survives `postMessage` and JSON. */
export function sqliteCellFromValue(value: unknown): SqliteCell {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : String(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (value instanceof Uint8Array) {
    return blobToHex(value);
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return String(value);
}

/** First preview row that keeps `mismatchRow` (if any) visible, with a few rows of context above it. */
export function sqlitePreviewFirstRow(mismatchRow: number | undefined): number {
  if (mismatchRow === undefined || mismatchRow < SQLITE_RESULT_PREVIEW_ROWS) {
    return 0;
  }
  return mismatchRow - SQLITE_RESULT_PREVIEW_CONTEXT_ROWS;
}

export function previewSqliteResultTable(
  table: SqliteResultTable,
  firstRow = 0,
  limit: number = SQLITE_RESULT_PREVIEW_ROWS,
): SqliteResultPreview {
  const start = Math.min(firstRow, table.rows.length);
  return {
    columns: table.columns,
    rows: table.rows.slice(start, start + limit),
    firstRow: start,
    rowCount: table.rows.length,
  };
}

function cellRank(cell: SqliteCell): number {
  if (cell === null) {
    return 0;
  }
  return typeof cell === 'number' ? 1 : 2;
}

function compareCells(a: SqliteCell, b: SqliteCell): number {
  const rankDiff = cellRank(a) - cellRank(b);
  if (rankDiff !== 0) {
    return rankDiff;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a < b ? -1 : a > b ? 1 : 0;
  }
  return 0;
}

function compareRows(a: readonly SqliteCell[], b: readonly SqliteCell[]): number {
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) {
    const diff = compareCells(a[i], b[i]);
    if (diff !== 0) {
      return diff;
    }
  }
  return a.length - b.length;
}

function cellsEqual(a: SqliteCell, b: SqliteCell, floatTolerance: number | undefined): boolean {
  if (typeof a === 'number' && typeof b === 'number' && floatTolerance !== undefined) {
    // Slack for binary rounding, so a difference of exactly `floatTolerance` still passes.
    return Math.abs(a - b) <= floatTolerance * (1 + 1e-9);
  }
  return a === b;
}

function rowsEqual(
  a: readonly SqliteCell[],
  b: readonly SqliteCell[],
  floatTolerance: number | undefined,
): boolean {
  return a.length === b.length && a.every((cell, index) => cellsEqual(cell, b[index], floatTolerance));
}

type SqliteRow = readonly SqliteCell[];

function sortedRowsEqual(
  user: readonly SqliteRow[],
  reference: readonly SqliteRow[],
  floatTolerance: number | undefined,
): boolean {
  const sortedUser = [...user].sort(compareRows);
  const sortedReference = [...reference].sort(compareRows);
  return sortedUser.every((row, index) => rowsEqual(row, sortedReference[index], floatTolerance));
}

/** Rows can match within a tolerance only if their NULL and text cells are identical. */
function rowShapeKey(row: SqliteRow): string {
  return JSON.stringify(row.map((cell) => (typeof cell === 'number' ? 0 : cell)));
}

function groupRowsByShape(rows: readonly SqliteRow[]): Map<string, SqliteRow[]> {
  const groups = new Map<string, SqliteRow[]>();
  for (const row of rows) {
    const key = rowShapeKey(row);
    const group = groups.get(key);
    if (group === undefined) {
      groups.set(key, [row]);
    } else {
      group.push(row);
    }
  }
  return groups;
}

/** Bipartite matching (Kuhn): every user row gets its own reference row within the tolerance. */
function hasPerfectToleranceMatching(
  user: readonly SqliteRow[],
  reference: readonly SqliteRow[],
  floatTolerance: number,
): boolean {
  const owner = new Array<number>(reference.length).fill(-1);
  const assign = (userIndex: number, visited: boolean[]): boolean => {
    for (let referenceIndex = 0; referenceIndex < reference.length; referenceIndex += 1) {
      if (visited[referenceIndex] || !rowsEqual(user[userIndex], reference[referenceIndex], floatTolerance)) {
        continue;
      }
      visited[referenceIndex] = true;
      if (owner[referenceIndex] === -1 || assign(owner[referenceIndex], visited)) {
        owner[referenceIndex] = userIndex;
        return true;
      }
    }
    return false;
  };
  return user.every((_, userIndex) => assign(userIndex, new Array<boolean>(reference.length).fill(false)));
}

/**
 * Multiset equality: exact via sorting; with a tolerance the sorted pairing can miss a valid one,
 * so rows of the same shape fall back to a full matching.
 */
function unorderedRowsEqual(
  user: readonly SqliteRow[],
  reference: readonly SqliteRow[],
  floatTolerance: number | undefined,
): boolean {
  if (sortedRowsEqual(user, reference, floatTolerance)) {
    return true;
  }
  if (floatTolerance === undefined) {
    return false;
  }
  const userGroups = groupRowsByShape(user);
  const referenceGroups = groupRowsByShape(reference);
  if (userGroups.size !== referenceGroups.size) {
    return false;
  }
  for (const [key, userRows] of userGroups) {
    const referenceRows = referenceGroups.get(key);
    if (
      referenceRows === undefined ||
      referenceRows.length !== userRows.length ||
      !hasPerfectToleranceMatching(userRows, referenceRows, floatTolerance)
    ) {
      return false;
    }
  }
  return true;
}

function columnList(columns: readonly string[]): string {
  return `(${columns.join(', ')})`;
}

/** Compares the student's result with the reference one; the message explains the first difference. */
export function compareSqliteResultTables(
  user: SqliteResultTable,
  reference: SqliteResultTable,
  options: SqliteCompareOptions,
): SqliteTableComparison {
  if (options.checkColumnNames) {
    const sameNames =
      user.columns.length === reference.columns.length &&
      user.columns.every(
        (name, index) => name.toLowerCase() === reference.columns[index].toLowerCase(),
      );
    if (!sameNames) {
      return {
        pass: false,
        message: `Column names differ: expected ${columnList(reference.columns)}, got ${columnList(user.columns)}`,
      };
    }
  }

  if (user.rows.length !== reference.rows.length) {
    return {
      pass: false,
      message: `Row count differs: expected ${reference.rows.length}, got ${user.rows.length}`,
    };
  }
  if (user.rows.length > 0 && user.columns.length !== reference.columns.length) {
    return {
      pass: false,
      message: `Column count differs: expected ${reference.columns.length}, got ${user.columns.length}`,
    };
  }

  if (!options.orderMatters) {
    return unorderedRowsEqual(user.rows, reference.rows, options.floatTolerance)
      ? { pass: true }
      : { pass: false, message: QUERY_MISMATCH_MESSAGE };
  }
  const mismatchRow = user.rows.findIndex(
    (row, index) => !rowsEqual(row, reference.rows[index], options.floatTolerance),
  );
  return mismatchRow === -1
    ? { pass: true }
    : { pass: false, message: `${QUERY_MISMATCH_MESSAGE} (row ${mismatchRow + 1})`, mismatchRow };
}
