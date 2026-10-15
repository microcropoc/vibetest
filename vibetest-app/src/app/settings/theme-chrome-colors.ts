import type { Theme } from './theme.model';

export type ThemeChromeColors = {
  readonly themeColor: string;
  readonly colorScheme: 'light' | 'dark';
};

/** Hex values aligned with `--color-bg` in global styles (manifest / meta). */
export const THEME_CHROME_COLORS: Readonly<Record<Theme, ThemeChromeColors>> = {
  light: { themeColor: '#ffffff', colorScheme: 'light' },
  dark: { themeColor: '#121212', colorScheme: 'dark' },
  eink: { themeColor: '#ffffff', colorScheme: 'light' },
};
