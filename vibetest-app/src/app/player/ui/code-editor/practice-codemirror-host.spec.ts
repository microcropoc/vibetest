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

  it('follows visualViewport resize and scroll only while focused', () => {
    const listeners = new Map<string, Set<EventListener>>();
    const viewport = {
      addEventListener(type: string, listener: EventListener): void {
        const bucket = listeners.get(type) ?? new Set<EventListener>();
        bucket.add(listener);
        listeners.set(type, bucket);
      },
      removeEventListener(type: string, listener: EventListener): void {
        listeners.get(type)?.delete(listener);
      },
    };
    const previous = Object.getOwnPropertyDescriptor(window, 'visualViewport');
    Object.defineProperty(window, 'visualViewport', {
      configurable: true,
      value: viewport,
    });

    const parent = document.createElement('div');
    const handle = mountPracticeCodeEditor(parent, {
      initialDoc: 'a',
      language: 'plain',
      readOnly: false,
      onDocChange: () => undefined,
    });
    const content = parent.querySelector('.cm-content');
    if (!(content instanceof HTMLElement)) {
      throw new Error('expected CodeMirror content');
    }

    content.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    expect(listeners.get('resize')?.size).toBe(1);
    expect(listeners.get('scroll')?.size).toBe(1);
    expect(parent.classList.contains('code-editor--editing')).toBe(true);

    content.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(listeners.get('resize')?.size).toBe(0);
    expect(listeners.get('scroll')?.size).toBe(0);
    expect(parent.classList.contains('code-editor--editing')).toBe(false);

    handle.destroy();
    if (previous) {
      Object.defineProperty(window, 'visualViewport', previous);
    } else {
      Reflect.deleteProperty(window, 'visualViewport');
    }
  });
});
