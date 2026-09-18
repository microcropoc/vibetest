---
branch: feature/vt-19-player-orchestration
---

# Отчёт vt-19 — Player orchestration

## Что сделано

- **`stepEnginesByType`** registry (theory, quiz, svg, javascript, sqlite, regex) в `step-engine-registry.ts`.
- **`reducePlayerStep` / `applyPracticeResultToStep`** — pure dispatch к engines; **`PlayerOrchestratorService`**: load course+progress, **first incomplete** step (vt-13), `dispatch`, `runPractice` (Workers через `ExecutionWorkerWrapperService`), persist через `ProgressRepository`.
- **`PlayerShellComponent`** — outlet-заглушка для step UI (vt-21–23).
- **`PlayerPage`**: route-scoped `providers: [PlayerOrchestratorService]`, `effect` reload по `courseId` / `moduleId`.

## Изменённые файлы

- `vibetest-app/src/app/player/player-orchestrator.service.ts`
- `vibetest-app/src/app/player/player-step-reducer.ts`, `player-step-command.ts`
- `vibetest-app/src/app/player/step-engine/step-engine-registry.ts`, `index.ts`
- `vibetest-app/src/app/player/pages/player-page/*`
- `vibetest-app/src/app/player/ui/player-shell/*`

## Тесты

- `ng test --watch=false`: зелёный (120)
- `ng build`: зелёный

## Отклонения от TASK.md

- `PlayerOrchestratorService` в **`providers` компонента `PlayerPage`** (lazy chunk), а не в `Route.providers` — тот же lifecycle «state dies with route», без eager-import orchestrator в `app.routes.ts`.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
