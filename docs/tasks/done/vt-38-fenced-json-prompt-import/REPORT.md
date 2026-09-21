---
branch: feature/vt-38-fenced-json-prompt-import
---

# Отчёт vt-38 — Fenced `json` в промте и импорт

## Что сделано

- `unwrapJsonImportText`: чистый JSON или strict ` ```json … ``` `.
- `parseImportCourseText` вызывает unwrap перед `JSON.parse`.
- Промт требует ответ в ` ```json `-блоке; убрано противоречие vt-35.
- SPEC, подсказка на импорте.

## Тесты

- `npm test -- --watch=false`: 66 files, 185 tests — зелёный

## Отклонения от TASK.md

- Нет.
