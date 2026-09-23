import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { SvgFullscreenViewerComponent } from './svg-fullscreen-viewer';

describe('SvgFullscreenViewerComponent', () => {
  let sanitizer: DomSanitizer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SvgFullscreenViewerComponent],
    }).compileComponents();
    sanitizer = TestBed.inject(DomSanitizer);
  });

  it('renders dialog when open', async () => {
    const fixture = TestBed.createComponent(SvgFullscreenViewerComponent);
    fixture.componentRef.setInput(
      'svgHtml',
      sanitizer.bypassSecurityTrustHtml(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10"/></svg>',
      ),
    );
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).toBeTruthy();
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(fixture.nativeElement.querySelector('rect')).toBeTruthy();
  });

  it('closes on Escape and emits closed', async () => {
    const fixture = TestBed.createComponent(SvgFullscreenViewerComponent);
    fixture.componentRef.setInput(
      'svgHtml',
      sanitizer.bypassSecurityTrustHtml('<svg viewBox="0 0 1 1"></svg>'),
    );
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();

    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();

    expect(closed).toHaveBeenCalledTimes(1);
  });
});
