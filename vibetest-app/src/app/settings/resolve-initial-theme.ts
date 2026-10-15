import type { Theme } from './theme.model';

export interface ColorSchemePreference {
  readonly prefersDark: boolean;
}

/** Stored theme wins; otherwise dark (never e-ink, system scheme ignored). */
export function resolveInitialTheme(
  _preference: ColorSchemePreference,
  storedTheme: Theme | undefined,
): Theme {
  if (storedTheme !== undefined) {
    return storedTheme;
  }
  return 'dark';
}
