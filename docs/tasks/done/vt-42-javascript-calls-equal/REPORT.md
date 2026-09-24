---
branch: feature/vt-42-javascript-calls-equal
---

# Отчёт vt-42 — JavaScript: `calls` + recursive JSON equal

## Что сделано

- Схема курса/import: опциональный `calls[]` на JS-тестах (`args`, опционально `method`).
- SPEC: семантика `calls`, recursive equal, контракт `non-JSON result`.
- `jsonCompatibleEqual` / `isJsonCompatibleValue` (Object.is, plain objects, циклы без throw).
- `applyJavascriptCalls`, `runJavascriptCaseComparison`; worker импортирует shared logic; compile в `javascript-practice-compile.ts`.
- Runner передаёт `calls` в `javascriptRunCase`.
- Unit + in-process integration specs по checklist TASK.

## Изменённые файлы

- `docs/schemas/course.schema.json`, `docs/schemas/course-import.schema.json`, `docs/SPECIFICATION.md`
- `docs/tasks/done/vt-42-javascript-calls-equal/` — TASK, REPORT
- `vibetest-app/public/schemas/*`, `vibetest-app/src/app/courses/generated/*` (generate:zod)
- `vibetest-app/src/app/execution/javascript-practice.worker.ts`, `javascript-practice-compile.ts`, `execution-messages.ts`
- `vibetest-app/src/app/player/step-engine/javascript/*` (equal, calls, case runner, specs)

## Тесты

- `ng test --watch=false`: **зелёный** (74 files, 226 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Ревью (2026-09-24):

- Шаг с `method` отсекает функции и примитивы (`typeof !== 'object'`), хотя SPEC — `current = current[method](...call.args)`. → `apply-javascript-calls.ts` → искать и вызывать свойство как в SPEC (метод на функции, метод примитива); ошибка только если свойства нет или оно не функция. Сужение `as Record<string, unknown>` это не проверяет.
- В SPEC не названы `undefined` / `function` / `symbol` / `bigint` как fail `non-JSON result` (TASK: зафиксировать), при этом `NaN` сравнивается через `Object.is`. `Infinity` молча проходит как number. → раздел JavaScript в `docs/SPECIFICATION.md` → явный список запрещённых типов и какие числа допустимы (`NaN`, signed zero, `Infinity`).
- Контракт non-JSON не закрыт тестами кейса: нет `function` / `symbol` / `bigint` и текста `non-JSON result`. Тест methods считает через замыкание `n` и останется зелёным, если пропадет `this`. → `json-value-equal.spec.ts`, `run-javascript-case.spec.ts` → эти типы с message `non-JSON result`; метод, который читает `this`.
- В рабочем дереве ветки есть правки вне vt-42: `docs/PLAN.md` (ссылка на `tasks/backlog/vt-42-javascript-calls-equal.md`, папка уже `in-progress/`), `docs/tasks/_template/REPORT.md`, неотслеживаемые `vt-43`, `vt-44`, `.cursor/rules/code-review.mdc`; `course.types.ts` modified без содержательного диффа. → не коммитить это в `feature/vt-42-javascript-calls-equal`.

**Исправлено:**

- `apply-javascript-calls.ts`: `Reflect.get(Object(current), method)` + `apply`; throw только для null/undefined или не-функции.
- `docs/SPECIFICATION.md`: явный список non-JSON и правила для чисел (`NaN`, ±0, `Infinity`).
- Тесты: `non-JSON result` для function/symbol/bigint; counter methods на `this.n`; method на function; unit на function/symbol/bigint и `Infinity`.
- Scope вне vt-42 в коммит не включать (на усмотрение автора при staging).
