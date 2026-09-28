# vt-64 — Теги особых значений в args JS-шага

## Контекст

LLM пишут `undefined` в JSON args → невалидный JSON. Нужны объектные теги `{"$js": ...}`.

## Цель

Decode при вызове, validate при импорте, encode при сравнении. Верхнеуровневый `undefined` в return — fail.

## План работ

- [x] `javascript-special-values.ts` + spec
- [x] `prepareArgs` decode; compare encode
- [x] Import superRefine
- [x] Схемы, prompt, SPEC, generate:zod
- [x] `ng test --watch=false`

## Критерии готовности

- [x] Тесты зелёные
- [x] `{"$js": "undefined"}` в args работает
