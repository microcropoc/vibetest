import { unwrapJsonImportText } from '../courses/unwrap-json-import-text';

import { extractFirstJsonFence } from './extract-first-json-fence';

/** Normalizes LLM output to import-parse input (raw JSON or strict fence). */
export function prepareLlmImportText(rawContent: string): string {
  const trimmed = rawContent.trim();
  if (trimmed.length === 0) {
    throw new Error('Пустой ответ модели.');
  }

  try {
    return unwrapJsonImportText(trimmed);
  } catch {
    const fence = extractFirstJsonFence(trimmed);
    if (fence === undefined) {
      throw new Error(
        'Ответ не содержит JSON или блок ```json … ``` для импорта.',
      );
    }
    return unwrapJsonImportText(fence);
  }
}
