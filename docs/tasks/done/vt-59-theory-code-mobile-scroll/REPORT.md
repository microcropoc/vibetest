---
branch: feature/vt-59-theory-code-mobile-scroll
---

# Отчёт vt-59 — Theory: code blocks on mobile

## Что сделано

- `:host` на `TheoryStepUiComponent` — block + width containment, чтобы `pre` мог scroll внутри viewport.
- `player-shell__outlet` / `__step` и `.player-page` — `max-width: 100%`, `min-width: 0`.
- Блоки кода в theory: фон, padding, border, `scrollbar-width: thin`, сохранены `overflow-x: auto` и `white-space: pre` на `pre code`.

## Изменённые файлы

- `vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.scss`
- `vibetest-app/src/app/player/ui/player-shell/player-shell.scss`
- `vibetest-app/src/app/player/pages/player-page/player-page.scss`

## Тесты

- `ng test --watch=false`: зелёный (83 files, 353 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью\n\n- Нет.\n
## Изменения по ревью

Замечаний нет.

