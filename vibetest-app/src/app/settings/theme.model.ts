/** User-selectable application theme. */
export type Theme = 'light' | 'dark' | 'eink';

export const THEMES: readonly Theme[] = ['light', 'dark', 'eink'] as const;

export const THEME_LABELS: Readonly<Record<Theme, string>> = {
  light: 'Светлая',
  dark: 'Тёмная',
  eink: 'E-ink',
};
