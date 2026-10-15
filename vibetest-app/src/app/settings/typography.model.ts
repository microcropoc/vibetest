/** UI font family id. Stacks are system fonts only. */
export type UiFontFamily = 'system' | 'serif';

/** Monospace family id. Stacks are system fonts only. */
export type CodeFontFamily = 'ui-monospace' | 'consolas';

/** Discrete size. L is the maximum so e-ink stays readable. */
export type FontSizeStep = 's' | 'm' | 'l';

export interface UiTypography {
  readonly family: UiFontFamily;
  readonly size: FontSizeStep;
}

export interface CodeTypography {
  readonly family: CodeFontFamily;
  readonly size: FontSizeStep;
}

export const UI_FONT_FAMILIES: readonly UiFontFamily[] = ['system', 'serif'];
export const CODE_FONT_FAMILIES: readonly CodeFontFamily[] = ['ui-monospace', 'consolas'];
export const FONT_SIZE_STEPS: readonly FontSizeStep[] = ['s', 'm', 'l'];

export const UI_FONT_FAMILY_LABELS: Readonly<Record<UiFontFamily, string>> = {
  system: 'Системный',
  serif: 'С засечками',
};

export const CODE_FONT_FAMILY_LABELS: Readonly<Record<CodeFontFamily, string>> = {
  'ui-monospace': 'Системный моно',
  consolas: 'Consolas',
};

export const FONT_SIZE_LABELS: Readonly<Record<FontSizeStep, string>> = {
  s: 'Мелкий',
  m: 'Обычный',
  l: 'Крупный',
};

export const DEFAULT_UI_TYPOGRAPHY: UiTypography = { family: 'system', size: 'm' };
export const DEFAULT_CODE_TYPOGRAPHY: CodeTypography = { family: 'ui-monospace', size: 'm' };

/** Applied as `html` font-size so existing `rem` headings scale with the UI size. */
export const UI_FONT_SIZES: Readonly<Record<FontSizeStep, string>> = {
  s: '14px',
  m: '16px',
  l: '18px',
};

/** Absolute so code size does not follow the UI root size. */
export const CODE_FONT_SIZES: Readonly<Record<FontSizeStep, string>> = {
  s: '13px',
  m: '15px',
  l: '17px',
};

export const UI_FONT_STACKS: Readonly<Record<UiFontFamily, string>> = {
  system: 'system-ui, -apple-system, "Segoe UI", sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
};

export const CODE_FONT_STACKS: Readonly<Record<CodeFontFamily, string>> = {
  'ui-monospace': 'ui-monospace, Consolas, "Courier New", monospace',
  consolas: 'Consolas, "Courier New", monospace',
};
