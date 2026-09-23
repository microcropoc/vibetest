import type { Theme } from './theme.model';

export function applyThemeToDocument(root: HTMLElement, theme: Theme): void {
  root.setAttribute('data-theme', theme);
}
