---
branch: feature/vt-30-info-schema-base-href
---

# Отчёт vt-30 — Info: schema URL с учётом base href

## Что сделано

- `bundledCourseSchemaUrl()` строит URL через `new URL('schemas/course.schema.json', document.baseURI)` — на GitHub Pages запрос идёт в `/vibetest/schemas/...`, а не в корень домена.
- Удалена константа `BUNDLED_COURSE_SCHEMA_URL`; тесты обновлены.

## Изменённые файлы

- `vibetest-app/src/app/info/bundled-course-schema.ts`
- `vibetest-app/src/app/info/bundled-course-schema.spec.ts`
- `vibetest-app/src/app/info/pages/info-page/info-page.spec.ts`

## Тесты

- `npm test -- --watch=false`: 58 files, 159 tests — зелёный

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- После деплоя проверить вкладку «Инфо» на https://microcropoc.github.io/vibetest/info

## Изменения по ревью

_(после замечаний пользователя)_
