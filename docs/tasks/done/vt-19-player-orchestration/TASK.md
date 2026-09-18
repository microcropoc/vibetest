# vt-19 — Player orchestration

## Контекст

Плеер связывает курс, модуль, прогресс и step engines (vt-4–vt-10); registry/factory по `type` здесь, не в vt-3.

## Цель

Route-scoped service/page logic: load course (**vt-12**) + progress (**vt-14**), **first incomplete** via **vt-13**, dispatch to engines, persist via **vt-14**; **player shell** с outlet для step UI (vt-21–23), без дублирования orchestration в step-компонентах.

## Требования

- Зависимости engines: theory, quiz, svg, javascript, sqlite, regex (vt-4–vt-10).
- Save on transitions; retry, complete, run practice; **retry не снимает `completed`**, если шаг уже был успешно пройден.
- `providers` on player route (state dies with route).
- Unit tests orchestration with fake engines/repos.

## Технические заметки

- Зависимости: **vt-4–vt-10**, **vt-12**, **vt-13**, **vt-14**, **vt-16** (routes).
- Components не вызы Worker напрямую.

## План работ

- [x] Player route + scoped orchestrator
- [x] Engine registry by `type`
- [x] Progress read/write
- [x] Tests
- [x] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [x] First incomplete step rule из спецификации

## Вне рамок задачи

- Step visual components (vt-20–23), navigation UI (vt-20, touch-only)
