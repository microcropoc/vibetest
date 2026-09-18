---
branch: feature/vt-23-practice-step-ui
---

# Отчёт vt-23 — Practice step UI

## Что сделано

- **`PracticeStepShellComponent`**: общий textarea, «Запустить», состояния running / success / error, лимит `timeoutMs`, описание из content.
- **`practice-step-view`**: labels по типу (JS / SQLite / regex), draft из snapshot, формат сообщений fail-fast.
- **`PlayerOrchestratorService`**: `setPracticeDraft`, `practiceRunning`, `practiceFeedback`, обёртка `runPractice` с UI-feedback.
- **`PlayerShellComponent`**: outlet для javascript / sqlite / regex через `@default` + `isPracticeStep`, `@defer`.

## Изменённые файлы

- `vibetest-app/src/app/player/ui/practice-step-shell/*`
- `vibetest-app/src/app/player/practice-step-view.ts`
- `vibetest-app/src/app/player/player-orchestrator.service.ts`
- `vibetest-app/src/app/player/ui/player-shell/*`

## Тесты

- `ng test --watch=false`: 50 files, 139 tests — зелёный
- `ng build`: зелёный
- Исправлено сужение типа в `practiceDraftFromSnapshot` (`snapshot.type` перед доступом к `draft.pattern` / `draft.draftCode`)

## Отклонения от TASK.md

- Retry только через footer vt-20 (как в TASK).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
