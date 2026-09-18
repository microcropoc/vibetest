# vt-2 — JSON Schema в проекте и генерация Zod

## Контекст

Спецификация: единственная [`course.schema.json`](../../schemas/course.schema.json) (обязательные `schemaVersion`, `courseId`, `moduleId`, `stepId`). Импорт и домен валидируют через Zod; типы — из сгенерированной схемы. Сейчас в приложении этого нет.

## Цель

В `vibetest-app/` воспроизводимый pipeline: JSON Schema из репо → bundle → **консольная команда** генерации Zod + TypeScript; `parseCourse` / `isCourse`, pure `regenerateCourseIds`, semantic validation; тесты.

## Требования

- Bundle схемы в `public/schemas/` без расхождения с `docs/schemas/course.schema.json`.
- Ранний spike: JSON Schema → Zod должен поддержать `if`/`then` на шагах; зафиксировать tool в `REPORT.md`.
- Включить **`strict: true`** (и связанные флаги) в `tsconfig` приложения.
- npm-скрипт (например `generate:zod`) — регенерация Zod/types.
- Generated-файлы в отдельном каталоге; **не редактировать вручную**.
- `parseCourse(unknown): Course` / `isCourse` — Zod по `course.schema.json`.
- `regenerateCourseIds(course: Course): Course` (pure): новый `courseId`, новые `moduleId` и `stepId` для всех модулей и шагов через `crypto.randomUUID()`; остальное содержимое без изменений.
- Тесты: valid course parse; invalid JSON/schema; `regenerateCourseIds` меняет все ID и сохраняет контент; smoke актуальности generated.
- **Semantic validation** (pure, на `Course`): уникальность всех ID; quiz indices; практика (JS `argsGenerator`; JS/SQLite `reset` без SQL seed/`INSERT` — seed только в `tests[].seed`). **Не** проверять содержимое JS `setup` (авторская конвенция).

## Технические заметки

- Домен: `courses/` (типы, parse, semantic, `regenerateCourseIds`), скрипт — `vibetest-app/tools/` или корень.
- Strict TS, без `any`; граница `unknown` только в parse.
- Зависимость: **vt-1**.

## План работ

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
