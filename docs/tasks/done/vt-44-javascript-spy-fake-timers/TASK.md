# vt-44 — JavaScript: spy + fake timers / event loop

## Контекст

vt-42/43 покрывают return values и async, но **memoize**, **once**, **debounce** требуют подсчёта вызовов и управления временем. Без этого тесты с `args: []` остаются фиктивными.

## Цель

1. **Spy:** именованные функции из **`setup`** (конвенция автора) регистрируются раннером; после кейса сравнить **число вызовов** user vs reference (dual-env). Явное ожидание в JSON: **`expectInvocations`** — объект `{ "spyName": number }` (ключи — имена из setup, значения — ожидаемое число вызовов **у обеих** сред; несовпадение user vs ref или vs ожидание → fail).
2. **Fake timers:** в Worker подмена/управление **`setTimeout`**, **`setInterval`**, **`clearTimeout`**, **`clearInterval`**; опционально drain **`queueMicrotask`**. Поля кейса: **`advanceMs`** (integer ≥ 0, max разумный cap в schema, напр. 60000), **`flushMicrotasks`** (boolean). После `args`/`calls` (и await vt-43) применить advance/flush **одинаково** к обеим средам, затем сравнить финал и/или `expectInvocations`.

API **`setup` (конвенция, описать в SPEC):**

```javascript
// setup (пример для memoize)
globalThis.__vibetestSpies = {};
function registerSpy(name, fn) {
  let n = 0;
  const wrapped = (...a) => { n++; return fn(...a); };
  wrapped.__vibetestGetCount = () => n;
  __vibetestSpies[name] = wrapped;
  return wrapped;
}
```

Раннер после init читает счётчики через согласованный hook (например `__vibetestGetCount` on wrapped fn in `__vibetestSpies`) **без** произвольного eval из курса.

## Требования

### Схема и спека

- `tests[].items`: опциональные **`expectInvocations`** (object, string keys, integer values ≥ 0), **`advanceMs`**, **`flushMicrotasks`**.
- SPEC: порядок операций на кейс — reset → invoke/calls → await (vt-43) → **advanceMs / flushMicrotasks** → read spies → compare values + invocations; лимит на число pending timers (защита от бесконечного interval) → fail/timeout.

### Spy

- Сравнение: для каждого ключа в `expectInvocations` — userCount === refCount === expected (или userCount === refCount и оба === expected).
- Spy state не протекает между кейсами (`reset` + recompile).
- Кейсы без `expectInvocations` — поведение vt-42/43.

### Fake timers

- **`advanceMs`**: продвижение fake clock; выполнение due callbacks (macrotasks).
- **`flushMicrotasks`**: если true — drain microtask queue один раз (или до fixed point — зафиксировать в SPEC одним правилом).
- User и ref используют **раздельные** fake clock instances, синхronно продвигаемые на одинаковый `advanceMs`.

### Граничные тесты — spy (checklist)

- [ ] memoize: 2× same args через `calls` → `expectInvocations: { "fn": 1 }` → pass
- [ ] broken memoize (user 2 invocations, ref 1) → fail
- [ ] different args → `fn: 2` → pass
- [ ] `once`: второй вызов не увеличивает счётчик
- [ ] после `reset` второй кейс — счётчик с нуля
- [ ] кейс без spy fields — регрессия vt-43

### Граничные тесты — timers / event loop (checklist)

- [ ] `delay(fn, 100)`: без advance — fn count 0; `advanceMs: 100` → 1
- [ ] debounce: burst calls + `advanceMs` < window → 0; advance ≥ window → 1 callback
- [ ] nested: timeout schedules inner timeout; advance ступенями
- [ ] `clearTimeout` before fire → 0 invocations
- [ ] `flushMicrotasks: true` — Promise.then before setTimeout(0) порядок по правилу SPEC (один эталонный тест)
- [ ] timer + async Promise в одном кейсе
- [ ] interval без остановки — cap/limit → fail или timeout (не зависание Worker)

## Технические заметки

- Зависимости: **vt-43**, **vt-42**, **vt-7**.
- Реализация fake timers — только в Worker, не в UI thread.
- Не mock `Date` unless required for debounce tests (зафиксировать в REPORT).

## План работ

- [ ] SPEC + schema + `generate:zod`
- [ ] Spy registry + post-case assertion
- [ ] Fake timers module in Worker
- [ ] Checklist specs (spy + timers)
- [ ] `ng test --watch=false` зелёный; REPORT при merge

## Критерии готовности (Definition of Done)

- [ ] Все checklist пункты покрыты
- [ ] Достаточно для шагов курса: memoize, once, debounce/delay (без checkScript)

## Вне рамок задачи

- Произвольный **`checkScript`**
- Полный Jest fake timers (Date, performance.now, requestAnimationFrame)
- Pinch/browser timer в main thread
- Static **`expected`** return values
