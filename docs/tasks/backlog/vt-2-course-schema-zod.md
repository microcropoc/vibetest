# vt-2 — JSON Schema в проекте и генерация Zod

## Контекст

Спецификация: единственная [`course.schema.json`](../../schemas/course.schema.json) (обязательные `schemaVersion`, `courseId`, `moduleId`, `stepId`). Импорт и домен валидируют через Zod; типы — из сгенерированной схемы. Сейчас в приложении этого нет.

## Цель

В `vibetest-app/` воспроизводимый pipeline: JSON Schema из репо → bundle → **консольная команда** генерации Zod + TypeScript; `parseCourse` / `isCourse`, pure `regenerateCourseIds`, semantic validation; тесты.

## Требования

- Bundle схемы в `public/schemas/` без расхождения с `docs/schemas/course.schema.json`.
- **Первое изменение в коде:** включить **`strict: true`** (и связанные флаги) в `tsconfig` приложения — до domain/generated кода.
- Ранний spike: JSON Schema → Zod и `if`/`then` / `uniqueItems` на шагах; зафиксировать tool в `REPORT.md`.
- **Fallback**, если конвертер не покрывает `if/then`: сгенерировать `$defs/*Content` + обёртки; для `Step` — ручной `z.discriminatedUnion('type', …)`; TypeScript-типы через json-schema-to-typescript (или эквивалент); **smoke** эквивалентности Zod ↔ JSON Schema через **Ajv** на общей матрице валидных/невалидных фикстур (зафиксировать в `REPORT.md`).
- npm-скрипт (например `generate:zod`) — регенерация Zod/types.
- Generated-файлы в отдельном каталоге; **не редактировать вручную**.
- `parseCourse(unknown): Course` / `isCourse` — Zod по `course.schema.json`.
- `regenerateCourseIds(course: Course): Course` (pure): новый `courseId`, новые `moduleId` и `stepId` для всех модулей и шагов через `crypto.randomUUID()`; остальное содержимое без изменений.
- Тесты: valid course parse; invalid JSON/schema; `regenerateCourseIds` меняет все ID и сохраняет контент; smoke актуальности generated.
- **Semantic validation** (pure, на `Course`): уникальность всех ID; quiz indices; практика (JS `args` — лимит в Zod/schema).
- **SQLite `reset` only:** запрет seed-DML в строке `reset` — регистронезависимый поиск SQL-токенов с границей слова: `\bINSERT\b`, `\bINTO\b` (и при необходимости другие явно перечисленные DML-токены в `REPORT.md`); **не** применять к `javascript.reset` (JS-код: `insertAdjacentHTML` и т.п. не должны давать false positive).
- **Не** проверять содержимое JS `setup` (авторская конвенция).

## Технические заметки

- Домен: `courses/` (типы, parse, semantic, `regenerateCourseIds`), скрипт — `vibetest-app/tools/` или корень.
- Strict TS, без `any`; граница `unknown` только в parse.
- Зависимость: **vt-1**.

## План работ

- [ ] Spike + fallback (Zod union / Ajv smoke)
- [ ] Tool JSON Schema → Zod (одна схема)
- [ ] Bundle + npm-скрипт
- [ ] `parseCourse` / `isCourse`, `regenerateCourseIds`, semantic validation
- [ ] Colocated `*.spec.ts` без TestBed
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Команда генерации в `REPORT.md`
- [ ] Тесты зелёные
- [ ] Соответствие [`docs/SPECIFICATION.md`](../../SPECIFICATION.md)

## Вне рамок задачи

- UI импорта, Dexie, ImportService orchestration (vt-15)
- Движки шагов
- Редактирование `docs/schemas/*.json` (только потребление)
