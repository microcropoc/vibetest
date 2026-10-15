export type ReadTextFromClipboardResult =
  | { readonly status: 'read'; readonly text: string }
  | { readonly status: 'unavailable' }
  | { readonly status: 'failed' };

export async function readTextFromClipboard(): Promise<ReadTextFromClipboardResult> {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.readText) {
    return { status: 'unavailable' };
  }
  try {
    const text = await navigator.clipboard.readText();
    return { status: 'read', text };
  } catch {
    return { status: 'failed' };
  }
}

export const CLIPBOARD_READ_UNAVAILABLE_MESSAGE =
  'Буфер обмена недоступен в этом браузере.';

export const CLIPBOARD_READ_FAILED_MESSAGE =
  'Нет доступа к буферу обмена. Вставьте текст вручную.';

/** Импорт JSON: прежняя формулировка для полей курса/модуля. */
export const CLIPBOARD_READ_FAILED_JSON_MESSAGE =
  'Нет доступа к буферу обмена. Вставьте JSON вручную.';
