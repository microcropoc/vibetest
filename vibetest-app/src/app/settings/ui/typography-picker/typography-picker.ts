import { Component, computed, input, output, signal } from '@angular/core';

import {
  CODE_FONT_FAMILIES,
  CODE_FONT_FAMILY_LABELS,
  FONT_SIZE_LABELS,
  FONT_SIZE_STEPS,
  UI_FONT_FAMILIES,
  UI_FONT_FAMILY_LABELS,
  type CodeTypography,
  type FontSizeStep,
  type UiTypography,
} from '../../typography.model';

@Component({
  selector: 'app-typography-picker',
  templateUrl: './typography-picker.html',
  styleUrl: './typography-picker.scss',
})
export class TypographyPicker {
  readonly ui = input.required<UiTypography>();
  readonly code = input.required<CodeTypography>();

  readonly uiChange = output<UiTypography>();
  readonly codeChange = output<CodeTypography>();
  readonly resetTypography = output<void>();

  private readonly uiOverride = signal<UiTypography | undefined>(undefined);
  private readonly codeOverride = signal<CodeTypography | undefined>(undefined);

  protected readonly uiValue = computed((): UiTypography => this.uiOverride() ?? this.ui());
  protected readonly codeValue = computed(
    (): CodeTypography => this.codeOverride() ?? this.code(),
  );

  protected readonly uiFamilies = UI_FONT_FAMILIES.map((value) => ({
    value,
    label: UI_FONT_FAMILY_LABELS[value],
  }));

  protected readonly codeFamilies = CODE_FONT_FAMILIES.map((value) => ({
    value,
    label: CODE_FONT_FAMILY_LABELS[value],
  }));

  protected readonly sizes = FONT_SIZE_STEPS.map((value) => ({
    value,
    label: FONT_SIZE_LABELS[value],
  }));

  protected onUiFamilyChange(event: Event): void {
    const family = selectValue(event);
    if (!isUiFontFamily(family)) {
      return;
    }
    const next: UiTypography = { family, size: this.uiValue().size };
    this.uiOverride.set(next);
    this.uiChange.emit(next);
  }

  protected onUiSizeChange(event: Event): void {
    const size = selectValue(event);
    if (isFontSizeStep(size)) {
      const next = { family: this.uiValue().family, size };
      this.uiOverride.set(next);
      this.uiChange.emit(next);
    }
  }

  protected onCodeFamilyChange(event: Event): void {
    const family = selectValue(event);
    if (!isCodeFontFamily(family)) {
      return;
    }
    const next: CodeTypography = { family, size: this.codeValue().size };
    this.codeOverride.set(next);
    this.codeChange.emit(next);
  }

  protected onCodeSizeChange(event: Event): void {
    const size = selectValue(event);
    if (isFontSizeStep(size)) {
      const next = { family: this.codeValue().family, size };
      this.codeOverride.set(next);
      this.codeChange.emit(next);
    }
  }

  protected onReset(): void {
    this.uiOverride.set(undefined);
    this.codeOverride.set(undefined);
    this.resetTypography.emit();
  }
}

function selectValue(event: Event): string {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) {
    return '';
  }
  return target.value;
}

function isFontSizeStep(value: string): value is FontSizeStep {
  return value === 's' || value === 'm' || value === 'l';
}

function isUiFontFamily(value: string): value is UiTypography['family'] {
  return value === 'system' || value === 'serif';
}

function isCodeFontFamily(value: string): value is CodeTypography['family'] {
  return value === 'ui-monospace' || value === 'consolas';
}
