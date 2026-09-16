# vt-22 — Quiz step UI

## Контекст

Quiz UI: radio vs checkbox по числу `correctIndices`; submit, ошибка, retry.

## Цель

Dumb quiz component: options binding, submit to orchestrator **vt-19** / engine **vt-5**; show failure state.

## Требования

- Single correct → radio; multiple → checkbox.
- Submit disabled until valid selection.
- Retry button delegates to orchestrator.
- Component tests with TestBed.

## Технические заметки

- Зависимости: **vt-5**, **vt-19**.

## План работ

- [ ] QuizStepComponent
- [ ] Wire submit/retry
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] UX соответствует quiz в спецификации

## Вне рамок задачи

- Practice steps
