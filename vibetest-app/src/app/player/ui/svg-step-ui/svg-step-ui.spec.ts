import { TestBed } from '@angular/core/testing';

import { SvgStepUiComponent } from './svg-step-ui';

describe('SvgStepUiComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgStepUiComponent],
    }).compileComponents();
  });

  it('renders inline SVG markup', async () => {
    const fixture = TestBed.createComponent(SvgStepUiComponent);
    fixture.componentRef.setInput('content', {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>',
      caption: 'Sample',
      description: 'A circle',
    });
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('circle')).toBeTruthy();
    expect(root.textContent).toContain('Sample');
    expect(root.textContent).toContain('A circle');
  });
});
