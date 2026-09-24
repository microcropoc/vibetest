export type PracticeGlobalBag = Record<string, unknown>;

export type SpyRegistry = Record<string, unknown>;

export const JAVASCRIPT_PRACTICE_SPY_PREAMBLE = `
globalThis.__vibetestSpies = globalThis.__vibetestSpies ?? {};
function registerSpy(name, fn) {
  let n = 0;
  const wrapped = function(...a) {
    n += 1;
    return fn.apply(this, a);
  };
  wrapped.__vibetestGetCount = function() { return n; };
  globalThis.__vibetestSpies[name] = wrapped;
  return wrapped;
}
`;

export function createPracticeGlobalBag(): PracticeGlobalBag {
  return {};
}

export function readSpyInvocationCount(bag: PracticeGlobalBag, spyName: string): number | undefined {
  const registry = bag['__vibetestSpies'];
  if (registry === null || typeof registry !== 'object') {
    return undefined;
  }
  const wrapped = Reflect.get(registry as object, spyName);
  if (wrapped === null || (typeof wrapped !== 'object' && typeof wrapped !== 'function')) {
    return undefined;
  }
  const getCount = Reflect.get(wrapped, '__vibetestGetCount');
  if (typeof getCount !== 'function') {
    return undefined;
  }
  const count = Reflect.apply(getCount, wrapped, []);
  return typeof count === 'number' && Number.isInteger(count) && count >= 0 ? count : undefined;
}

export function clearSpyRegistry(bag: PracticeGlobalBag): void {
  bag['__vibetestSpies'] = {};
}
