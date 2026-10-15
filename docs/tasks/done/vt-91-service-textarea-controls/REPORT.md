---
branch: feature/vt-91-service-textarea-controls
---

# Отчёт vt-91 — Сервисные textarea и единый стиль кнопок

## Что сделано

- `readTextFromClipboard` + unit-тесты; paste-сообщения вынесены в константы рядом с helper.
- Standalone `app-service-textarea`: copy / paste / clear / опциональный apply, `ng-content` для доп. контролов, clipboard status с `role="status"`, spec компонента.
- Глобальные `.app-button` (`--primary`, `--secondary`, `--danger`, `--stack-full`, `:focus-visible`) в `src/styles/_buttons.scss`.
- Миграция 6 textarea: import (×2), prompt-generation (×2), manual-stage-panel (×1), course-generation (×1); кнопки на этих экранах на `.app-button`.
- Копирование **промтов** на генерации промта остаётся отдельными page-level кнопками (не содержимое поля).
- SPEC: импорт, адаптивность, генерация промта/курса.

## Scope / follow-up

- Не мигрированы: `player-nav`, `settings-page`, `confirm-dialog`, `info-page` copy, `course-list-card` — отдельная задача при необходимости.

## Изменённые файлы

- `vibetest-app/src/app/shared/clipboard/read-text-from-clipboard.ts` (+ spec)
- `vibetest-app/src/app/shared/ui/service-textarea/*`
- `vibetest-app/src/styles/_buttons.scss`, `src/styles.scss`
- `vibetest-app/src/app/import/pages/import-page/*`
- `vibetest-app/src/app/prompt-generation/**` (page, manual-stage-panel)
- `vibetest-app/src/app/course-generation/pages/course-generation-page/*`
- `docs/SPECIFICATION.md`
- `docs/tasks/in-progress/vt-91-service-textarea-controls/`

## Тесты

- `ng test --watch=false`: **736** зелёных (после правок по ревью)

## Отклонения от TASK.md

- Вместо отдельного `app-button` — глобальный SCSS partial (соответствует TASK «или SCSS partial»).

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-10-15), ветка `feature/vt-91-service-textarea-controls`.

- **Текст ошибки вставки про JSON на всех полях** — исправлено: дефолт `CLIPBOARD_READ_FAILED_MESSAGE` нейтральный («вставьте текст вручную»); для импорта — `CLIPBOARD_READ_FAILED_JSON_MESSAGE` через input `pasteFailedMessage` на обоих полях.
- **Ошибка вставки без error-стиля** — исправлено: paste unavailable/failed помечаются `clipboardMessageIsError` и классом `service-textarea__status--error`.
- **Файлы вне vt-91 в дереве** — при коммите stage только пути vt-91 (без `.cursor*`, backlog vt-92–94).

Ревью (2026-10-15, раунд 2). Проверено: дефолт ошибки вставки — «вставьте текст вручную», JSON-формулировка только на полях импорта (`pasteFailedMessage`), paste unavailable/failed с `service-textarea__status--error`. Граница коммита зафиксирована. Коммитов относительно `main` нет.

Замечаний нет.
