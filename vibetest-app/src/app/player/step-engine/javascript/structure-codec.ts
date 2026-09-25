import type { JavascriptCallStep } from './apply-javascript-calls';

/** Max nodes when serializing list/tree (cycle / runaway guard). */
export const STRUCTURE_MAX_NODES = 10_000;

export type StructureKind = 'list' | 'tree' | 'raw';

export type JavascriptStructure = {
  readonly args?: readonly StructureKind[];
  readonly result?: StructureKind;
};

export type ListNode = {
  val: number;
  next: ListNode | null;
};

export type TreeNode = {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
};

export class StructureCodecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StructureCodecError';
  }
}

function kindAt(kinds: readonly StructureKind[] | undefined, index: number): StructureKind {
  return kinds?.[index] ?? 'raw';
}

function readOptionalChild(value: unknown, field: string): unknown {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'object') {
    throw new StructureCodecError(`serializeTree: ${field} must be object or null`);
  }
  return value;
}

function parseListNode(value: unknown): { readonly val: number; readonly next: unknown } {
  if (typeof value !== 'object' || value === null) {
    throw new StructureCodecError('serializeList: non-object node');
  }
  if (!('val' in value) || typeof value.val !== 'number') {
    throw new StructureCodecError('serializeList: val must be number');
  }
  return { val: value.val, next: 'next' in value ? value.next : undefined };
}

function parseTreeNode(value: unknown): {
  readonly val: number;
  readonly left: unknown;
  readonly right: unknown;
} {
  if (typeof value !== 'object' || value === null) {
    throw new StructureCodecError('serializeTree: non-object root');
  }
  if (!('val' in value) || typeof value.val !== 'number') {
    throw new StructureCodecError('serializeTree: val must be number');
  }
  return {
    val: value.val,
    left: 'left' in value ? value.left : null,
    right: 'right' in value ? value.right : null,
  };
}

export function listFrom(arr: readonly number[]): ListNode | null {
  let head: ListNode | null = null;
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    head = { val: arr[i], next: head };
  }
  return head;
}

export function serializeList(head: unknown, maxLen = STRUCTURE_MAX_NODES): number[] {
  const out: number[] = [];
  const seen = new Set<object>();
  let current: unknown = head;
  while (current !== null && current !== undefined) {
    if (typeof current !== 'object') {
      throw new StructureCodecError('serializeList: non-object node');
    }
    if (seen.has(current)) {
      throw new StructureCodecError('serializeList: cycle detected');
    }
    if (out.length >= maxLen) {
      throw new StructureCodecError('serializeList: max length exceeded');
    }
    seen.add(current);
    const node = parseListNode(current);
    out.push(node.val);
    current = node.next;
  }
  return out;
}

export function treeFrom(arr: readonly (number | null)[]): TreeNode | null {
  if (arr.length === 0 || arr[0] === null) {
    return null;
  }
  const root: TreeNode = { val: arr[0], left: null, right: null };
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < arr.length) {
    const node = queue.shift();
    if (node === undefined) {
      break;
    }
    if (i < arr.length) {
      const leftVal = arr[i];
      i += 1;
      if (leftVal !== null) {
        node.left = { val: leftVal, left: null, right: null };
        queue.push(node.left);
      }
    }
    if (i < arr.length) {
      const rightVal = arr[i];
      i += 1;
      if (rightVal !== null) {
        node.right = { val: rightVal, left: null, right: null };
        queue.push(node.right);
      }
    }
  }
  return root;
}

export function serializeTree(root: unknown, maxNodes = STRUCTURE_MAX_NODES): (number | null)[] {
  if (root === null || root === undefined) {
    return [];
  }
  if (typeof root !== 'object') {
    throw new StructureCodecError('serializeTree: non-object root');
  }
  const out: (number | null)[] = [];
  const queue: unknown[] = [root];
  const seen = new Set<object>();
  while (queue.length > 0) {
    const item = queue.shift();
    if (item === undefined) {
      break;
    }
    if (item === null) {
      out.push(null);
      continue;
    }
    if (typeof item !== 'object') {
      throw new StructureCodecError('serializeTree: non-object root');
    }
    if (seen.has(item)) {
      throw new StructureCodecError('serializeTree: cycle detected');
    }
    seen.add(item);
    if (seen.size > maxNodes) {
      throw new StructureCodecError('serializeTree: max nodes exceeded');
    }
    const node = parseTreeNode(item);
    out.push(node.val);
    queue.push(readOptionalChild(node.left, 'left'), readOptionalChild(node.right, 'right'));
  }
  while (out.length > 0 && out[out.length - 1] === null) {
    out.pop();
  }
  return out;
}

function materializeOne(value: unknown, kind: StructureKind): unknown {
  if (kind === 'raw') {
    return value;
  }
  if (kind === 'list') {
    if (!Array.isArray(value) || !value.every((v) => typeof v === 'number')) {
      throw new StructureCodecError('list args must be number[]');
    }
    return listFrom(value);
  }
  if (!Array.isArray(value) || !value.every((v) => v === null || typeof v === 'number')) {
    throw new StructureCodecError('tree args must be (number|null)[]');
  }
  return treeFrom(value);
}

/** Clone raw JSON args, then materialize list/tree positions. */
export function prepareArgs(
  rawArgs: readonly unknown[],
  structureArgs: readonly StructureKind[] | undefined,
): unknown[] {
  const cloned: unknown[] = structuredClone([...rawArgs]);
  return cloned.map((value, index) => materializeOne(value, kindAt(structureArgs, index)));
}

export function serializeArgValue(value: unknown, kind: StructureKind): unknown {
  if (kind === 'list') {
    return serializeList(value);
  }
  if (kind === 'tree') {
    return serializeTree(value);
  }
  return value;
}

export function serializeArgs(
  args: readonly unknown[],
  structureArgs: readonly StructureKind[] | undefined,
): unknown[] {
  return args.map((value, index) => serializeArgValue(value, kindAt(structureArgs, index)));
}

export function serializeResult(value: unknown, kind: StructureKind | undefined): unknown {
  return serializeArgValue(value, kind ?? 'raw');
}

export function prepareCalls(
  calls: readonly JavascriptCallStep[] | undefined,
  structureArgs: readonly StructureKind[] | undefined,
): JavascriptCallStep[] | undefined {
  if (calls === undefined) {
    return undefined;
  }
  return calls.map((call) => {
    const args = prepareArgs(call.args, structureArgs);
    if (call.method !== undefined) {
      return { args, method: call.method };
    }
    return { args };
  });
}
