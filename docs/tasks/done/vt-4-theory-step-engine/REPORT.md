---
branch: feature/vt-4-theory-step-engine
---

# Отчёт vt-4 — Движок шага theory

## Что сделано

- Ветка `feature/vt-4-theory-step-engine` от `main`; задача перенесена в `done/` после merge в `main`.
- **`player/step-engine/theory/`**: `theoryStepEngine`, `createTheoryStepEngine()`, типы `TheoryEngineState`, `TheoryStepCommand` (`markViewed`, `advance`, `retry`).
- `completed` только по `advance`; `markViewed` → `in-progress` без завершения; retry по контракту vt-3 (completed сохраняется).
- Экспорт из `player/step-engine/index.ts`.

## Изменённые файлы

- `docs/tasks/done/vt-4-theory-step-engine/` — TASK, REPORT
- `vibetest-app/src/app/player/step-engine/theory/**`
- `vibetest-app/src/app/player/step-engine/index.ts`

## Тесты

- `ng test --watch=false`: зелёный (9 файлов / 31 тест)

## Отклонения от TASK.md

- Добавлена команда `markViewed` для явного «просмотрено» до advance (draft в схеме пустой).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
