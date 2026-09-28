import { describe, expect, it } from 'vitest';

import { renderInlineMarkdownToHtml, renderMarkdownToHtml } from './render-markdown';

describe('renderMarkdownToHtml', () => {
  it('renders basic markdown to HTML', () => {
    const html = renderMarkdownToHtml('Hello **world**');
    expect(html).toContain('<strong>world</strong>');
  });
});

describe('renderInlineMarkdownToHtml', () => {
  it('renders inline markdown without block wrapper', () => {
    const html = renderInlineMarkdownToHtml('Use `x => x * 2`');
    expect(html).toContain('<code');
    expect(html).not.toContain('<p>');
  });
});
