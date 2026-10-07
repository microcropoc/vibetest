import type { Database } from 'sql.js';

type SqlValue = number | string | Uint8Array | null;

const REGEXP_CACHE_LIMIT = 100;

/** sql.js turns a thrown string into the SQLite error text; a thrown `Error` arrives with an empty message. */
function raiseSqlError(message: string): never {
  throw message;
}

function toNumber(value: SqlValue): number | null {
  if (value === null) {
    return null;
  }
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(number) ? null : number;
}

function finiteOrNull(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

function unaryMath(fn: (x: number) => number): (x: SqlValue) => number | null {
  return (x) => {
    const value = toNumber(x);
    return value === null ? null : finiteOrNull(fn(value));
  };
}

function createRegexp(): (pattern: SqlValue, value: SqlValue) => number | null {
  const cache = new Map<string, RegExp>();
  const compile = (pattern: string): RegExp => {
    const cached = cache.get(pattern);
    if (cached !== undefined) {
      return cached;
    }
    let compiled: RegExp;
    try {
      compiled = new RegExp(pattern);
    } catch (error: unknown) {
      return raiseSqlError(
        `REGEXP: ${error instanceof Error ? error.message : 'invalid pattern'}`,
      );
    }
    if (cache.size >= REGEXP_CACHE_LIMIT) {
      cache.clear();
    }
    cache.set(pattern, compiled);
    return compiled;
  };
  return (pattern, value) => {
    if (pattern === null || value === null) {
      return null;
    }
    return compile(String(pattern)).test(String(value)) ? 1 : 0;
  };
}

/**
 * Adds `X REGEXP P` (JavaScript RegExp, case-sensitive) and math functions missing from the sql.js
 * build (`ln`, `log2`, `pow`, `mod`, `trunc`, `ceiling`). Domain errors return NULL like SQLite math.
 * sql.js takes the SQL arity from the JS parameter count.
 */
export function registerSqliteFunctions(db: Database): void {
  db.create_function('regexp', createRegexp());
  db.create_function('ln', unaryMath((x) => (x > 0 ? Math.log(x) : Number.NaN)));
  db.create_function('log2', unaryMath((x) => (x > 0 ? Math.log2(x) : Number.NaN)));
  db.create_function('trunc', unaryMath(Math.trunc));
  db.create_function('ceiling', unaryMath(Math.ceil));
  db.create_function('pow', (x: SqlValue, y: SqlValue) => {
    const base = toNumber(x);
    const exponent = toNumber(y);
    return base === null || exponent === null ? null : finiteOrNull(base ** exponent);
  });
  db.create_function('mod', (x: SqlValue, y: SqlValue) => {
    const dividend = toNumber(x);
    const divisor = toNumber(y);
    if (dividend === null || divisor === null || divisor === 0) {
      return null;
    }
    return dividend % divisor;
  });
}
