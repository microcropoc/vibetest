---
branch: feature/vt-43-javascript-async-promises
---

# Отчёт vt-43 — JavaScript: async / promises

## Что сделано

- Схема/import: опциональный `rejects` на JS-тестах.
- SPEC: await thenables после каждого шага; ветка `rejects`; sync throw ≠ reject (v1).
- `await-thenable.ts`, `apply-javascript-calls-async.ts`, async `runJavascriptCaseComparison` с `deadlineMs` / `rejects`.
- Worker: async handler для `javascriptRunCase`; runner передаёт `rejects` и `deadlineMs`.
- Checklist specs + регрессия vt-42.

## Изменённые файлы

- `docs/schemas/course.schema.json`, `docs/schemas/course-import.schema.json`, `docs/SPECIFICATION.md`
- `docs/tasks/done/vt-43-javascript-async-promises/` — TASK, REPORT
- `vibetest-app/public/schemas/*`, `vibetest-app/src/app/courses/generated/*`
- `vibetest-app/src/app/execution/javascript-practice.worker.ts`, `execution-messages.ts`
- `vibetest-app/src/app/player/step-engine/javascript/*` (await, async calls, run-javascript-case, specs)

## Тесты

- `ng test --watch=false`: **зелёный** (74 files, 240 tests)

## Отклонения от TASK.md

- v1: `rejects: true` только для thenable reject; sync throw — fail кейса (не сравнение reason).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Ревью (2026-09-24): ветка `feature/vt-43-javascript-async-promises`, закоммиченного относительно `main` нет — смотрел весь WIP (schemas/SPEC + JS runner/worker/async chain + specs).

1. **Thenable detection режет function-thenables** → `await-thenable.ts` / `isThenable`: условие `typeof value !== 'object'` отбрасывает значения с `typeof === 'function'`, у которых callable `then`. TASK/SPEC: критерий — `typeof then === 'function'` (Promises/A+ допускает function thenable). Ожидание: non-nullish + callable `then`, без требования именно `object`.

2. **Нет покрытия non-Promise thenable** → `run-javascript-case.spec.ts` (и TASK technical notes: «не требовать нативный Promise»). Сейчас только `Promise.resolve` / `Promise.reject`. Ожидание: хотя бы один кейс с `{ then(resolve) { resolve(...) } }` (fulfill) и аналог reject.

3. **Мёртвый sync API** → `applyJavascriptCalls` в `apply-javascript-calls.ts` больше нигде не импортируется после перехода на async chain. Ожидание: удалить неиспользуемый экспорт (оставить `applyJavascriptCallStep` + тип) либо явно оставить и использовать.

4. **Worker: fire-and-forget без фиксации runtime** → `javascript-practice.worker.ts`, ветка `javascriptRunCase`: `void (async () => { runtime?.…; runtime!.… })()`. Handler не сериализует кейсы; при перекрывающихся сообщениях возможны гонки reset/invoke. Ожидание: захватить `const active = runtime` до `await` (без `!`/`?.` на общем поле); по возможности не принимать следующий `RunCase`, пока текущий не завершён.

5. **Пробел checklist: `rejects: true` + sync throw** → семантика TASK §5 / отклонение в REPORT; в specs есть mid-chain throw без `rejects`, но нет явного `rejects: true` + sync `throw` → fail (не сравнение reason). Ожидание: добавить такой кейс.

**Исправлено:**

- `isThenable`: non-nullish + callable `then` (function-thenables).
- Specs: custom `{ then }` fulfill/reject; `rejects: true` + sync throw → fail с message.
- Удалён неиспользуемый `applyJavascriptCalls`.
- Worker: `const active = runtime`, `caseInFlight`, без гонок reset/invoke.

Ревью (2026-09-24, раунд 2): повторная проверка WIP (`main..HEAD` пусто) + правки по раунду 1. Пункты 1–5 закрыты. Новых замечаний нет.
