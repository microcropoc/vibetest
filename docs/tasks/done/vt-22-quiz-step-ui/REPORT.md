---
branch: feature/vt-22-quiz-step-ui
---

# Отчёт vt-22 — Quiz step UI

## Что сделано

- **`QuizStepUiComponent`**: radio / checkbox по числу `correctIndices`, «Проверить» disabled до валидного выбора, сообщение об ошибке при `lastCheckFailed`.
- **`PlayerShellComponent`**: outlet quiz → `dispatch(setSelection | submitAnswer)` через `PlayerOrchestratorService`; **Повторить** — footer vt-20 → `orchestrator.retry()`.

## Изменённые файлы

- `vibetest-app/src/app/player/ui/quiz-step-ui/*`
- `vibetest-app/src/app/player/ui/player-shell/*`

## Тесты

- `ng test --watch=false`: зелёный (134)
- `ng build`: зелёный (lazy chunk `quiz-step-ui`)

## Отклонения от TASK.md

- Отдельной кнопки «Повторить» в quiz-компоненте нет — используется общая навигация vt-20 (как в REVIEW).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
