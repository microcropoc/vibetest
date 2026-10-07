import { Component, computed, input } from '@angular/core';

import type {
  SqliteCaseDiff,
  SqliteCell,
  SqliteResultPreview,
} from '../../../execution/sqlite-result-table';

interface SqlResultSide {
  readonly key: 'user' | 'expected';
  readonly title: string;
  readonly table?: SqliteResultPreview;
  readonly error?: string;
}

@Component({
  selector: 'app-sql-result-diff',
  templateUrl: './sql-result-diff.html',
  styleUrl: './sql-result-diff.scss',
})
export class SqlResultDiffComponent {
  readonly diff = input.required<SqliteCaseDiff>();

  protected readonly mismatchRow = computed(() => this.diff().mismatchRow);

  protected readonly sides = computed((): readonly SqlResultSide[] => {
    const diff = this.diff();
    return [
      { key: 'user', title: 'Ваш результат', table: diff.user, error: diff.userError },
      { key: 'expected', title: 'Ожидается', table: diff.expected },
    ];
  });

  protected formatCell(cell: SqliteCell): string {
    return cell === null ? 'NULL' : String(cell);
  }
}
