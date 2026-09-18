import { TestBed } from '@angular/core/testing';

import { ConfirmDialogComponent } from './confirm-dialog';

describe('ConfirmDialogComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();
  });

  it('does not render panel when closed', async () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', false);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.confirm-dialog__panel')).toBeNull();
  });

  it('renders message when open', async () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('message', 'Delete this?');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Delete this?');
  });

  it('emits confirmed when primary button is clicked', async () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    const confirmed = vi.fn();
    fixture.componentInstance.confirmed.subscribe(confirmed);
    const button = fixture.nativeElement.querySelector(
      '.confirm-dialog__button--primary',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(confirmed).toHaveBeenCalledOnce();
  });

  it('emits cancelled when secondary button is clicked', async () => {
    const fixture = TestBed.createComponent(ConfirmDialogComponent);
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    const cancelled = vi.fn();
    fixture.componentInstance.cancelled.subscribe(cancelled);
    const button = fixture.nativeElement.querySelector(
      '.confirm-dialog__button--secondary',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(cancelled).toHaveBeenCalledOnce();
  });
});
