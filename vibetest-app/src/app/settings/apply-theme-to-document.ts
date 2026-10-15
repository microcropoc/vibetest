import type { Theme } from './theme.model';
import { THEME_CHROME_COLORS } from './theme-chrome-colors';

const THEME_COLOR_META = 'theme-color';
const COLOR_SCHEME_META = 'color-scheme';

function ensureMeta(name: string): HTMLMetaElement {
  const existing = document.querySelector(`meta[name="${name}"]`);
  if (existing instanceof HTMLMetaElement) {
    return existing;
  }
  const meta = document.createElement('meta');
  meta.name = name;
  document.head.append(meta);
  return meta;
}

export function applyThemeChromeMeta(theme: Theme): void {
  const chrome = THEME_CHROME_COLORS[theme];
  ensureMeta(THEME_COLOR_META).content = chrome.themeColor;
  ensureMeta(COLOR_SCHEME_META).content = chrome.colorScheme;
}

export function applyThemeToDocument(root: HTMLElement, theme: Theme): void {
  root.setAttribute('data-theme', theme);
  applyThemeChromeMeta(theme);
}
