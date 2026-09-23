/** Reads `(prefers-color-scheme: dark)` from the browser. */
export function readColorSchemePreference(
  matchMedia: (query: string) => MediaQueryList,
): { readonly prefersDark: boolean } {
  return { prefersDark: matchMedia('(prefers-color-scheme: dark)').matches };
}
