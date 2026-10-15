---
branch: feature/vt-94-typography-settings
---

# Отчёт vt-94 — Настройки шрифтов и размеров (UI и код)

## Что сделано

- Два профиля в `settings`: `typographyUi` и `typographyCode` (`family` + размер `s`/`m`/`l`). Нет ключа или битая запись — встроенные значения.
- `TypographyService` при старте и при выборе ставит `--font-ui-*` и `--font-code-*` на корень. Корень берёт размер UI, поэтому `rem` (заголовки) масштабируется вместе с ним. Размер кода — абсолютные px и не следует за UI. Потолок — L.
- Секция «Шрифты» на странице настроек: системный / с засечками и системный моно / Consolas. «По умолчанию» удаляет только ключи типографики.
- Переменные подключены к body, CodeMirror, markdown `code`/`pre`, схеме на Инфо, SQL diff и моноширинному service textarea. Смена `style` на корне просит CodeMirror перемериться.

## Изменённые файлы

- `vibetest-app/src/app/settings/typography.model.ts`, `parse-typography.ts`, `apply-typography-to-document.ts`, `typography.service.ts` (+ spec)
- `vibetest-app/src/app/settings/ui/typography-picker/*`
- `vibetest-app/src/app/settings/pages/settings-page/*`
- `vibetest-app/src/app/storage/settings-repository.ts`, `settings-row-parse.ts`, `settings-typography-key.ts` (+ spec)
- `vibetest-app/src/app/app.config.ts`
- `vibetest-app/src/styles.scss`
- `vibetest-app/src/app/player/ui/code-editor/practice-codemirror-theme.ts`, `practice-codemirror-host.ts`
- `vibetest-app/src/app/player/ui/markdown-content/markdown-content.scss`
- `vibetest-app/src/app/player/ui/sql-result-diff/sql-result-diff.scss`
- `vibetest-app/src/app/info/pages/info-page/info-page.scss`
- `vibetest-app/src/app/shared/ui/service-textarea/service-textarea.scss`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: зелёный (125 files, 761 tests)
- В браузере: «С засечками» + «Крупный» переживают перезагрузку; «По умолчанию» снимает оба ключа типографики, возвращает системный стек кода и не снимает тему.

## Отклонения от TASK.md

- Размер кода в px, а не в rem, чтобы он не масштабировался вторым разом вместе с корнем.

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-10-15):

1. Стек «Системный моно» не системный и уже не тот, что был у редактора → `CODE_FONT_STACKS` в `typography.model.ts` и те же значения в `styles.scss` (`--font-code-family`). Сейчас это `ui-monospace, Cascadia Code, Source Code Pro, monospace`. Source Code Pro в ОС нет, шрифт из сети не грузится, имя мёртвое. Из прежней цепочки редактора выпал Consolas. Ожидание: только системные fallback (Consolas, Courier New, `monospace`), одни и те же в модели и в `:root`.

2. «По умолчанию» может оставить один из двух ключей → `clearTypography` в `settings-repository.ts` делает два отдельных `delete`. Между ними сбой оставляет, например, `typographyCode`, а в памяти уже defaults; после перезагрузки код снова не по умолчанию. Spec проверяет только `getTypographyUi` и тему. Ожидание: оба удаления в одной `transaction`; в тесте нет и UI, и code, тема на месте.

После правок:

1. Стек «Системный моно» — `ui-monospace, Consolas, "Courier New", monospace` и в `CODE_FONT_STACKS`, и в `:root`. Source Code Pro и Cascadia Code убраны.
2. `clearTypography` удаляет оба ключа в одной `transaction` на `settings`. Тесты репозитория и сервиса проверяют, что после сброса нет ни `typographyUi`, ни `typographyCode`, а тема остаётся.

Ревью (2026-10-15, раунд 2):

Замечаний нет.
