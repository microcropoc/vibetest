---
branch: feature/vt-34-course-prompt-generator
---

# Отчёт vt-34 — Вкладка «Генерация промта»

## Что сделано

- Lazy route `/prompt-generation`, пункт «Генерация промта» после «Инфо».
- `buildCourseGenerationPrompt`: RU, theory/svg/quiz в каждом модуле, import-DTO, полная схема.
- Страница: textarea «Описание курса», «Копировать в буфер обмена».
- `copyTextToClipboard` перенесён в `shared/clipboard/`; «Инфо» обновлено.

## Изменённые файлы

- `docs/SPECIFICATION.md`
- `vibetest-app/src/app/app.routes.ts`
- `vibetest-app/src/app/shared/ui/app-shell/*`
- `vibetest-app/src/app/shared/clipboard/*`
- `vibetest-app/src/app/prompt-generation/*`
- `vibetest-app/src/app/info/pages/info-page/info-page.ts`

## Тесты

- `npm test -- --watch=false`: 64 files, 173 tests — зелёный

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
