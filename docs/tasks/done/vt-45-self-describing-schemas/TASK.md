# vt-45 — Самоописывающая JSON Schema для импорта

## Контекст

Import/canonical JSON Schema — только constraints; LLM в «Генерация промта» получает схему без семантики полей и додумывает practice/quiz.

## Цель

Русские `description` на корне, `$defs` и полях в [`course-import.schema.json`](../../../docs/schemas/course-import.schema.json) и зеркально content + ID в [`course.schema.json`](../../../docs/schemas/course.schema.json). Валидацию не менять.

## Критерии готовности

- [x] Описания видны в Info/Prompt (bundled schema)
- [x] `npm run generate:zod`; `ng test --watch=false` зелёный
- [x] SPEC обновлён
