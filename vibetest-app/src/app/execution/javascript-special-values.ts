import { isPlainObject } from './is-plain-object';

const JS_TAG_KEY = '$js';

const BIGINT_PATTERN = /^-?\d+$/;

const SCALAR_TAG_VALUES: Readonly<Record<string, unknown>> = {
  undefined: undefined,
  NaN: NaN,
  Infinity: Infinity,
  '-Infinity': -Infinity,
  '-0': -0,
};

export type SpecialValueIssuePath = readonly (string | number)[];

export type SpecialValueIssue = {
  readonly path: SpecialValueIssuePath;
  readonly message: string;
};

export class JavascriptSpecialValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JavascriptSpecialValueError';
  }
}

function isJsTagObject(value: unknown): value is Record<string, unknown> {
  return isPlainObject(value) && JS_TAG_KEY in value;
}

/** Returns an error message, or undefined when `obj` is a valid `$js` tag. */
function validateTagObject(obj: Record<string, unknown>): string | undefined {
  const keys = Object.keys(obj);
  const js = obj[JS_TAG_KEY];
  if (typeof js !== 'string') {
    return '$js must be a string';
  }
  if (js === 'bigint') {
    if (keys.length !== 2 || !('value' in obj)) {
      return 'bigint tag must be { "$js": "bigint", "value": "<digits>" }';
    }
    const value = obj['value'];
    if (typeof value !== 'string' || !BIGINT_PATTERN.test(value)) {
      return 'bigint value must match ^-?\\d+$';
    }
    return undefined;
  }
  if (Object.hasOwn(SCALAR_TAG_VALUES, js)) {
    return keys.length === 1 ? undefined : 'scalar $js tag must have only "$js" key';
  }
  return `Unknown $js tag: ${js}`;
}

function decodeTagObject(obj: Record<string, unknown>): unknown {
  const message = validateTagObject(obj);
  if (message !== undefined) {
    throw new JavascriptSpecialValueError(message);
  }
  const js = obj[JS_TAG_KEY];
  const bigintValue = obj['value'];
  if (js === 'bigint' && typeof bigintValue === 'string') {
    return BigInt(bigintValue);
  }
  return typeof js === 'string' ? SCALAR_TAG_VALUES[js] : undefined;
}

/** Tag for a non-JSON primitive, or undefined when `value` needs no tag. */
function specialPrimitiveTag(value: unknown): Record<string, unknown> | undefined {
  if (value === undefined) {
    return { [JS_TAG_KEY]: 'undefined' };
  }
  if (typeof value === 'bigint') {
    return { [JS_TAG_KEY]: 'bigint', value: value.toString() };
  }
  if (typeof value !== 'number') {
    return undefined;
  }
  if (Number.isNaN(value)) {
    return { [JS_TAG_KEY]: 'NaN' };
  }
  if (value === Infinity) {
    return { [JS_TAG_KEY]: 'Infinity' };
  }
  if (value === -Infinity) {
    return { [JS_TAG_KEY]: '-Infinity' };
  }
  if (Object.is(value, -0)) {
    return { [JS_TAG_KEY]: '-0' };
  }
  return undefined;
}

/** JSON args → runtime values (recursive). Throws on invalid `$js` tags. */
export function decodeSpecialValues(value: unknown): unknown {
  if (isJsTagObject(value)) {
    return decodeTagObject(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => decodeSpecialValues(item));
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = decodeSpecialValues(item);
    }
    return out;
  }
  return value;
}

/** Runtime values → JSON-comparable tagged form (recursive). Array holes become `undefined` tags. */
export function encodeSpecialValues(value: unknown): unknown {
  const tag = specialPrimitiveTag(value);
  if (tag !== undefined) {
    return tag;
  }
  if (Array.isArray(value)) {
    return Array.from(value, (item: unknown) => encodeSpecialValues(item));
  }
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      out[key] = encodeSpecialValues(item);
    }
    return out;
  }
  return value;
}

function collectIssues(value: unknown, path: SpecialValueIssuePath, out: SpecialValueIssue[]): void {
  if (isJsTagObject(value)) {
    const message = validateTagObject(value);
    if (message !== undefined) {
      out.push({ path, message });
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectIssues(item, [...path, index], out);
    });
    return;
  }
  if (isPlainObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      collectIssues(item, [...path, key], out);
    }
  }
}

/** Validate `$js` tags in JSON args (import). */
export function findSpecialValueIssues(value: unknown): readonly SpecialValueIssue[] {
  const out: SpecialValueIssue[] = [];
  collectIssues(value, [], out);
  return out;
}
