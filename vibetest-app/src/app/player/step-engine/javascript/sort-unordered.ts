function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

/** Stable key for sorting JSON-compatible values (objects with sorted keys). */
function stableSortKey(value: unknown): string {
  if (value === null) {
    return 'null';
  }
  const t = typeof value;
  if (t === 'string' || t === 'boolean' || t === 'number') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableSortKey).join(',')}]`;
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableSortKey(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/**
 * Recursive normalize for unordered compare: arrays sorted by stable key;
 * plain-object values normalized (keys sorted when rebuilt).
 */
export function sortUnordered(value: unknown): unknown {
  if (Array.isArray(value)) {
    const mapped = value.map(sortUnordered);
    return mapped.slice().sort((a, b) => {
      const ka = stableSortKey(a);
      const kb = stableSortKey(b);
      if (ka < kb) {
        return -1;
      }
      if (ka > kb) {
        return 1;
      }
      return 0;
    });
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value).sort()) {
      out[key] = sortUnordered(value[key]);
    }
    return out;
  }
  return value;
}
