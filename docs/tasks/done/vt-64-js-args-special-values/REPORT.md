---
branch: feature/vt-64-js-args-special-values
---

# Отчёт vt-64 — Теги особых значений в args JS-шага

## Что сделано

- Модуль `javascript-special-values.ts`: decode/encode тегов `$js`, `findSpecialValueIssues` для импорта.
- `prepareArgs` декодирует теги перед materialize; сравнение equal-path кодирует особые значения в теги.
- Верхнеуровневый `undefined` в return/reject — по-прежнему `non-JSON result`.
- Валидация тегов в `JavascriptContentWithTargetSchema` для `tests[].args` и `calls[].args`.
- Описания в схемах, SPECIFICATION.md, промпт генерации курса.

## Изменённые файлы

- `vibetest-app/src/app/execution/javascript-special-values.ts` (+ spec)
- `vibetest-app/src/app/execution/is-plain-object.ts` (общий хелпер; используют также `json-value-equal.ts`, `sort-unordered.ts`)
- `vibetest-app/src/app/player/step-engine/javascript/structure-codec.ts` (+ spec)
- `vibetest-app/src/app/player/step-engine/javascript/run-javascript-case.ts` (+ spec)
- `vibetest-app/src/app/courses/javascript-content-target.ts` (+ spec)
- `docs/schemas/course.schema.json`, `course-import.schema.json`
- `docs/SPECIFICATION.md`
- `vibetest-app/src/app/prompt-generation/*`
- `vibetest-app/public/schemas/*`, `module-import.schema.json`, generated Zod

## Тесты

- `ng test --watch=false`: зелёный (405)

## Отклонения от TASK.md

- Смена поведения сравнения вне args: bigint (включая верхнеуровневый) и вложенные `undefined` / `NaN` / ±`Infinity` / `-0` в return и reject reason теперь сравниваются через теги (раньше bigint и любой `undefined` давали `non-JSON result`). Fail остался только у верхнеуровневого `undefined` (защита void-функций).
- `{a: undefined}` ≠ `{}` при сравнении; ключ `$js` зарезервирован и в сравниваемых значениях (литеральный `{"$js": "NaN"}` в return равен `NaN`). Зафиксировано в SPEC и схеме.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Ревью (2026-09-28, раунд 1). Скоуп: ветка без коммитов, весь дифф — незакоммиченный; `ng test --watch=false` — 399 passed.

1. **Документация противоречит новому поведению сравнения** → корневой `description` `JavascriptContent` в `course.schema.json` / `course-import.schema.json` (→ generated Zod) — «undefined / function / symbol / bigint … считаются non-JSON result и приводят к fail»; `SPECIFICATION.md`, таблица проверок (строка `javascript`) — «Не-JSON в сравниваемом return: `undefined`, `function`, `symbol`, `bigint`» → теперь bigint (в т.ч. верхнеуровневый — тест «compares equal bigint return values via encoded tags») и вложенный `undefined` сравниваются через теги; fail только у верхнеуровневого `undefined`. Ожидание: обновить оба места (+ `generate:zod`); смену поведения для bigint / вложенного `undefined` в return (раньше fail, теперь сравнение) отразить в REPORT «Отклонения» — TASK говорит только о тегах в args и о верхнеуровневом `undefined`.
2. **Дублирование логики** → `javascript-special-values.ts`: `decodeTagObject` и `validateTagObject` повторяют одни и те же проверки и сообщения; `isPlainObject` — уже третья копия (есть в `sort-unordered.ts`, `json-value-equal.ts`). Ожидание: decode через `validateTagObject` (при сообщении — throw), чтобы правила тегов жили в одном месте; `isPlainObject` — вынести в общий хелпер или хотя бы не плодить новую копию.
3. **Мёртвая обработка ошибок** → `encodeSpecialValues` никогда не бросает (`encodeScalarTag` вызывается только с кодируемыми значениями) → в `run-javascript-case.ts` `try/catch` в `compareRejected` (обе ветки catch к тому же идентичны) и `instanceof JavascriptSpecialValueError` в `compareFulfilledWithMode` недостижимы. Ожидание: убрать; `encodeScalarTag` сделать нефейлящим (или оставить throw как assert без обработки в вызывающих).
4. **Неописанная семантика тегов в return** → `encodeSpecialValues` + SPEC: (а) `{a: undefined}` теперь ≠ `{}` (тег против отсутствующего ключа) — раньше `{a: undefined}` давал non-JSON fail, теперь `{a: undefined}` у обеих сторон проходит, а против `{}` — mismatch; (б) литеральный объект `{"$js": "NaN"}` в return кодируется как есть и равен настоящему `NaN` у другой стороны. Ожидание: зафиксировать в SPEC (ключ `$js` зарезервирован и для return; отсутствующий ключ ≠ `undefined`), либо осознанно поменять поведение.
5. **Пробелы в тестах** (nit) → `javascript-special-values.spec.ts`: тест «encodes undefined in array holes» использует `[undefined, 1]`, а не дырку (`[, 1]`) — переименовать или проверить sparse array; `javascript-content-target.spec.ts`: невалидный тег проверен только в `tests[].args`, нет кейса для `calls[].args` (отдельная ветка `superRefine` с другим path); `run-javascript-case.spec.ts`: нет кейса reject-пути с особыми значениями в reason / `undefined` reason.

Раунд 1 — исправлено:

1. Корневой `description` `javascriptContent` в обеих схемах и строка `javascript` в таблице SPEC описывают сравнение через теги и единственный fail — верхнеуровневый `undefined`; `generate:zod` выполнен. Смена поведения для bigint / вложенных особых значений в return и reject — в «Отклонениях».
2. `decodeTagObject` валидирует через `validateTagObject` (правила тегов в одном месте; скалярные теги — таблица `SCALAR_TAG_VALUES`). `isPlainObject` вынесен в `execution/is-plain-object.ts`; копии в `json-value-equal.ts` и `sort-unordered.ts` удалены.
3. `encodeSpecialValues` не бросает (`specialPrimitiveTag` возвращает тег или `undefined`); недостижимые `try/catch` и `instanceof JavascriptSpecialValueError` в `run-javascript-case.ts` удалены.
4. SPEC: ключ `$js` зарезервирован и в сравниваемых значениях (литеральный `{"$js": "NaN"}` равен `NaN`); `{a: undefined}` ≠ `{}`. То же в корневом `description` схемы. Поведение оставлено как есть.
5. Тесты: sparse array (дырка) и явный `undefined` — отдельные кейсы; `{a: undefined}` vs `{}` (codec и runner); невалидный тег в `calls[].args` с полным путём (и точный путь для `tests[].args`); reject с одинаковыми вложенными особыми значениями — pass, `[undefined]` vs `[null]` — fail. Кейс `undefined` reason уже был («fails rejects when both reject with undefined reason»).

Ревью (2026-09-28, раунд 2). Пункты 1–5 раунда 1 проверены в коде — исправлены: SPEC (раздел практики + таблица) и корневой `description` во всех трёх схемах согласованы с кодом; правила тегов — только в `validateTagObject`; `isPlainObject` — одна копия (`execution/is-plain-object.ts`); `encodeSpecialValues` не бросает, мёртвые `catch` удалены (оставшийся перевод `JavascriptSpecialValueError` → `StructureCodecError` в `prepareArgs` достижим — decode бросает на невалидном теге); тесты покрывают sparse array, `{a: undefined}` vs `{}`, path для `calls[].args`, reject с особыми значениями. `ng test --watch=false` — 405 passed. Замечаний нет.
