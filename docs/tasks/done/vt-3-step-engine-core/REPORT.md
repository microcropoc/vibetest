---
branch: feature/vt-3-step-engine-core
---

# Отчёт vt-3 — Общий контракт движка шага

## Что сделано

- Ветка `feature/vt-3-step-engine-core` от `main`; задача перенесена в `done/` после merge в `main`.
- Домен **`vibetest-app/src/app/player/step-engine/`**: контракт `StepEngine<S, C>`, `StepStatus`, `StepProgressSnapshot` (draft union по `type`), `CoreStepCommand`, helpers (`advance`, check success/fail, `retry`).
- **Инвариант retry:** сброс draft + `lastCheckFailed`; `completed` не снимается (спека плеера).
- **Stub** `stubViewableStepEngine` (theory/svg) для проверки контракта без registry.
- **Соглашение vt-4+:** конкретные движки в `player/step-engine/<type>/`.

## Изменённые файлы

- `docs/tasks/done/vt-3-step-engine-core/` — TASK, REPORT
- `vibetest-app/src/app/player/step-engine/**` — core types, helpers, stub, specs, `index.ts`

## Тесты

- `ng test --watch=false`: зелёный (8 файлов / 26 тестов, +10 для vt-3)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
