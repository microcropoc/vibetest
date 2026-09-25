# vt-52 — Проверка practice-шагов при импорте

## Контекст

Импорт сейчас: JSON → Zod → semantic, без runtime. Авторам нужна опциональная проверка, что `referenceSolution` проходит dual-run сам с собой.

## Цель

Опциональный флажок на форме импорта (default **выкл**): для каждого шага `javascript` / `sqlite` / `regex` прогнать существующие practice runners с `referenceSolution` на обеих сторонах; при fail — этап `practice`, курс не сохраняется.

## Требования

- `validatePracticeReferences(course, deps)` — все ошибки шагов, не fail-fast между шагами.
- `CourseImportService`: после parse, до save, если `validatePracticeSteps`.
- UI: галочка «Проверка js/sql/regex шагов», default off.
- SPEC/PLAN; JSON-фикстуры self-check в `vibetest-app/src/app/courses/__fixtures__/practice-check/{pass,fail}/`; тесты.

## DoD

- Checklist + `ng test --watch=false` зелёный; REPORT.
