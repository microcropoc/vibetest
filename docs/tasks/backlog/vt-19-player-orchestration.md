# vt-19 — Player orchestration

## Контекст

Плеер связывает курс, модуль, прогресс и step engines (vt-4–vt-10); registry/factory по `type` здесь, не в vt-3.

## Цель

Route-scoped service/page logic: load course + progress, open **first incomplete** step (else step 0), dispatch commands to engines, persist via **vt-14**, expose state for UI (vt-20–23).

## Требования

- Зависимости engines: theory, quiz, svg, javascript, sqlite, regex (vt-4–vt-10).
- Save on transitions; retry, complete, run practice; **retry не снимает `completed`**, если шаг уже был успешно пройден.
- `providers` on player route (state dies with route).
- Unit tests orchestration with fake engines/repos.

## Технические заметки

- Зависимости: **vt-4–vt-10**, **vt-14**, **vt-16** (routes).
- Components не вызы Worker напрямую.

## План работ

- [ ] Player route + scoped orchestrator
- [ ] Engine registry by `type`
- [ ] Progress read/write
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] First incomplete step rule из спецификации

## Вне рамок задачи

- Step visual components (vt-20–23), navigation UI (vt-20, touch-only)
