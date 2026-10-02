import { Component, input, output } from '@angular/core';

import {
  parseContextLengthInput,
  type LlmProfileFieldsValue,
} from '../../llm-profile-fields-value';
import { MIN_LLM_CONTEXT_LENGTH } from '../../llm-profile.model';

@Component({
  selector: 'app-llm-profile-fields',
  templateUrl: './llm-profile-fields.html',
  styleUrl: './llm-profile-fields.scss',
})
export class LlmProfileFieldsComponent {
  readonly value = input.required<LlmProfileFieldsValue>();
  readonly valueChange = output<LlmProfileFieldsValue>();

  protected readonly minContextLength = MIN_LLM_CONTEXT_LENGTH;

  protected onFieldInput(
    field: 'label' | 'baseUrl' | 'apiKey' | 'model',
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

  protected onContextLengthInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.valueChange.emit({
      ...this.value(),
      contextLength: parseContextLengthInput(target.value),
    });
  }

  protected onStructuredOutputChange(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    this.valueChange.emit({
      ...this.value(),
      structuredOutput: target.checked,
    });
  }
}
