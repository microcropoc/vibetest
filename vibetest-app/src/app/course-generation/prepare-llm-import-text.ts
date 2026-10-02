import { unwrapJsonImportText } from '../courses/unwrap-json-import-text';

import {
  extractFirstJsonFence,
  extractFirstPlainJsonFence,
  hasUnclosedJsonFence,
} from './extract-first-json-fence';
import { LLM_CONTEXT_LENGTH_HINT } from './llm-import-context-hint';

function withHint(message: string, hint: string | null): string {
  return hint === null ? message : `${message} ${hint}`;
}

/**
 * Normalizes LLM output to import-parse input (raw JSON or strict fence).
 * `contextHint` is appended to "no JSON" / "truncated" errors; `null` for answers from an external chat.
 */
export function prepareLlmImportText(
  rawContent: string,
  contextHint: string | null = LLM_CONTEXT_LENGTH_HINT,
): string {
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
      throw new Error(withHint('Блок ```json не закрыт — ответ обрезан.', contextHint));
    }

    throw new Error(withHint('Ответ не содержит JSON для импорта.', contextHint));
  }
}
