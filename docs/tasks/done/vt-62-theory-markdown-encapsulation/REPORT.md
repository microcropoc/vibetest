---
branch: feature/vt-62-theory-markdown-encapsulation
---

# Отчёт vt-62 — Theory: markdown styles pierce encapsulation

## Что сделано

- Правила для markdown-потомков в `TheoryStepUiComponent` обёрнуты в `:host ::ng-deep`, чтобы стили применялись к HTML из `[innerHTML]` (в т.ч. `overflow-x: auto`, affordance у `pre`).
- Добавлен spec: fenced code block получает `overflow-x: auto` и видимый border.

## Изменённые файлы

- `vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.scss`
- `vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.spec.ts`

## Тесты

- `ng test --watch=false`: зелёный (85 files, 372 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Замечаний нет.
