/** Structural compare for JSON-compatible values only (spec: no NaN/undefined in results). */
export function jsonCompatibleEqual(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
