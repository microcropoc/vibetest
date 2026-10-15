import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

/** Theme aligned with app CSS variables (light / dark / eink via data-theme). */
export function practiceCodeEditorTheme(): Extension {
  return EditorView.theme({
    '&': {
      backgroundColor: 'var(--color-bg)',
      color: 'var(--color-text)',
      minHeight: '8rem',
    },
    '.cm-scroller': {
      minHeight: '8rem',
    },
    '&.cm-focused': {
      outline: '2px solid var(--color-accent)',
      outlineOffset: '-1px',
    },
    '.cm-content, .cm-gutters': {
      fontFamily: 'var(--font-code-family)',
      fontSize: 'var(--font-code-size)',
    },
    '.cm-content': {
      lineHeight: '1.45',
      caretColor: 'var(--color-text)',
    },
    '.cm-gutters': {
      backgroundColor: 'var(--color-bg-muted)',
      color: 'var(--color-text-subtle)',
      borderRight: '1px solid var(--color-border-strong)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'var(--color-bg-subtle)',
    },
    '.cm-activeLine': {
      backgroundColor: 'var(--color-bg-subtle)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'var(--color-bg-highlight) !important',
    },
    '.cm-cursor': {
      borderLeftColor: 'var(--color-text)',
    },
  });
}
