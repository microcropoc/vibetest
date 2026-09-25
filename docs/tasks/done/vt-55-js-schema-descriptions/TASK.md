# vt-55 — JS import schema: descriptions + identifier validation

## Цель

Уточнить `course-import.schema.json` (semantics, checker, timeout); валидировать идентификаторы на импорте; задокументировать oneOf target (Zod vs JSON Schema).

## DoD

- `generate:zod`, sync public schemas, `ng test --watch=false` зелёный.
