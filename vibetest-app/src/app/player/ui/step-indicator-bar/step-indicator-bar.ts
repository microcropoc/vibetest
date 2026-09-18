import { Component, input, output } from '@angular/core';

import type { StepIndicatorItemView } from '../../step-indicator-items';

@Component({
  selector: 'app-step-indicator-bar',
  templateUrl: './step-indicator-bar.html',
  styleUrl: './step-indicator-bar.scss',
})
export class StepIndicatorBarComponent {
  readonly items = input.required<readonly StepIndicatorItemView[]>();

  readonly stepSelected = output<number>();

  protected onSelect(index: number): void {
    this.stepSelected.emit(index);
  }
}
