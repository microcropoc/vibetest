export type CopyTextToClipboardResult = 'copied' | 'unavailable' | 'failed';

export async function copyTextToClipboard(text: string): Promise<CopyTextToClipboardResult> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
    return 'unavailable';
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
