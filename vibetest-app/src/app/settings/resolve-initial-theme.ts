import type { Theme } from './theme.model';

export interface ColorSchemePreference {
  readonly prefersDark: boolean;
}

/** Stored theme wins; otherwise system light/dark (never e-ink). */
export function resolveInitialTheme(
  preference: ColorSchemePreference,
  storedTheme: Theme | undefined,
): Theme {
  if (storedTheme !== undefined) {
    return storedTheme;
  }
  return preference.prefersDark ? 'dark' : 'light';
}
