---
branch: feature/vt-48-javascript-construct
---

# Отчёт vt-48 — JavaScript: construct

## Что сделано

- Опциональный `construct: { className }`: первичный шаг `new className(...args)`, далее `calls` как раньше.
- Ровно одно из `functionName` | `construct`: Zod `superRefine` (`JavascriptContentWithTargetSchema`); в JSON Schema оба поля опциональны (без `allOf` — `json-schema-to-zod` генерировал сломанный oneOf).
- Compile target `{ kind: 'function' | 'construct' }`; Worker init / runner проброс; init errors с `request.id` и message ученику.
- Checklist-тесты (LRU, fail get, missing class, XOR schema, `resultMode: args` + construct).
- `ng test`: 292 зелёных.

## Изменённые файлы

- `docs/schemas/course.schema.json`, `course-import.schema.json`, `SPECIFICATION.md`, `PLAN.md`
- `docs/tasks/done/vt-48-javascript-construct/`
- `vibetest-app/public/schemas/*`, `generated/*`
- `javascript-content-target.ts` (+ spec)
- `course-zod-schema.ts`, `import-course-zod-schema.ts`, `semantic-validation.ts` (+ spec)
- `javascript-practice-compile.ts`, `execution-messages.ts`, `javascript-practice.worker.ts`
- `javascript-practice-runner.ts` (+ spec), `run-javascript-case.spec.ts`

## Тесты

- `ng test --watch=false`: зелёный (292)

## Отклонения от TASK.md

- XOR не через JSON Schema `allOf`/`oneOf` (ломает generate:zod), а через Zod `JavascriptContentWithTargetSchema` на импорте (без дубля в semantic).

## Открытые вопросы к ревью

- Для цепочки `calls` после `construct` мутирующие методы обычно должны `return this` (иначе следующий `method` вызывается на `undefined`) — как и при factory + `functionName`. Зафиксировать в author docs при vt-51?

## Изменения по ревью

Ревью (2026-09-25):

1. **Нет понятного fail при отсутствующем `className` в Worker-пути** → `javascript-practice.worker.ts` (init) + `javascript-practice-runner.ts` → checklist TASK: missing class → fail message. Сейчас `compileJavascriptPracticeCallable` бросает, внешний `catch` шлёт `{ type: 'error', id: 'unknown', message: 'Invalid request' }`; wrapper ждёт `request.id` → фактически timeout. Даже при корректном error runner на init делает `Unexpected init response` и **не** пробрасывает `message`. Ожидание: try/catch вокруг compile с `id: request.id` и текстом ошибки; в runner — ветка `initResponse.type === 'error'` → `message` ученику. Тест dualEnv `.toThrow` покрывает только sync-compile, не плеер.
2. **Тест semantic не проверяет semantic** → `semantic-validation.spec.ts` («flags javascript step with both…») → вызывается `parseCourse` (Zod XOR), а не `validateCourseSemantics`. `validateJavascriptTarget` дублирует Zod и остаётся без покрытия. Ожидание: либо тест через `validateCourseSemantics` (объект в обход Zod), либо убрать дубль и опереться на `JavascriptContentWithTargetSchema`.
3. **Мелочь:** inline-тип target в worker → импортировать `JavascriptPracticeTarget` из `javascript-practice-compile.ts` (уже есть зависимость).

Исправлено (2026-09-25):

1. Worker: try/catch на compile → `error` с `request.id` и `error.message`; runner: `initResponse.type === 'error'` → `message`; тест `surfaces init error message when class is missing`.
2. Убран дубль `validateJavascriptTarget`; XOR только в `JavascriptContentWithTargetSchema` (+ already covered specs).
3. Worker импортирует `JavascriptPracticeTarget`.

Ревью (2026-09-25, раунд 2): Замечаний нет.

