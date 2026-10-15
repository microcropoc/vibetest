import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import type { Extension } from '@codemirror/state';
import { tags as t } from '@lezer/highlight';

/** Token colors via CSS variables — follow `data-theme` without reconfigure. */
export function practiceCodeEditorSyntaxHighlighting(): Extension {
  return syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.comment, color: 'var(--color-cm-comment)' },
      { tag: [t.string, t.special(t.string)], color: 'var(--color-cm-string)' },
      { tag: [t.keyword, t.modifier, t.controlKeyword], color: 'var(--color-cm-keyword)' },
      { tag: [t.number, t.bool, t.null], color: 'var(--color-cm-number)' },
      { tag: t.regexp, color: 'var(--color-cm-regexp)' },
      { tag: t.operator, color: 'var(--color-cm-operator)' },
      {
        tag: [t.variableName, t.definition(t.variableName), t.local(t.variableName)],
        color: 'var(--color-cm-variable)',
      },
      { tag: [t.propertyName, t.typeName], color: 'var(--color-cm-property)' },
      { tag: t.punctuation, color: 'var(--color-cm-punctuation)' },
    ]),
  );
}
