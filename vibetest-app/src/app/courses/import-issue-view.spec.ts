import { formatImportIssue, importStageLabel } from './import-issue-view';

describe('import-issue-view', () => {
  it('labels validation stages', () => {
    expect(importStageLabel('json')).toBe('Разбор JSON');
    expect(importStageLabel('zod')).toBe('Схема курса');
    expect(importStageLabel('semantic')).toBe('Семантика');
    expect(importStageLabel('practice')).toBe('Проверка практики');
    expect(importStageLabel('replace-required')).toBe('Конфликт ID');
  });

  it('formats issue lines', () => {
    expect(formatImportIssue({ path: 'modules.0', message: 'duplicate id' })).toBe(
      'modules.0: duplicate id',
    );
  });
});
