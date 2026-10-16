---
branch: feature/vt-96-prompt-practice-step-relevance
---

# Отчёт vt-96 — Уместность практических шагов (JS, SQL, Regex) в промтах генерации курса

## Что сделано

- Добавлен блок `INSTRUCTION_PRACTICE_RELEVANCE` с правилами выбора шагов `javascript`, `sqlite` и `regex` по теме запроса автора.
- Блок подключён в одиночный промт (`buildCourseGenerationPrompt`) и в промт плана (`buildOutlineMessages`).
- Уточнены заголовки `INSTRUCTION_SQLITE_PRACTICE` и `INSTRUCTION_REGEX_PRACTICE` (применять только при наличии соответствующих шагов в курсе/плане модуля).
- Обновлён `OUTLINE_SELF_CHECK` для самопроверки уместности практики в плане.
- В промты генерации первого и последующих модулей добавлено правило не добавлять практические шаги, отсутствующие в плане модуля.

## Изменённые файлы

- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts`
- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.spec.ts`
- `vibetest-app/src/app/prompt-generation/build-staged-generation-messages.ts`
- `vibetest-app/src/app/prompt-generation/build-staged-generation-messages.spec.ts`
- `docs/tasks/in-progress/vt-96-prompt-practice-step-relevance/TASK.md` (перенос из backlog)
- `docs/tasks/in-progress/vt-96-prompt-practice-step-relevance/REPORT.md`

## Тесты

- `ng test --watch=false`: зелёный (130 файлов, 795 тестов)

## Отклонения от TASK.md

- JSON Schema `course-outline.schema.json` не менялась: достаточно инструкций в промтах и `OUTLINE_SELF_CHECK`.

## Открытые вопросы к ревью

-

## Изменения по ревью

### Ревью 1 (2026-10-16)

Замечаний нет.

