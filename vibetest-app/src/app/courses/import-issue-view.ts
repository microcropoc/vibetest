import type { ImportIssue, ImportValidationStage } from './import-types';

export function importStageLabel(
  stage: ImportValidationStage | 'replace-required' | 'target',
): string {
  switch (stage) {
    case 'json':
      return 'Разбор JSON';
    case 'zod':
      return 'Схема';
    case 'semantic':
      return 'Семантика';
    case 'practice':
      return 'Проверка практики';
    case 'replace-required':
      return 'Конфликт ID';
    case 'target':
      return 'Курс';
  }
}

export function formatImportIssue(issue: ImportIssue): string {
  return `${issue.path}: ${issue.message}`;
}
