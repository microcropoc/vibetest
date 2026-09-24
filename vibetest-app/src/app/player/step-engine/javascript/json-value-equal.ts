function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

function isJsonCompatibleValueInner(value: unknown, seen: WeakSet<object>): boolean {
  if (value === null) {
    return true;
  }
  const t = typeof value;
  if (t === 'string' || t === 'boolean') {
    return true;
  }
  if (t === 'number') {
    return true;
  }
  if (t === 'bigint' || t === 'function' || t === 'symbol' || t === 'undefined') {
    return false;
  }
  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    try {
      return value.every((item) => isJsonCompatibleValueInner(item, seen));
    } finally {
      seen.delete(value);
    }
  }
  if (!isPlainObject(value)) {
    return false;
  }
  if (seen.has(value)) {
    return false;
  }
  seen.add(value);
  try {
    return Object.values(value).every((item) => isJsonCompatibleValueInner(item, seen));
  } finally {
    seen.delete(value);
  }
}

/** Whether `value` is JSON-serializable (no undefined/function/symbol/bigint, plain objects only). */
export function isJsonCompatibleValue(value: unknown): boolean {
  return isJsonCompatibleValueInner(value, new WeakSet());
}

function equalInner(a: unknown, b: unknown, seen: WeakSet<object>): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (typeof a !== typeof b) {
    return false;
  }
  if (a === null || b === null) {
    return false;
  }
  if (typeof a !== 'object') {
    return false;
  }

  const aObj = a as object;
  const bObj = b as object;

  if (seen.has(aObj)) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      return false;
    }
    seen.add(aObj);
    seen.add(bObj);
    try {
      for (let i = 0; i < a.length; i += 1) {
        if (!equalInner(a[i], b[i], seen)) {
          return false;
        }
      }
      return true;
    } finally {
      seen.delete(aObj);
      seen.delete(bObj);
    }
  }

  if (!isPlainObject(a) || !isPlainObject(b)) {
    return false;
  }

  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (let i = 0; i < aKeys.length; i += 1) {
    if (aKeys[i] !== bKeys[i]) {
      return false;
    }
  }

  seen.add(aObj);
  seen.add(bObj);
  try {
    for (const key of aKeys) {
      if (!equalInner(a[key], b[key], seen)) {
        return false;
      }
    }
    return true;
  } finally {
    seen.delete(aObj);
    seen.delete(bObj);
  }
}

/** Structural compare for JSON-compatible values (Object.is primitives; recursive plain objects/arrays). */
export function jsonCompatibleEqual(a: unknown, b: unknown): boolean {
  if (!isJsonCompatibleValue(a) || !isJsonCompatibleValue(b)) {
    return false;
  }
  return equalInner(a, b, new WeakSet());
}
