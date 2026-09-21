# vt-31 — Import-DTO и канонический Course DTO

## Контекст

Разделение author import JSON и canonical `Course` в IndexedDB. Импорт принимает только import-DTO (без UUID и `createdAt`).

## Цель

Две JSON Schema в `docs/schemas/`, маппинг при импорте, `createdAt` в canonical DTO.

## Критерии готовности

- [x] `course.schema.json` + `course-import.schema.json`, bundle, domain, SPEC, samples
- [x] `ng test --watch=false` зелёный
