import { TestBed } from '@angular/core/testing';

import { TheoryStepUiComponent } from './theory-step-ui';

describe('TheoryStepUiComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryStepUiComponent],
    }).compileComponents();
  });

  it('renders markdown content as HTML', async () => {
    const fixture = TestBed.createComponent(TheoryStepUiComponent);
    fixture.componentRef.setInput('markdown', 'Hello **world**');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('strong')?.textContent).toBe('world');
  });

  it('applies horizontal scroll styles to fenced code from innerHTML', async () => {
    const longLine = 'x'.repeat(120);
    const markdown = '```js\n' + longLine + '\n```';
    const fixture = TestBed.createComponent(TheoryStepUiComponent);
    fixture.componentRef.setInput('markdown', markdown);
    await fixture.whenStable();
    const pre = fixture.nativeElement.querySelector('pre') as HTMLPreElement | null;
    expect(pre).toBeTruthy();
    const style = getComputedStyle(pre!);
    expect(style.overflowX).toBe('auto');
    expect(style.borderStyle).not.toBe('none');
  });
});
