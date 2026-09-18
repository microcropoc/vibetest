import { TestBed } from '@angular/core/testing';

import { StepIndicatorBarComponent } from './step-indicator-bar';

describe('StepIndicatorBarComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepIndicatorBarComponent],
    }).compileComponents();
  });

  it('emits stepSelected when a square is clicked', async () => {
    const fixture = TestBed.createComponent(StepIndicatorBarComponent);
    fixture.componentRef.setInput('items', [
      { index: 0, stepId: 'a', label: 'Шаг 1', state: 'current' },
      { index: 1, stepId: 'b', label: 'Шаг 2', state: 'untouched' },
    ]);
    await fixture.whenStable();
    const selected = vi.fn();
    fixture.componentInstance.stepSelected.subscribe(selected);
    const buttons = fixture.nativeElement.querySelectorAll('.step-indicator-bar__square');
    (buttons[1] as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(selected).toHaveBeenCalledWith(1);
  });
});
