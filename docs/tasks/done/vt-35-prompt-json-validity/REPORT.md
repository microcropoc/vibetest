---
branch: feature/vt-35-prompt-json-validity
---

# Отчёт vt-35 — Промт генерации: валидный JSON и экранирование

## Что сделано

- Расширены инструкции в `buildCourseGenerationPrompt`: экранирование строк, запреты синтаксиса, самопроверка `JSON.parse` + schema.
- Тесты на ключевые фразы правил.
- SPEC — подраздел «Генерация промта».

## Изменённые файлы

- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts` (+ spec)
- `docs/SPECIFICATION.md`

## Тесты

- `npm test -- --watch=false`: 64 files, 174 tests — зелёный

## Отклонения от TASK.md

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
