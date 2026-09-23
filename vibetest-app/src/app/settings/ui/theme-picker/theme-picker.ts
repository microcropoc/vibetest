import { Component, input, output } from '@angular/core';

import { THEME_LABELS, THEMES, type Theme } from '../../theme.model';

@Component({
  selector: 'app-theme-picker',
  templateUrl: './theme-picker.html',
  styleUrl: './theme-picker.scss',
})
export class ThemePickerComponent {
  readonly value = input.required<Theme>();

  readonly themeChange = output<Theme>();

  protected readonly options = THEMES.map((value) => ({
    value,
    label: THEME_LABELS[value],
  }));

  protected onSelect(theme: Theme): void {
    this.themeChange.emit(theme);
  }
}
