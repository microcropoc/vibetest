---
branch: feature/vt-13-progress-domain
---

# Отчёт vt-13 — Progress domain (pure)

## Что сделано

- `progress/`: lookup (`StepProgressByStepId` → `StepProgressLookup`), агрегации модуль/курс, `firstIncompleteStepIndex`, `stepIndicatorState`.
- Без Angular и Dexie; статусы из `player/step-engine/step-status`.

## Изменённые файлы

- `vibetest-app/src/app/progress/*` (новый)

## Тесты

- `npx ng test --watch=false`: 85 passed.

## Отклонения от TASK.md

- Нет.

## Входные данные

- `Course` + `StepProgressLookup` (из `Record<stepId, { status, lastCheckFailed }>`).

## Индикаторы

- `stepIndicatorState(progress, isCurrentStep)`: **current → failed → completed → untouched**.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
