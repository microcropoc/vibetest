# vt-56 — JS schema semantics (DeepSeek follow-up, docs-only)

## Цель

Уточнить `$comment` и descriptions в `$defs.javascriptContent` (checker, timeoutMs, unordered); синхронизировать SPEC. Без oneOf, без раннера.

## DoD

- Парный diff `course-import.schema.json` + `course.schema.json` (`javascriptContent` only).
- `npm run generate:zod`, sync `public/schemas`, `ng test --watch=false` зелёный.
