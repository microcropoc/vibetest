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

  it('shows expand control and opens fullscreen viewer', async () => {
    const fixture = TestBed.createComponent(SvgStepUiComponent);
    fixture.componentRef.setInput('content', {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>',
      caption: 'Sample',
      description: '',
    });
    await fixture.whenStable();

    const expand = fixture.nativeElement.querySelector('.svg-step-ui__expand') as HTMLButtonElement;
    expect(expand?.textContent?.trim()).toBe('Развернуть');
    expand.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.svg-step-ui__figure-inner')).toBeNull();
    expect(fixture.nativeElement.querySelector('.svg-fullscreen-viewer__svg svg')).toBeTruthy();
  });

  it('restores focus to expand after close', async () => {
    const fixture = TestBed.createComponent(SvgStepUiComponent);
    fixture.componentRef.setInput('content', {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>',
      caption: '',
      description: '',
    });
    await fixture.whenStable();

    const expand = fixture.nativeElement.querySelector('.svg-step-ui__expand') as HTMLButtonElement;
    expand.click();
    await fixture.whenStable();

    const close = fixture.nativeElement.querySelector(
      '.svg-fullscreen-viewer__close',
    ) as HTMLButtonElement;
    close.click();
    await fixture.whenStable();
    await Promise.resolve();

    expect(document.activeElement).toBe(expand);
  });
});
