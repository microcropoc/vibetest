---
branch: feature/vt-12-course-repository
---

# Отчёт vt-12 — Course repository

## Что сделано

- `deleteStepProgressByCourseId(table, courseId)` — composable, без своей транзакции.
- `CourseRepository` (`providedIn: 'root'`): `list`, `get`, `put`/`replace`, `delete` (progress + course в одной txn).
- Read path: `courseFromRow` → `parseCourse`; write: `courseToRow`.
- `VibetestDbProvider` — lazy singleton DB для DI; `CourseRepository.forDb(db)` для тестов.
- `deleteCourseAndProgress` переведён на helper.

## Изменённые файлы

- `vibetest-app/src/app/storage/course-repository.ts` (новый)
- `vibetest-app/src/app/storage/course-row-parse.ts` (новый)
- `vibetest-app/src/app/storage/delete-step-progress-by-course-id.ts` (новый)
- `vibetest-app/src/app/storage/vibetest-db-provider.ts` (новый)
- `vibetest-app/src/app/storage/test-db-harness.ts` (новый)
- `vibetest-app/src/app/storage/course-progress-transaction.ts`
- `vibetest-app/src/app/storage/index.ts`

## Тесты

- `npx ng test --watch=false`: 76 passed.

## Отклонения от TASK.md

- Нет.

## Helper для vt-14

- **`deleteStepProgressByCourseId(stepProgressTable, courseId)`** — вызывать внутри `db.transaction('rw', [courses, stepProgress], async () => { … })`.
- **`CourseRepository.delete`** — эталон: helper + `courses.delete`.
- Import replace с wipe progress: txn с `deleteStepProgressByCourseId` + `courses.put` (тест в `course-repository.spec.ts`).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
