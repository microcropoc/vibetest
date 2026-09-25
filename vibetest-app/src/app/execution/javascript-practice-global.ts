export type PracticeGlobalBag = Record<string, unknown>;

export const JAVASCRIPT_PRACTICE_SPY_PREAMBLE = `
globalThis.__vibetestSpies = globalThis.__vibetestSpies ?? Object.create(null);
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
  const bag = Object.create(null) as PracticeGlobalBag;
  bag['__vibetestSpies'] = Object.create(null);
  return bag;
}

export function readSpyInvocationCount(bag: PracticeGlobalBag, spyName: string): number | undefined {
  if (bag === null || typeof bag !== 'object') {
    return undefined;
  }
  if (!Object.prototype.hasOwnProperty.call(bag, '__vibetestSpies')) {
    return undefined;
  }
  const registry = bag['__vibetestSpies'];
  if (registry === null || typeof registry !== 'object' || Array.isArray(registry)) {
    return undefined;
  }
  const descriptor = Reflect.getOwnPropertyDescriptor(registry as object, spyName);
  if (descriptor === undefined) {
    return undefined;
  }
  const wrapped = descriptor.value;
  if (wrapped === null || (typeof wrapped !== 'object' && typeof wrapped !== 'function')) {
    return undefined;
  }
  const getCountDesc = Reflect.getOwnPropertyDescriptor(wrapped, '__vibetestGetCount');
  if (getCountDesc === undefined || typeof getCountDesc.value !== 'function') {
    return undefined;
  }
  const count = Reflect.apply(getCountDesc.value, wrapped, []);
  return typeof count === 'number' && Number.isSafeInteger(count) && count >= 0 ? count : undefined;
}

export function clearSpyRegistry(bag: PracticeGlobalBag): void {
  if (bag === null || typeof bag !== 'object') {
    return;
  }
  bag['__vibetestSpies'] = Object.create(null);
}
