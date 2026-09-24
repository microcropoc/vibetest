# vt-42 — JavaScript: `calls` + recursive JSON equal

## Контекст

Практика JS (vt-8): на кейс только `{ "args": [...] }`; раннер вызывает `functionName(...args)` в средах user и reference и сравнивает через `JSON.stringify` ([`javascript-practice.worker.ts`](../../../../vibetest-app/src/app/execution/javascript-practice.worker.ts), [`json-value-equal.ts`](../../../../vibetest-app/src/app/player/step-engine/javascript/json-value-equal.ts)).

Это даёт ложные pass для замыканий, фабрик с методами и каррирования (функции сериализуются в `undefined` / `{}`). Поле **`expected`** не вводим — oracle остаётся dual-env (`referenceSolution`).

## Цель

Опциональная цепочка **`calls`** на результате первого вызова; сравнение **финальных** JSON-совместимых значений user vs reference через recursive equal (`Object.is` для `NaN` и signed zero). Старые курсы без `calls` работают без изменений.

## Требования

### Схема и спека

- Расширить `$defs/javascriptContent.tests[].items` в [`course.schema.json`](../../../schemas/course.schema.json) и [`course-import.schema.json`](../../../schemas/course-import.schema.json):
  - опциональное **`calls`**: массив, `minItems: 0`, **`maxItems: 20`**;
  - элемент `calls[]`: обязательный **`args`** (массив, `maxItems: 20`), опциональный **`method`** (string, `minLength: 1`, `maxLength: 100`); `additionalProperties: false`.
- Обновить раздел **JavaScript** в [`SPECIFICATION.md`](../../../SPECIFICATION.md): семантика `calls`, правила equal, контракт «финальное значение — JSON-совместимо» (не-JSON → fail кейса с message).
- `npm run generate:zod`; sync `public/schemas/`.

### Семантика выполнения

1. `user0 = userFn(...test.args)`, `ref0 = refFn(...test.args)` (как сейчас).
2. Для каждого элемента `test.calls` (если есть), **одинаково** на user и ref:
   - если **`method`** задан: `current = current[method](...call.args)`;
   - иначе: `current = current(...call.args)` (результат предыдущего шага — callable).
3. Сравнить финальные `current` через **`jsonCompatibleEqual`** (recursive, не `JSON.stringify`).
4. Fail-fast, `reset`, `timeoutMs`, dual-env — без изменений vt-8/vt-7.

### Equal (pure function)

- Заменить реализацию в worker и [`json-value-equal.ts`](../../../../vibetest-app/src/app/player/step-engine/javascript/json-value-equal.ts) (одна логика или worker импортирует shared pure fn из домена player/javascript или execution — без дублирования правил).
- **`Object.is`** для примитивов (`NaN`, `+0`/`-0`).
- Массивы и plain objects рекурсивно; порядок ключей объектов не важен (сортировка ключей при сравнении).
- Циклические ссылки → **false** (без throw из equal).
- **`undefined`**, **`function`**, **`symbol`**, **`bigint`** в сравниваемом значении → кейс **fail** («non-JSON result» или аналог); зафиксировать в SPEC.

### Протокол Worker

- Расширить `javascriptRunCase` в [`execution-messages.ts`](../../../../vibetest-app/src/app/execution/execution-messages.ts): опциональный массив `calls` (Zod, та же форма, что в схеме курса).
- [`javascript-practice-runner.ts`](../../../../vibetest-app/src/app/player/step-engine/javascript/javascript-practice-runner.ts) передаёт `calls` в Worker.

### Граничные тесты (обязательный checklist)

**Equal (unit, без TestBed):**

- [ ] `NaN` vs `NaN` → true; `NaN` vs `null` → false
- [ ] `+0` vs `-0` → false; `+0` vs `+0` → true
- [ ] объекты с переставленными ключами → true
- [ ] массив vs объект с числовыми ключами → false
- [ ] цикл в объекте → false, без throw
- [ ] вложенные массивы/объекты → true/false по структуре
- [ ] `undefined` в значении сравнения → false (или reject по контракту SPEC)

**`calls` + Worker / runner (integration, не только mock Worker):**

- [ ] без `calls` — регрессия `add(1,2)` / `add(3,4)` как vt-8
- [ ] curry: `args: [2]`, `calls: [{ args: [3] }, { args: [4] }]` → 24
- [ ] counter: `makeCounter()`, три `{ args: [] }` → 3
- [ ] methods: `{ method: "inc", args: [] }` + `{ method: "get", args: [] }`
- [ ] отсутствующий `method` → fail, message
- [ ] `calls: []` — только первичный `args`
- [ ] starter возвращает noop fn, ref — real counter → **fail** (не pass)
- [ ] fail-fast: второй кейс не выполняется после fail первого
- [ ] runtime error в середине `calls` → fail кейса

## Технические заметки

- Зависимости: **vt-8**, **vt-7**, **vt-2**.
- UI плеера не менять (тесты только в JSON курса).

## План работ

- [ ] SPEC + JSON Schema + `generate:zod`
- [ ] `jsonCompatibleEqual` + unit spec
- [ ] Worker + messages + runner
- [ ] Integration specs (worker harness)
- [ ] `ng test --watch=false` зелёный; REPORT при merge

## Критерии готовности (Definition of Done)

- [ ] Все пункты checklist граничных тестов покрыты и зелёные
- [ ] Семантика согласована со [SPECIFICATION.md](../../../SPECIFICATION.md)
- [ ] Существующие курсы (только `args`) без изменений проходят

## Вне рамок задачи

- Promise / async (`vt-43`)
- Spy, call counts, fake timers (`vt-44`)
- Поле `expected` в схеме
- Произвольный `checkScript`
