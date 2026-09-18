/** One result row: JSON array of cell values in sql.js column order. */
export function serializeSqlRow(values: readonly unknown[]): string {
  return JSON.stringify([...values]);
}

export function collectRowsFromExecResults(
  results: ReadonlyArray<{ readonly values: readonly (readonly unknown[])[] }>,
): readonly string[] {
  const rows: string[] = [];
  for (const set of results) {
    for (const row of set.values) {
      rows.push(serializeSqlRow(row));
    }
  }
  return rows;
}

export function compareSqliteResultRows(
  userRows: readonly string[],
  referenceRows: readonly string[],
  orderMatters: boolean,
): boolean {
  if (orderMatters) {
    return (
      userRows.length === referenceRows.length &&
      userRows.every((row, index) => row === referenceRows[index])
    );
  }
  if (userRows.length !== referenceRows.length) {
    return false;
  }
  const sortedUser = [...userRows].sort();
  const sortedReference = [...referenceRows].sort();
  return sortedUser.every((row, index) => row === sortedReference[index]);
}
