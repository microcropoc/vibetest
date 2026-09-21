---
branch: feature/vt-31-course-import-dto
---

# Отчёт vt-31 — Import-DTO и канонический Course DTO

## Что сделано

- **Canonical DTO:** [`docs/schemas/course.schema.json`](../../../schemas/course.schema.json) — обязательное `createdAt` (`format: date-time`); `CourseSchema` + `parseCourse` для IndexedDB.
- **Import DTO:** [`docs/schemas/course-import.schema.json`](../../../schemas/course-import.schema.json) — без `courseId` / `moduleId` / `stepId` / `createdAt`; автономные `$defs`, без `$ref` на основную схему.
- **Импорт:** `ImportCourseSchema` → `importDtoToCourse()` (UUID + `createdAt`) → `validateCourseSemantics`; legacy JSON с UUID отклоняется на этапе Zod.
- **Generate/bundle:** `npm run generate:zod` копирует обе схемы в `public/schemas/`; sync-тесты для обоих файлов.
- **SPEC** и примеры [`docs/courses/*.json`](../../../courses/) переведены на import-DTO (без UUID).
- Фикстуры: `minimalValidImportJson()` / `minimalValidCourseJson()`.

## Изменённые файлы

- `docs/schemas/course.schema.json`, `docs/schemas/course-import.schema.json` (новый)
- `docs/SPECIFICATION.md`, `docs/courses/*.json`
- `vibetest-app/tools/generate-course-schema.mts`
- `vibetest-app/public/schemas/course.schema.json`, `course-import.schema.json`
- `vibetest-app/src/app/courses/` — import schemas, mapper, parse, fixtures, tests
- `vibetest-app/src/app/courses/generated/course.types.ts` (regenerated)
- Specs step-engine (поле `createdAt` в inline `parseCourse`)

## Тесты

- `npm test -- --watch=false`: 59 files, 162 tests — зелёный

## Отклонения от TASK.md

- Страница «Инфо» пока показывает только `course.schema.json` (import schema в bundle, без отдельного UI).

## Открытые вопросы к ревью

- Миграция курсов в IndexedDB без `createdAt` не делалась (вне рамок).

## Изменения по ревью

_(после замечаний пользователя)_
