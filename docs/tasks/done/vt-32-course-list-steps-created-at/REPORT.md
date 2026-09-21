---
branch: feature/vt-32-course-list-steps-created-at
---

# Отчёт vt-32 — Карточки курсов: шаги, дата создания, сортировка

## Что сделано

- Расширен `CourseListItemView`: шаги, `createdAt`, `createdAtLabel`.
- `formatCourseCreatedAt` (`ru-RU`, UTC) и `sortCoursesByCreatedAtDesc`.
- Карточка: строки модулей/шагов и «Создан: …»; `CoursesPage` сортирует перед отображением.
- Обновлён раздел «Курсы» в SPEC.

## Изменённые файлы

- `docs/SPECIFICATION.md`
- `vibetest-app/src/app/courses/course-list-item-view.ts` (+ spec)
- `vibetest-app/src/app/courses/format-course-created-at.ts` (+ spec)
- `vibetest-app/src/app/courses/sort-courses-by-created-at.ts` (+ spec)
- `vibetest-app/src/app/courses/ui/course-list-card/*`
- `vibetest-app/src/app/courses/pages/courses-page/*`

## Тесты

- `npm test -- --watch=false`: 61 files, 165 tests — зелёный

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Дата в UI в UTC; локальный часовой пояс пользователя — отдельная задача при необходимости.

## Изменения по ревью

_(после замечаний пользователя)_
