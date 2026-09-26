# vt-59 — Theory: code blocks on mobile

## Контекст

На шаге **Theory** длинные fenced code blocks на узком viewport уходят за край экрана; страница обрезается (`overflow-x: clip`), внутренний scroll у `<pre>` не срабатывает из‑за раздувания хоста `app-theory-step-ui` (`display: inline`).

## Цель

Длинный код в theory читается на мобильном: **горизонтальный scroll внутри `<pre>`**, без page-level horizontal overflow (SPEC § адаптивность).

## Требования

- `:host` и цепочка контейнеров плеера ограничивают ширину (`max-width: 100%`, `min-width: 0`).
- `<pre>` — `overflow-x: auto`, `white-space: pre` на `pre code`; inline `code` — перенос как сейчас.
- Визуальная affordance у блока кода (фон/padding/тонкий scrollbar), по аналогии с info schema `<pre>`.
- Ручная проверка 320–375 px: `scrollWidth <= clientWidth` на document, scroll внутри `pre`.

## Технические заметки

- [`theory-step-ui.scss`](../../../vibetest-app/src/app/player/ui/theory-step-ui/theory-step-ui.scss)
- [`player-shell.scss`](../../../vibetest-app/src/app/player/ui/player-shell/player-shell.scss)
- [`player-page.scss`](../../../vibetest-app/src/app/player/pages/player-page/player-page.scss)
- Без изменений markdown-рендера и без `pre-wrap` для блоков кода.

## План работ

- [x] CSS containment на host и player shells
- [x] Стили `pre` (affordance + scroll)
- [x] Проверка viewport + `ng test`

## Критерии готовности (Definition of Done)

- [x] Тесты зелёные (`ng test --watch=false`)
- [x] Код на theory не обрезается без возможности прочитать

## Вне рамок задачи

- Перенос длинных строк кода (`pre-wrap`)
- SVG/quiz/practice overflow (уже покрыто vt-39, если не регресс)
