import { TestBed } from '@angular/core/testing';

import type { SqliteCaseDiff } from '../../../execution/sqlite-result-table';

import { SqlResultDiffComponent } from './sql-result-diff';

async function render(diff: SqliteCaseDiff): Promise<HTMLElement> {
  await TestBed.configureTestingModule({ imports: [SqlResultDiffComponent] }).compileComponents();
  const fixture = TestBed.createComponent(SqlResultDiffComponent);
  fixture.componentRef.setInput('diff', diff);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

function side(root: HTMLElement, key: 'user' | 'expected'): HTMLElement {
  const element = root.querySelector(`[data-side="${key}"]`);
  if (!(element instanceof HTMLElement)) {
    throw new Error(`side ${key} not rendered`);
  }
  return element;
}

function cellTexts(element: HTMLElement): string[] {
  return Array.from(element.querySelectorAll('th, td'), (cell) => cell.textContent?.trim() ?? '');
}

describe('SqlResultDiffComponent', () => {
  it('shows the student and expected tables side by side', async () => {
    const root = await render({
      user: { columns: ['id', 'name'], rows: [[1, null]], firstRow: 0, rowCount: 1 },
      expected: { columns: ['id', 'name'], rows: [[1, 'Anna']], firstRow: 0, rowCount: 1 },
    });
    expect(side(root, 'user').textContent).toContain('Ваш результат');
    expect(cellTexts(side(root, 'user'))).toEqual(['№', 'id', 'name', '1', '1', 'NULL']);
    expect(side(root, 'user').querySelector('.sql-result-diff__cell--null')).not.toBeNull();
    expect(side(root, 'expected').textContent).toContain('Ожидается');
    expect(cellTexts(side(root, 'expected'))).toEqual(['№', 'id', 'name', '1', '1', 'Anna']);
  });

  it('numbers rows of a later window and highlights the first differing row', async () => {
    const root = await render({
      user: { columns: ['v'], rows: [[64], [0]], firstRow: 64, rowCount: 80 },
      expected: { columns: ['v'], rows: [[64], [66]], firstRow: 64, rowCount: 80 },
      mismatchRow: 65,
    });
    for (const key of ['user', 'expected'] as const) {
      const rows = side(root, key).querySelectorAll('tbody tr');
      expect(rows[0].querySelector('td')?.textContent?.trim()).toBe('65');
      expect(rows[0].classList).not.toContain('sql-result-diff__row--mismatch');
      expect(rows[1].querySelector('td')?.textContent?.trim()).toBe('66');
      expect(rows[1].classList).toContain('sql-result-diff__row--mismatch');
      expect(side(root, key).textContent).toContain('Показаны строки 65–66 из 80.');
    }
  });

  it('shows the SQL error instead of the student table', async () => {
    const root = await render({
      userError: 'no such column: nme',
      expected: { columns: ['name'], rows: [['Anna']], firstRow: 0, rowCount: 1 },
    });
    expect(side(root, 'user').textContent).toContain('Ошибка SQL: no such column: nme');
    expect(side(root, 'user').querySelector('table')).toBeNull();
    expect(cellTexts(side(root, 'expected'))).toEqual(['№', 'name', '1', 'Anna']);
  });

  it('marks empty results and truncated previews', async () => {
    const root = await render({
      user: { columns: ['id'], rows: [], firstRow: 0, rowCount: 0 },
      expected: { columns: ['id'], rows: [[1], [2]], firstRow: 0, rowCount: 75 },
    });
    expect(side(root, 'user').textContent).toContain('Нет строк');
    expect(side(root, 'user').textContent).not.toContain('Показаны строки');
    expect(side(root, 'expected').textContent).toContain('Показаны строки 1–2 из 75.');
  });

  it('explains a result without columns', async () => {
    const root = await render({
      user: { columns: [], rows: [], firstRow: 0, rowCount: 0 },
      expected: { columns: ['id'], rows: [[1]], firstRow: 0, rowCount: 1 },
    });
    expect(side(root, 'user').textContent).toContain('Запрос не вернул таблицу.');
  });
});
