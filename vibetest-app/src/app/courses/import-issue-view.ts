import type { ImportIssue, ImportValidationStage } from './import-types';

export function importStageLabel(
  stage: ImportValidationStage | 'replace-required',
): string {
  switch (stage) {
    case 'json':
      return 'Разбор JSON';
    case 'zod':
      return 'Схема курса';
    case 'semantic':
      return 'Семантика';
    case 'practice':
      return 'Проверка практики';
    case 'replace-required':
      return 'Конфликт ID';
  }
}

export function formatImportIssue(issue: ImportIssue): string {
  return `${issue.path}: ${issue.message}`;
}
