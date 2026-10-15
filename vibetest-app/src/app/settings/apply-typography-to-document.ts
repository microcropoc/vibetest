import {
  CODE_FONT_SIZES,
  CODE_FONT_STACKS,
  UI_FONT_SIZES,
  UI_FONT_STACKS,
  type CodeTypography,
  type UiTypography,
} from './typography.model';

export function applyTypographyToDocument(
  root: HTMLElement,
  ui: UiTypography,
  code: CodeTypography,
): void {
  root.style.setProperty('--font-ui-family', UI_FONT_STACKS[ui.family]);
  root.style.setProperty('--font-ui-size', UI_FONT_SIZES[ui.size]);
  root.style.setProperty('--font-code-family', CODE_FONT_STACKS[code.family]);
  root.style.setProperty('--font-code-size', CODE_FONT_SIZES[code.size]);
}
