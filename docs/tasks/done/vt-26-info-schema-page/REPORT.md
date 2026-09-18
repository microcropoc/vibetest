---
branch: feature/vt-26-info-schema-page
---

# Отчёт vt-26 — Info page (bundled schema)

## Что сделано

- **`loadBundledCourseSchema`**: fetch `/schemas/course.schema.json` из `public/`.
- **`InfoPage`**: read-only `<pre>`, загрузка / ошибка / pretty-print через `JSON.stringify`.
- Тесты loader + страницы.

## Изменённые файлы

- `vibetest-app/src/app/info/bundled-course-schema.ts`
- `vibetest-app/src/app/info/pages/info-page/*`

## Тесты

- `ng test --watch=false`: 56 files, 155 tests — зелёный
- `ng build`: зелёный; `dist/.../schemas/course.schema.json` на месте

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
