---
branch: feature/vt-56-js-schema-semantics-docs
---

# Отчёт vt-56

## Что сделано

- `$comment` в `$defs.javascriptContent`: явно, что голая схема не заменяет `JavascriptContentWithTargetSchema`.
- Уточнены descriptions: `checker` (ctx materialized/serialized, read-only, пример serializeList), `timeoutMs` (step deadline; checker 250 ms отдельно на thenable), `unordered` (stable key vs list/tree warning).
- SPEC: caveat raw JSON Schema; checker thenable vs sync hang; таблица practice выровнена с ctx.
- `npm run generate:zod` — sync public schemas и Zod `.describe()`.

## Изменённые файлы

- `docs/schemas/course-import.schema.json`
- `docs/schemas/course.schema.json`
- `docs/SPECIFICATION.md`
- `vibetest-app/public/schemas/course-import.schema.json`
- `vibetest-app/public/schemas/course.schema.json`
- `vibetest-app/src/app/courses/generated/content-schemas.zod.ts`

## Тесты

- `ng test --watch=false`: 83 files, 349 tests — зелёный

## Отклонения от TASK.md

- Нет

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-25): ветка `feature/vt-56-js-schema-semantics-docs`, коммитов относительно `main` нет — смотрел WIP (schemas/SPEC + generated Zod). Public schemas sync ок.

1. **Документация завышает связку 250 ms checker ↔ `timeoutMs`** → исправлено: SPEC + `timeoutMs.description` (import/course) — 250 ms только на thenable-return, отдельно от `deadlineMs` кейса; sync hang → `timeoutMs` / terminate.
2. **Таблица practice в SPEC не обновлена под новую семантику ctx** → исправлено: ячейка `javascript` — сырые results; args materialized; thenable timeout 250 ms.

Ревью (2026-09-25, раунд 2): повторная проверка WIP (`main..HEAD` пусто). Пункты 1–2 закрыты. Новых замечаний нет.
