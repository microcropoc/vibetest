import { marked } from 'marked';

/** Trusted course markdown → HTML (no sanitization; author responsibility). */
export function renderMarkdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

/** Inline-only markdown (e.g. quiz options, SVG caption). */
export function renderInlineMarkdownToHtml(markdown: string): string {
  return marked.parseInline(markdown, { async: false }) as string;
}
