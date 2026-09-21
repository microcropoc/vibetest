---
branch: feature/vt-36-prompt-theory-code-markdown
---

# Отчёт vt-36 — Промт: код в theory как Markdown

## Что сделано

- Блок «Шаги theory» в промте: fenced code с языком, структура, inline code; разграничение обёртки ответа vs content.
- Уточнён запрет markdown fences только вокруг всего JSON-ответа.
- SPEC, тесты.

## Тесты

- `npm test -- --watch=false`: 64 files, 175 tests — зелёный

## Отклонения от TASK.md

- Нет.
