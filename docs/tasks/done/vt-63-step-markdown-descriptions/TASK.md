# vt-63 — Markdown в описаниях всех шагов

## Контекст

Theory рендерит `content` через `marked` и `[innerHTML]`. Practice (`description`), quiz (`question`), SVG (`description`) выводят plain text — fenced code и переносы строк читаются плохо.

## Цель

Единый компонент Markdown (блочный и inline) для текстовых полей шагов; схемы и промпт генерации отражают семантику.

## Требования

- `MarkdownContentComponent`: `markdown`, `inline` (default false); стили как у theory (`::ng-deep` для injected HTML).
- Practice `description`, quiz `question`, SVG `description` — блочный Markdown.
- Quiz `options[]`, SVG `caption` — inline Markdown (inline code, без fenced blocks).
- Theory делегирует в `MarkdownContentComponent`.
- Обновить `description` в `course.schema.json` и `course-import.schema.json`; `npm run generate:zod`.
- Промпт и SPECIFICATION.md.

## План работ

- [x] `renderInlineMarkdownToHtml` + spec
- [x] `MarkdownContentComponent` + spec
- [x] Потребители + component specs
- [x] Схемы, generate:zod, prompt, spec
- [x] `ng test --watch=false`

## Критерии готовности

- [x] Тесты зелёные
- [x] JS practice description с fenced code отображается как в theory

## Вне рамок

- Санитизация markdown
- Подсветка синтаксиса в описаниях
