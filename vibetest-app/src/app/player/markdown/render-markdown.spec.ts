import { describe, expect, it } from 'vitest';

import { renderMarkdownToHtml } from './render-markdown';

describe('renderMarkdownToHtml', () => {
  it('renders basic markdown to HTML', () => {
    const html = renderMarkdownToHtml('Hello **world**');
    expect(html).toContain('<strong>world</strong>');
  });
});
