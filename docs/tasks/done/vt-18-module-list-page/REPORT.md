---
branch: feature/vt-18-module-list-page
---

# Отчёт vt-18 — Страница модулей курса

## Что сделано

- Smart `CourseModulesPage` для `courses/:courseId`: загрузка курса и прогресса, список модулей, «Выход» → `/courses`.
- Dumb `ModuleListCardComponent`: название, прогресс шагов (completed / total), «Пройти» → `/courses/:courseId/modules/:moduleId`.
- Pure `moduleListItemView` на базе `moduleStepProgress` (vt-13).
- Состояния: загрузка, курс не найден, пустой список модулей.

## Изменённые файлы

- `vibetest-app/src/app/courses/pages/course-modules-page/*`
- `vibetest-app/src/app/courses/ui/module-list-card/*`
- `vibetest-app/src/app/courses/module-list-item-view.ts`

## Тесты

- `ng test --watch=false`: зелёный (115)
- `ng build`: зелёный

## Отклонения от TASK.md

- Маршрут уже был в vt-16/vt-17; изменений в `app.routes.ts` не требовалось.

## Открытые вопросы к ревью

- Переход на первый непройденный шаг — vt-19 (сейчас stub player route).

## Изменения по ревью

_(после замечаний пользователя)_
