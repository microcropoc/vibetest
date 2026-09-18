---
branch: feature/vt-25-statistics-page
---

# Отчёт vt-25 — Statistics page

## Что сделано

- **`courseStatisticsView`**: агрегаты через `courseModuleProgress` / vt-13 (модули и шаги).
- **`CourseStatisticsCardComponent`**: read-only карточка курса.
- **`StatisticsPage`**: загрузка курсов и прогресса из репозиториев, empty state.

## Изменённые файлы

- `vibetest-app/src/app/statistics/pages/statistics-page/*`
- `vibetest-app/src/app/statistics/course-statistics-view.ts`
- `vibetest-app/src/app/statistics/ui/course-statistics-card/*`

## Тесты

- `ng test --watch=false`: 54 files, 150 tests — зелёный
- `ng build`: зелёный

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
