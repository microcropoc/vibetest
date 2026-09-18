import { TestBed } from '@angular/core/testing';

import { PlayerNavComponent } from './player-nav';

describe('PlayerNavComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerNavComponent],
    }).compileComponents();
  });

  it('shows Выход on last step and emits exit', async () => {
    const fixture = TestBed.createComponent(PlayerNavComponent);
    fixture.componentRef.setInput('isLastStep', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Выход');
    const exit = vi.fn();
    fixture.componentInstance.exit.subscribe(exit);
    const primary = root.querySelector('.player-nav__button--primary') as HTMLButtonElement;
    primary.click();
    await fixture.whenStable();
    expect(exit).toHaveBeenCalledOnce();
  });

  it('shows Далее when not last and emits next', async () => {
    const fixture = TestBed.createComponent(PlayerNavComponent);
    fixture.componentRef.setInput('isLastStep', false);
    await fixture.whenStable();
    const next = vi.fn();
    fixture.componentInstance.next.subscribe(next);
    const primary = fixture.nativeElement.querySelector(
      '.player-nav__button--primary',
    ) as HTMLButtonElement;
    primary.click();
    await fixture.whenStable();
    expect(next).toHaveBeenCalledOnce();
  });

  it('emits retry when Повторить is clicked', async () => {
    const fixture = TestBed.createComponent(PlayerNavComponent);
    await fixture.whenStable();
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);
    const buttons = fixture.nativeElement.querySelectorAll('.player-nav__button--secondary');
    (buttons[1] as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(retry).toHaveBeenCalledOnce();
  });
});
