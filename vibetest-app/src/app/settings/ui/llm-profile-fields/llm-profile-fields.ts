import { Component, input, output } from '@angular/core';

import type { LlmProfileFieldsValue } from '../../llm-profile-fields-value';

@Component({
  selector: 'app-llm-profile-fields',
  templateUrl: './llm-profile-fields.html',
  styleUrl: './llm-profile-fields.scss',
})
export class LlmProfileFieldsComponent {
  readonly value = input.required<LlmProfileFieldsValue>();
  readonly valueChange = output<LlmProfileFieldsValue>();

  protected onFieldInput(
    field: keyof LlmProfileFieldsValue,
    event: Event,
  ): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.valueChange.emit({
      ...this.value(),
      [field]: target.value,
    });
  }
}
