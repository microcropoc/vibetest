---
branch: feature/vt-20-player-navigation-ui
---

# Отчёт vt-20 — Player navigation UI

## Что сделано

- **`StepIndicatorBarComponent`**: квадратики шагов, цвета через `stepIndicatorState` (vt-13), tap → `selectStep`.
- **`PlayerNavComponent`**: Назад, Повторить, Далее / Выход (на последнем шаге).
- **`stepIndicatorItems`** — pure mapping steps + snapshots → indicator views.
- **`PlayerOrchestratorService`**: `goBack`, `goNext` (advance для theory/svg), `retry`, `isFirstStep` / `isLastStep`, `sessionCourseId` / `sessionModuleId`.
- **`PlayerPage`** связывает nav/indicators с orchestrator; Выход → `/courses/:courseId`.

## Изменённые файлы

- `vibetest-app/src/app/player/ui/step-indicator-bar/*`, `player-nav/*`
- `vibetest-app/src/app/player/step-indicator-items.ts`
- `vibetest-app/src/app/player/player-orchestrator.service.ts`
- `vibetest-app/src/app/player/pages/player-page/*`

## Тесты

- `ng test --watch=false`: зелёный (127)
- `ng build`: зелёный

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
