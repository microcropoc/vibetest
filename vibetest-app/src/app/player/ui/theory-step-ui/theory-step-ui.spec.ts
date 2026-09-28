import { TestBed } from '@angular/core/testing';

import { TheoryStepUiComponent } from './theory-step-ui';

describe('TheoryStepUiComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheoryStepUiComponent],
    }).compileComponents();
  });

  it('delegates markdown rendering to app-markdown-content', async () => {
    const fixture = TestBed.createComponent(TheoryStepUiComponent);
    fixture.componentRef.setInput('markdown', 'Hello **world**');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-markdown-content')).toBeTruthy();
    expect(root.querySelector('strong')?.textContent).toBe('world');
  });
});
