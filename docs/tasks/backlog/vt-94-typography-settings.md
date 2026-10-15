# vt-94 — Настройки шрифтов и размеров (UI и код)

## Контекст

Сейчас размеры и семейства шрифтов заданы локально в SCSS страниц и компонентов; тема ([`vt-40`](../../done/vt-40-settings-themes/)) меняет только цвета через `data-theme`. Замечание: пользователю нужна возможность **менять шрифты и их размеры** — отдельно для **интерфейса** и для **моноширинного** контента (редактор практики, `<pre>` на Инфо, SQL diff, JSON поля после vt-91).

## Цель

В **Настройках** пользователь выбирает семейство и размер шрифта UI и отдельно — моноширинного текста; изменения применяются сразу ко всему приложению и сохраняются в IndexedDB (`settings`), как тема.

## Требования

- **Два профиля типографики:**
  - **UI:** `--font-ui-family`, `--font-ui-size` (базовый rem/body; заголовки масштабируются относительно или через отдельный коэффициент — зафиксировать простую модель в задаче при реализации).
  - **Code:** `--font-code-family`, `--font-code-size` — practice CodeMirror ([`practice-codemirror-theme.ts`](../../../../vibetest-app/src/app/player/ui/code-editor/practice-codemirror-theme.ts)), markdown inline/fenced code, info schema pre, sql-result-diff, service textarea monospace.
- **UI настроек:** секция на [`settings-page`](../../../../vibetest-app/src/app/settings/pages/settings-page/): preset или select для семейства (ограниченный безопасный список system stacks: system-ui, serif option, monospace stacks для code); размер — discrete steps (например S/M/L) или range с min/max px/rem.
- **Кнопка «По умолчанию»** — сброс к built-in defaults без удаления темы.
- **Storage:** новые keys в `settings` (например `typographyUi`, `typographyCode`); parse через Zod или узкие `parseTypography*` с `unknown` на границе; миграция не нужна — отсутствие key = defaults.
- **Применение:** при init (`ThemeService`-аналог `TypographyService` или расширение theme apply) выставлять CSS variables на `document.documentElement`; [`styles.scss`](../../../../vibetest-app/src/styles.scss) — body и компоненты используют variables вместо hardcoded `font-size` где критично для consistency (минимальный diff: globals + code surfaces).
- **SPEC:** раздел Настройки — типографика; offline-first, без web fonts CDN в MVP (только system/local stacks) unless явно добавлены self-hosted в public.
- **Тесты:** parse defaults, persist round-trip, apply to document; settings-page smoke выбора.

## Технические заметки

- Папки: `settings/` (model, parse, service, ui), `storage/settings-repository`, `storage/settings-row-parse`, `styles.scss`, точечно `player/ui/code-editor`, `shared/ui`.
- `ng g component settings/ui/typography-picker` (или два compact control).
- Не ломать e-ink readability — размеры с cap max.

## План работ

- [ ] Модель + parse + repository keys
- [ ] TypographyService + CSS variables в styles
- [ ] UI на settings-page
- [ ] Подключить code editor и основные monospace surfaces
- [ ] SPEC + tests + `ng test --watch=false`

## Критерии готовности (Definition of Done)

- [ ] UI и code шрифт/размер настраиваются и переживают перезагрузку
- [ ] Редактор практики и типичный theory markdown отражают выбор
- [ ] Defaults восстанавливаются одной кнопкой
- [ ] Тесты зелёные; strict TS, signals в UI

## Вне рамок задачи

- Загрузка custom web fonts / Google Fonts
- Per-course typography
- Markdown editor WYSIWYG
