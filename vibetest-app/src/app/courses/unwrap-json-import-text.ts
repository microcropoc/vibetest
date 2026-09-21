const JSON_FENCE_PATTERN = /^```json\s*\r?\n([\s\S]*?)\r?\n```\s*$/i;

export class UnwrapJsonImportTextError extends Error {
  override readonly name = 'UnwrapJsonImportTextError';

  constructor(message: string) {
    super(message);
  }
}

/** Accepts raw JSON or a single ```json fenced block (whole input, optional outer whitespace). */
export function unwrapJsonImportText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new UnwrapJsonImportTextError('Пустой ввод.');
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  const match = JSON_FENCE_PATTERN.exec(trimmed);
  if (match) {
    return match[1]!.trim();
  }

  throw new UnwrapJsonImportTextError(
    'Ожидается JSON или один блок ```json … ``` без текста до и после.',
  );
}
