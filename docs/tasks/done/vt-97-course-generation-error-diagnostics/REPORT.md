---
branch: feature/vt-97-course-generation-error-diagnostics
merged: "e5bf400"
---

# Отчёт vt-97 — Диагностика ошибки генерации курса (промт и ответ модели)

## Что сделано

- При ошибке этапа генерации курса (exhausted / fatal) на странице показываются сворачиваемые блоки с промтом и ответом модели последней попытки и кнопками копирования.
- В API-слое сохраняется `rawResponse` при `finish_reason: length`, если сервер вернул непустой текст.
- `StagedCourseGenerator` прокидывает `prompt` (`joinStagedMessages`) и `rawResponse` в исходы неуспешных попыток.

## Изменённые файлы

- `vibetest-app/src/app/course-generation/openai-chat-completions.ts`
- `vibetest-app/src/app/course-generation/run-with-retry.ts`
- `vibetest-app/src/app/course-generation/staged-course-generator.service.ts`
- `vibetest-app/src/app/course-generation/pages/course-generation-page/*`
- `vibetest-app/src/app/course-generation/*.spec.ts` (openai-chat-completions, staged-course-generator, course-generation-page)
- `docs/SPECIFICATION.md`
- `docs/tasks/in-progress/vt-97-course-generation-error-diagnostics/`

## Тесты

- `ng test --watch=false`: зелёный (798 тестов)

## Отклонения от TASK.md

- Нет

## Открытые вопросы к ревью

- Нет

## Изменения по ревью

### Ревью 1 (2026-10-16)

Замечаний нет.
