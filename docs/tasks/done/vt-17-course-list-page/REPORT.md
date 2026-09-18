---
branch: feature/vt-17-course-list-page
---

# Отчёт vt-17 — Страница списка курсов

## Что сделано

- `ConfirmDialogComponent` в `shared/ui/` (open/confirm/cancel, тесты).
- Dumb `CourseListCardComponent`: название, прогресс по модулям, «Пройти», «Удалить».
- Smart `CoursesPage`: загрузка через `CourseRepository` + `ProgressRepository`, агрегация `courseListItemView` / vt-13, empty state, удаление с confirm, переход на `/courses/:courseId`.
- `stepProgressLookupFromSnapshots` для построения lookup из IndexedDB snapshots.

## Изменённые файлы

- `vibetest-app/src/app/courses/pages/courses-page/*`
- `vibetest-app/src/app/courses/ui/course-list-card/*`
- `vibetest-app/src/app/courses/course-list-item-view.ts`
- `vibetest-app/src/app/shared/ui/confirm-dialog/*`
- `vibetest-app/src/app/progress/progress-lookup.ts`, `progress/index.ts`

## Тесты

- `ng test --watch=false`: зелёный (110)

## Отклонения от TASK.md

- Глобальный `src/test-setup.ts` (`fake-indexeddb/auto`) в `angular.json` — стабильный IndexedDB при параллельном Vitest после роста числа UI-спеков.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
