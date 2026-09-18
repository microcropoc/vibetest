---
branch: feature/vt-21-theory-svg-step-ui
---

# Отчёт vt-21 — Theory и SVG step UI

## Что сделано

- **`TheoryStepUiComponent`**: markdown через **[marked](https://marked.js.org/)** (`renderMarkdownToHtml`), trusted HTML via `bypassSecurityTrustHtml`.
- **`SvgStepUiComponent`**: inline SVG + optional caption/description, trusted `innerHTML`.
- **`PlayerShellComponent`**: `@switch` по `step.type`, `@defer` для theory/svg outlet; quiz/practice — placeholder vt-22–23.

## Изменённые файлы

- `vibetest-app/package.json`, `package-lock.json` — dependency `marked`
- `vibetest-app/src/app/player/markdown/render-markdown.ts`
- `vibetest-app/src/app/player/ui/theory-step-ui/*`, `svg-step-ui/*`
- `vibetest-app/src/app/player/ui/player-shell/*`

## Тесты

- `ng test --watch=false`: зелёный (130)
- `ng build`: зелёный (lazy chunks `theory-step-ui`, `svg-step-ui`)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
