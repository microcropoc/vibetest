---
branch: feature/vt-14-progress-repository
---

# Отчёт vt-14 — Progress repository

## Что сделано

- `ProgressRepository`: `get`, `put`, `listByCourseId`, `deleteAllByCourseId`.
- `step-progress-parse.ts`: Zod на row + draft по `type`; `StepProgressSnapshot` на read.
- `deleteAllByCourseId` → только `deleteStepProgressByCourseId` (vt-12), без отдельной транзакции.

## Изменённые файлы

- `vibetest-app/src/app/storage/progress-repository.ts` (новый)
- `vibetest-app/src/app/storage/step-progress-parse.ts` (новый)
- `vibetest-app/src/app/storage/index.ts`

## Тесты

- `npx ng test --watch=false`: 90 passed.

## Отклонения от TASK.md

- Нет.

## Bulk delete

- `ProgressRepository.deleteAllByCourseId` → `deleteStepProgressByCourseId` (vt-12), без своей транзакции.
- Import replace (vt-15): txn с helper + `courses.put` (тест в `progress-repository.spec.ts`).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
