import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { Annotation, Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';

import type { PracticeCodeEditorLanguage } from './practice-code-editor-language';
import { practiceCodeEditorTheme } from './practice-codemirror-theme';

const externalDocChange = Annotation.define<boolean>();

export interface PracticeCodeEditorMountOptions {
  readonly initialDoc: string;
  readonly language: PracticeCodeEditorLanguage;
  readonly readOnly: boolean;
  readonly labelledBy?: string;
  readonly onDocChange: (value: string) => void;
}

export interface PracticeCodeEditorHandle {
  setDoc(text: string): void;
  setReadOnly(readOnly: boolean): void;
  setLanguage(language: PracticeCodeEditorLanguage): void;
  setLabelledBy(labelledBy: string | undefined): void;
  destroy(): void;
}

function applyLabelledBy(contentDOM: HTMLElement, labelledBy: string | undefined): void {
  const id = labelledBy?.trim();
  if (id === undefined || id === '') {
    contentDOM.removeAttribute('aria-labelledby');
    return;
  }
  contentDOM.setAttribute('aria-labelledby', id);
}

function languageExtension(language: PracticeCodeEditorLanguage): Extension {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'sql':
      return sql();
    case 'plain':
      return [];
  }
}

export function mountPracticeCodeEditor(
  parent: HTMLElement,
  options: PracticeCodeEditorMountOptions,
): PracticeCodeEditorHandle {
  const languageCompartment = new Compartment();
  const readOnlyCompartment = new Compartment();

  const state = EditorState.create({
    doc: options.initialDoc,
    extensions: [
      basicSetup,
      practiceCodeEditorTheme(),
      languageCompartment.of(languageExtension(options.language)),
      readOnlyCompartment.of(EditorState.readOnly.of(options.readOnly)),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) {
          return;
        }
        const fromExternal = update.transactions.some((tr) => tr.annotation(externalDocChange));
        if (fromExternal) {
          return;
        }
        options.onDocChange(update.state.doc.toString());
      }),
    ],
  });

  const view = new EditorView({ state, parent });

  view.contentDOM.setAttribute('role', 'textbox');
  view.contentDOM.setAttribute('aria-multiline', 'true');
  applyLabelledBy(view.contentDOM, options.labelledBy);

  return {
    setDoc(text: string): void {
      const current = view.state.doc.toString();
      if (current === text) {
        return;
      }
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
        annotations: externalDocChange.of(true),
      });
    },
    setReadOnly(readOnly: boolean): void {
      view.dispatch({
        effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
      });
    },
    setLanguage(language: PracticeCodeEditorLanguage): void {
      view.dispatch({
        effects: languageCompartment.reconfigure(languageExtension(language)),
      });
    },
    setLabelledBy(labelledBy: string | undefined): void {
      applyLabelledBy(view.contentDOM, labelledBy);
    },
    destroy(): void {
      view.destroy();
    },
  };
}
