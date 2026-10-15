import { mountPracticeCodeEditor } from './practice-codemirror-host';

function cssRuleForClass(className: string): string {
  const styles = [...document.querySelectorAll('style')]
    .map((style) => style.textContent ?? '')
    .join('\n');
  const start = styles.indexOf(`.${className}`);
  if (start < 0) {
    return '';
  }
  const end = styles.indexOf('}', start);
  return styles.slice(start, end < 0 ? undefined : end);
}

describe('practiceCodeEditorSyntaxHighlighting', () => {
  it('applies theme token colors to javascript keywords instead of the default light palette', () => {
    const parent = document.createElement('div');
    document.body.append(parent);
    const handle = mountPracticeCodeEditor(parent, {
      initialDoc: 'function answer() { return 1; }',
      language: 'javascript',
      readOnly: false,
      onDocChange: () => undefined,
    });

    const keyword = [...parent.querySelectorAll('.cm-content span')].find((span) =>
      span.textContent?.includes('function'),
    );
    const rule = keyword ? cssRuleForClass(keyword.className) : '';

    handle.destroy();
    parent.remove();

    expect(keyword).toBeTruthy();
    expect(rule).toContain('var(--color-cm-keyword)');
  });
});
