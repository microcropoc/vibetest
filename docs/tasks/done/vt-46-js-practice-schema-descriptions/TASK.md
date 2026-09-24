# vt-46 — JS-практика: description parity со SPEC

## Контекст

После vt-45 в [`course-import.schema.json`](../../schemas/course-import.schema.json) и зеркале [`course.schema.json`](../../schemas/course.schema.json) у `$defs/javascriptContent` остались размытые или неточные `description`: «JSON-equal», «drain microtasks», общий `reset` без разделения поля автора и фазы раннера. LLM и авторы курсов могут ошибочно принять `JSON.stringify`, полный drain очереди или зависимость сброса таймеров/spy от непустого `reset`.

Источник истины по поведению: [`SPECIFICATION.md`](../../SPECIFICATION.md) § JavaScript, [`json-value-equal.ts`](../../../vibetest-app/src/app/player/step-engine/javascript/json-value-equal.ts), [`javascript-practice-compile.ts`](../../../vibetest-app/src/app/execution/javascript-practice-compile.ts) (`applyReset`).

## Цель

Тексты `description` у полей JS-практики в обеих схемах совпадают с SPEC/кодом. Валидация JSON Schema и семантика раннера **не** меняются.

## Требования

Заменить `description` только у перечисленных свойств в `$defs/javascriptContent` (import и canonical — одинаковые тексты).

### `javascriptContent` (корень def)

```
JS-практика: код ученика и эталон выполняются в двух изолированных средах (dual-run); результаты сравниваются recursive JSON-compatible equal — plain objects/arrays, порядок ключей объектов не важен, примитивы через Object.is (NaN равен NaN, +0 ≠ -0), а undefined / function / symbol / bigint / не-plain объекты (Map, Set, Date, RegExp) считаются non-JSON result и приводят к fail. Порядок на тест-кейс: reset → вызов functionName(...args) → цепочка calls → await thenable при необходимости → rejects → flushMicrotasks → advanceMs → expectInvocations.
```

### `setup`

```
JS подготовки среды перед загрузкой starterCode/referenceSolution в обеих средах (моки, registerSpy). Глобалы и spy, объявленные в setup, видны коду ученика и эталону после загрузки; не класть сюда проверочные данные — functionName появляется после load.
```

### `reset`

```
Необязательный JS перед каждым тест-кейсом (включая первый); пустая строка — no-op для авторского кода. Между кейсами раннер всегда отменяет pending timers, обнуляет clock, сбрасывает spy и перекомпилирует среду (setup + код), независимо от содержимого этого поля.
```

### `tests.items.properties.args`

```
Аргументы первого вызова functionName(...args). Пустой массив — вызов без аргументов; иначе — JSON-совместимые значения.
```

### `tests.items.properties.rejects`

```
true: и user, и reference должны завершиться reject. Reason для Error сравнивается по message; иначе — тем же recursive JSON-compatible equal. Относится к финалу кейса; промежуточный throw/reject внутри calls — отдельный тест-кейс.
```

### `tests.items.properties.advanceMs`

```
Продвинуть fake timers на N мс в обеих средах перед финальным сравнением. Действует на текущий кейс; состояние таймеров сбрасывается через фазу reset раннера перед следующим кейсом.
```

### `tests.items.properties.flushMicrotasks`

```
true: один host microtask checkpoint (await Promise.resolve()) в обеих средах перед сравнением. Не цикл до пустой очереди — только один tick.
```

## Технические заметки

- Файлы: `docs/schemas/course-import.schema.json`, `docs/schemas/course.schema.json` — parity import ↔ canonical.
- После правок: `npm run generate:zod` (sync `vibetest-app/public/schemas/*`, generated Zod `.describe(...)`).
- SPEC: при необходимости одна уточняющая фраза в § JavaScript про `reset` (поле vs фаза раннера), если текущий текст смешивает их; поведение раннера не менять.
- Доменный код раннера не трогать, если тесты уже зелёные.

## План работ

- [x] Обновить семь `description` в `$defs/javascriptContent` в обеих схемах (тексты выше).
- [x] `npm run generate:zod`.
- [x] При необходимости — минимальная правка SPEC § JavaScript про `reset`.
- [x] `ng test --watch=false`.

## Критерии готовности (Definition of Done)

- [x] Import и canonical schema: одинаковые новые descriptions у перечисленных полей.
- [x] `public/schemas/*` и generated Zod синхронизированы через generate.
- [x] `ng test --watch=false` зелёный.
- [x] В TASK/REPORT нет изменений constraints (required, maxItems и т.д.).

## Вне рамок задачи

- Расширение раннера: `rejects.name`, `expectCalledWith`, per-step `rejects`.
- `$defs/courseGuidelines` и дублирование правил генерации из [`build-course-generation-prompt.ts`](../../../vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts).
- Делать `args` необязательным или `anyOf` с `calls`.
- Граф модулей, адаптивность, sandbox-политика, версионирование раннера.
