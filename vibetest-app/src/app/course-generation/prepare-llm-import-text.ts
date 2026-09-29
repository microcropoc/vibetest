import { unwrapJsonImportText } from '../courses/unwrap-json-import-text';

import {
  extractFirstJsonFence,
  extractFirstPlainJsonFence,
  hasUnclosedJsonFence,
} from './extract-first-json-fence';
import { LLM_CONTEXT_LENGTH_HINT } from './llm-import-context-hint';

/** Normalizes LLM output to import-parse input (raw JSON or strict fence). */
export function prepareLlmImportText(rawContent: string): string {
  const trimmed = rawContent.trim();
  if (trimmed.length === 0) {
    throw new Error('Пустой ответ модели.');
  }

  try {
    return unwrapJsonImportText(trimmed);
  } catch {
    const jsonFence = extractFirstJsonFence(trimmed);
    if (jsonFence !== undefined) {
      return unwrapJsonImportText(jsonFence);
    }

    const plainJson = extractFirstPlainJsonFence(trimmed);
    if (plainJson !== undefined) {
      return plainJson;
    }

    if (hasUnclosedJsonFence(trimmed)) {
      throw new Error(`Блок \`\`\`json не закрыт — ответ обрезан. ${LLM_CONTEXT_LENGTH_HINT}`);
    }

    throw new Error(
      `Ответ не содержит JSON для импорта. ${LLM_CONTEXT_LENGTH_HINT}`,
    );
  }
}
