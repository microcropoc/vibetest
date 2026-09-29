/** Masks an API key for display in lists (never log the raw key). */
export function maskApiKey(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length === 0) {
    return '(не задан)';
  }
  if (trimmed.length <= 4) {
    return '••••';
  }
  return `${'•'.repeat(Math.min(trimmed.length - 4, 12))}${trimmed.slice(-4)}`;
}
