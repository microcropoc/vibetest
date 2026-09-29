const FIRST_JSON_FENCE_PATTERN = /```json\s*\r?\n([\s\S]*?)\r?\n```/i;
const FIRST_PLAIN_FENCE_PATTERN = /```(?!json\b)\s*\r?\n(\{[\s\S]*?)\r?\n```/i;

/** Returns the first ```json fenced block in text, or undefined if none. */
export function extractFirstJsonFence(text: string): string | undefined {
  const match = FIRST_JSON_FENCE_PATTERN.exec(text);
  if (!match) {
    return undefined;
  }
  return `\`\`\`json\n${match[1]!.trim()}\n\`\`\``;
}

/** Inner JSON text from the first plain ``` fence whose body starts with `{`. */
export function extractFirstPlainJsonFence(text: string): string | undefined {
  const match = FIRST_PLAIN_FENCE_PATTERN.exec(text);
  if (!match) {
    return undefined;
  }
  return match[1]!.trim();
}

/** True when ```json appears but no closing fence follows. */
export function hasUnclosedJsonFence(text: string): boolean {
  const open = /```json\b/i.exec(text);
  if (open === null) {
    return false;
  }
  const afterOpen = text.slice(open.index + open[0].length);
  return !/\r?\n```(?:\s|$)/m.test(afterOpen);
}
