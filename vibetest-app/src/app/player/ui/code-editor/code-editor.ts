import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';

import type { PracticeCodeEditorLanguage } from './practice-code-editor-language';
import type { PracticeCodeEditorHandle } from './practice-codemirror-host';

@Component({
  selector: 'app-code-editor',
  styleUrl: './code-editor.scss',
  templateUrl: './code-editor.html',
  host: {
    class: 'code-editor-host',
  },
})
export class CodeEditor {
  private readonly destroyRef = inject(DestroyRef);

  private readonly hostRef = viewChild.required<ElementRef<HTMLElement>>('host');

  readonly value = input('');
  readonly language = input.required<PracticeCodeEditorLanguage>();
  readonly readOnly = input(false);
  readonly labelledBy = input<string | undefined>(undefined);

  readonly valueChange = output<string>();

  private readonly editorHandle = signal<PracticeCodeEditorHandle | undefined>(undefined);

  private destroyed = false;

  constructor() {
    afterNextRender(() => {
      void import('./practice-codemirror-host').then(({ mountPracticeCodeEditor }) => {
        if (this.destroyed) {
          return;
        }
        const host = this.hostRef().nativeElement;
        const handle = mountPracticeCodeEditor(host, {
          initialDoc: this.value(),
          language: this.language(),
          readOnly: this.readOnly(),
          labelledBy: this.labelledBy(),
          onDocChange: (text) => this.valueChange.emit(text),
        });
        if (this.destroyed) {
          handle.destroy();
          return;
        }
        this.editorHandle.set(handle);
      });
    });

    effect(() => {
      const handle = this.editorHandle();
      if (handle === undefined) {
        return;
      }
      handle.setDoc(this.value());
      handle.setReadOnly(this.readOnly());
      handle.setLanguage(this.language());
      handle.setLabelledBy(this.labelledBy());
    });

    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.editorHandle()?.destroy();
      this.editorHandle.set(undefined);
    });
  }
}
