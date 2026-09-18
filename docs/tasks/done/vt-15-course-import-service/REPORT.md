---
branch: feature/vt-15-course-import-service
---

# Отчёт vt-15 — Course import service

## Что сделано

- `parseImportCourseText`: JSON → Zod (`CourseSchema.safeParse`) → semantic; все issues этапа, без следующих шагов.
- `CourseImportService.importCourse(text, { regenerateIds, confirmReplace? })`.
- `regenerateIds: true` → `regenerateCourseIds`, always create.
- `regenerateIds: false` → create или `replace-required` / replace в одной txn (progress wipe + put).

## Изменённые файлы

- `vibetest-app/src/app/courses/import-types.ts` (новый)
- `vibetest-app/src/app/courses/import-parse.ts` (новый)
- `vibetest-app/src/app/courses/course-import.service.ts` (новый)
- `vibetest-app/src/app/courses/index.ts`

## Тесты

- `npx ng test --watch=false`: 99 passed.

## Отклонения от TASK.md

- Нет.

## Replace transaction

- `confirmReplace: true` → `db.transaction`: `ProgressRepository.deleteAllByCourseId` + `courses.put`.

## Открытые вопросы к ревью

- UI replace dialog — vt-24 (`replace-required` + `confirmReplace`).

## Изменения по ревью

_(после замечаний пользователя)_
