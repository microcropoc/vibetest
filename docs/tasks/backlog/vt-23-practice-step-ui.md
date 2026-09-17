# vt-23 — Practice step UI (JS / SQLite / regex)

## Контекст

Общий UI практики: редактор кода/запроса/regex, Run, результаты, timeout/error.

## Цель

Shared practice shell + thin adapters for three types; calls orchestrator/engine, not Worker directly; states running/success/fail/timeout.

## Требования

- Reuse one editor area (textarea MVP OK).
- Run triggers engine via vt-19.
- Show results from engine (fail-fast: после первого провала — итог без «прогона всех»).
- Отображать timeout/error; лимит из `timeoutMs` content (через engine/vt-7).
- `@defer` for heavy parts if needed.
- Tests for component states (mock orchestrator). Retry — только через **vt-20** «Повторить», не отдельная кнопка в practice shell.

## Технические заметки

- Зависимости: **vt-8–vt-10**, **vt-19**.

## План работ

- [ ] PracticeStepShellComponent
- [ ] Type-specific labels/hints
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Три типа практики отображаются через общий shell

## Вне рамок задачи

- Monaco, PWA cache (vt-27)
