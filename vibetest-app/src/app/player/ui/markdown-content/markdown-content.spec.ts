import { TestBed } from '@angular/core/testing';

import { MarkdownContentComponent } from './markdown-content';

describe('MarkdownContentComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownContentComponent],
    }).compileComponents();
  });

  it('renders block markdown content as HTML', async () => {
    const fixture = TestBed.createComponent(MarkdownContentComponent);
    fixture.componentRef.setInput('markdown', 'Hello **world**');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('strong')?.textContent).toBe('world');
  });

  it('applies horizontal scroll styles to fenced code from innerHTML', async () => {
    const longLine = 'x'.repeat(120);
    const markdown = '```js\n' + longLine + '\n```';
    const fixture = TestBed.createComponent(MarkdownContentComponent);
    fixture.componentRef.setInput('markdown', markdown);
    await fixture.whenStable();
    const pre = fixture.nativeElement.querySelector('pre') as HTMLPreElement | null;
    expect(pre).toBeTruthy();
    const style = getComputedStyle(pre!);
    expect(style.overflowX).toBe('auto');
    expect(style.borderStyle).not.toBe('none');
  });

  it('renders inline markdown without block wrapper', async () => {
    const fixture = TestBed.createComponent(MarkdownContentComponent);
    fixture.componentRef.setInput('markdown', 'Pick `x => x * 2`');
    fixture.componentRef.setInput('inline', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('code')?.textContent).toContain('x => x * 2');
    expect(root.querySelector('p')).toBeNull();
    expect(root.classList.contains('markdown-content--host-inline')).toBe(true);
  });

  it('styles inline code the same in block and inline modes', async () => {
    const markdown = 'Use `x`';
    const blockFixture = TestBed.createComponent(MarkdownContentComponent);
    blockFixture.componentRef.setInput('markdown', markdown);
    await blockFixture.whenStable();
    const inlineFixture = TestBed.createComponent(MarkdownContentComponent);
    inlineFixture.componentRef.setInput('markdown', markdown);
    inlineFixture.componentRef.setInput('inline', true);
    await inlineFixture.whenStable();

    const blockCode = blockFixture.nativeElement.querySelector('code') as HTMLElement;
    const inlineCode = inlineFixture.nativeElement.querySelector('code') as HTMLElement;
    expect(getComputedStyle(blockCode).backgroundColor).toBe(
      getComputedStyle(inlineCode).backgroundColor,
    );
  });

  it('parses unescaped angle brackets as HTML in inline mode', async () => {
    const fixture = TestBed.createComponent(MarkdownContentComponent);
    fixture.componentRef.setInput('markdown', '<em>tag</em>');
    fixture.componentRef.setInput('inline', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.markdown-content em')?.textContent).toBe('tag');
  });

  it('keeps top margin on headings after the first block', async () => {
    const fixture = TestBed.createComponent(MarkdownContentComponent);
    fixture.componentRef.setInput('markdown', '## First\n\nText\n\n## Second');
    await fixture.whenStable();
    const headings = fixture.nativeElement.querySelectorAll('h2') as NodeListOf<HTMLElement>;
    expect(getComputedStyle(headings[0]!).marginTop).toBe('0px');
    expect(getComputedStyle(headings[1]!).marginTop).not.toBe('0px');
  });

  it('removes bottom margin from last direct child (e.g. fenced code)', async () => {
    const fixture = TestBed.createComponent(MarkdownContentComponent);
    fixture.componentRef.setInput('markdown', 'Intro\n\n```js\nx\n```');
    await fixture.whenStable();
    const pre = fixture.nativeElement.querySelector('pre') as HTMLPreElement;
    expect(getComputedStyle(pre).marginBottom).toBe('0px');
  });
});

