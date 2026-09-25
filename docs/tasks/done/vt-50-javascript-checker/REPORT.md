---
branch: feature/vt-50-javascript-checker
---

# Отчёт vt-50 — JavaScript: checker

## Что сделано

- Опциональный step-level `checker` (string, max 10000) в `javascriptContent`: исходник `(ctx) => boolean`.
- На fulfilled-пути **полностью заменяет** equal / `resultMode` / `unordered`; `rejects` и `expectInvocations` применяются раньше; при `rejects: true` checker игнорируется.
- Изолированный sandbox (`new Function`, не user/reference `globalThis`); timeout **250 ms** для thenable-return; ctx: сырые `userResult`/`refResult`/`userArgs`/`refArgs` + `deepEqual`, `serializeList`, `serializeTree`, `sortUnordered`.
- Проброс через runner → Worker case message; UI не показывает `checker` / `referenceSolution`.
- SPEC / PLAN / schema + generated Zod; checklist-тесты.

## Изменённые файлы

- `docs/tasks/done/vt-50-javascript-checker/`
- `docs/schemas/course.schema.json`, `vibetest-app/public/schemas/course.schema.json`
- `docs/SPECIFICATION.md`, `docs/PLAN.md`
- `vibetest-app/src/app/courses/generated/*` (zod/types)
- `run-javascript-checker.ts` (+ spec)
- `run-javascript-case.ts` (+ spec)
- `execution-messages.ts`, `javascript-practice.worker.ts`, `javascript-practice-runner.ts` (+ spec)
- `practice-step-shell.spec.ts`

## Тесты

- `ng test --watch=false`: зелёный (полный прогон)

## Отклонения от TASK.md

- Sync `while(true)` в checker **не** preempted отдельным Worker: timeout покрывает never-settling thenable (`Checker timeout`); sync hang — step `timeoutMs` / terminate practice Worker. Checklist «infinite loop» закрыт thenable-hang.
- Рекомендация TASK (сырые значения + хелперы) принята как есть.

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-25):

1. **`course-import.schema.json` не синхронизирован** → `docs/schemas/course-import.schema.json` и `vibetest-app/public/schemas/course-import.schema.json` → в `course.schema.json` добавлен `checker`, в import-схеме поля нет (`additionalProperties: false`). Авторский JSON с `checker` невалиден по import-схеме / публичному контракту; description `javascriptContent` / `unordered` тоже устарели относительно канона. Ожидание: перенести те же правки в import-схему и прогнать `generate:zod` (копирует public).
2. **Пустой `checker: ""`** → schema (`maxLength` без `minLength`) + runner (`length > 0` → ignore) → пустая строка проходит схему, но ведёт себя как отсутствие поля. Ожидание: `minLength: 1` (как у остальных непустых строк) либо явное поведение в SPEC.

Исправлено:

1. `checker` + актуальные description (`javascriptContent`, `unordered`) перенесены в `course-import.schema.json`; `generate:zod` обновил public-копии и Zod.
2. `minLength: 1` у `checker` в обеих схемах (+ `execution-messages`); пустая строка отклоняется на импорте; тесты в `javascript-content-target.spec.ts`.

Ревью (2026-09-25, раунд 2): Замечаний нет.

