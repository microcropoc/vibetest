const FIRST_JSON_FENCE_PATTERN = /```json\s*\r?\n([\s\S]*?)\r?\n```/i;

/** Returns the first ```json fenced block in text, or undefined if none. */
export function extractFirstJsonFence(text: string): string | undefined {
  const match = FIRST_JSON_FENCE_PATTERN.exec(text);
  if (!match) {
    return undefined;
  }
  return `\`\`\`json\n${match[1]!.trim()}\n\`\`\``;
}
