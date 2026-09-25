import { describe, expect, it } from 'vitest';

import { mountPracticeCodeEditor } from './practice-codemirror-host';

describe('mountPracticeCodeEditor', () => {
  it('mounts, accepts external doc sync, and destroys', () => {
    const parent = document.createElement('div');
    const changes: string[] = [];
    const handle = mountPracticeCodeEditor(parent, {
      initialDoc: 'a',
      language: 'plain',
      readOnly: false,
      onDocChange: (v) => changes.push(v),
    });

    expect(parent.querySelector('.cm-editor')).not.toBeNull();

    handle.setDoc('b');
    expect(changes).toEqual([]);

    handle.setReadOnly(true);
    handle.setLanguage('javascript');
    handle.setLabelledBy('label-a');
    expect(parent.querySelector('.cm-content')?.getAttribute('aria-labelledby')).toBe('label-a');
    handle.setLabelledBy('label-b');
    expect(parent.querySelector('.cm-content')?.getAttribute('aria-labelledby')).toBe('label-b');
    handle.setLabelledBy(undefined);
    expect(parent.querySelector('.cm-content')?.hasAttribute('aria-labelledby')).toBe(false);
    handle.destroy();
    expect(parent.querySelector('.cm-editor')).toBeNull();
  });
});
