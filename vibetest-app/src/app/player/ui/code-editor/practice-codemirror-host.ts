import { javascript } from '@codemirror/lang-javascript';
import { sql } from '@codemirror/lang-sql';
import { Annotation, Compartment, EditorState, type Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';

import { scrollCaretIntoView, type ClientBand } from '../../player-scroll';
import type { PracticeCodeEditorLanguage } from './practice-code-editor-language';
import { practiceCodeEditorSyntaxHighlighting } from './practice-codemirror-highlight';
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

function caretBand(view: EditorView): ClientBand | null {
  let coords: { readonly top: number; readonly bottom: number } | null;
  try {
    coords = view.coordsAtPos(view.state.selection.main.head);
  } catch {
    return null;
  }
  if (coords == null) {
    return null;
  }
  return { top: coords.top, bottom: coords.bottom };
}

function bindCaretFollow(view: EditorView, parent: HTMLElement): () => void {
  let removeViewportListeners: (() => void) | undefined;

  const reveal = (): void => {
    const caret = caretBand(view);
    if (caret == null) {
      return;
    }
    scrollCaretIntoView(caret, { element: view.contentDOM });
  };

  const onFocusIn = (): void => {
    parent.classList.add('code-editor--editing');
    reveal();
    const viewport = window.visualViewport;
    if (viewport != null && removeViewportListeners === undefined) {
      const onViewportChange = (): void => {
        reveal();
      };
      viewport.addEventListener('resize', onViewportChange);
      viewport.addEventListener('scroll', onViewportChange);
      removeViewportListeners = () => {
        viewport.removeEventListener('resize', onViewportChange);
        viewport.removeEventListener('scroll', onViewportChange);
        removeViewportListeners = undefined;
      };
    }
  };

  const onFocusOut = (): void => {
    parent.classList.remove('code-editor--editing');
    removeViewportListeners?.();
  };

  view.contentDOM.addEventListener('focusin', onFocusIn);
  view.contentDOM.addEventListener('focusout', onFocusOut);

  return () => {
    view.contentDOM.removeEventListener('focusin', onFocusIn);
    view.contentDOM.removeEventListener('focusout', onFocusOut);
    removeViewportListeners?.();
    parent.classList.remove('code-editor--editing');
  };
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
      practiceCodeEditorSyntaxHighlighting(),
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

  const themeObserver =
    typeof MutationObserver !== 'undefined'
      ? new MutationObserver(() => {
          view.requestMeasure();
        })
      : null;
  themeObserver?.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  view.contentDOM.setAttribute('role', 'textbox');
  view.contentDOM.setAttribute('aria-multiline', 'true');
  applyLabelledBy(view.contentDOM, options.labelledBy);

  const unbindCaretFollow = bindCaretFollow(view, parent);

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
      unbindCaretFollow();
      themeObserver?.disconnect();
      view.destroy();
    },
  };
}
