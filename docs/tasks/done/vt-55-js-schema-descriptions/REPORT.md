---
branch: feature/vt-55-js-schema-descriptions
---

# Отчёт vt-55

## Что сделано

- Уточнены descriptions в `$defs.javascriptContent` (import + course schema): resultMode args scope, checker guarantees, timeoutMs, rejects, expectInvocations, unordered, structure.
- `$comment` про oneOf/target и Zod superRefine; `pattern` на functionName, className, method.
- `JavascriptContentWithTargetSchema`: `assertPracticeIdentifier` для functionName/className; `assertPracticeIdentifierSyntax` для calls[].method.
- SPEC: timeoutMs (один deadline на шаг), resultMode args = tests[i].args only.
- `course-import-schema.spec.ts`: Zod reject без target; AJV pattern на $def.
- oneOf/allOf в javascriptContent **не** добавлены — ломает json-schema-to-zod (`Passed 2`).

## Тесты

- `ng test --watch=false`: 83 files, 349 tests — зелёный

## Отклонения от TASK.md

- Нет

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-25): WIP на `feature/vt-55-js-schema-descriptions`.

1. **`calls[].method` слишком жёсткий** — исправлено: `assertPracticeIdentifierSyntax` для method; reserved (`delete`) допустим; тест добавлен.
2. **Комментарий про JSON Schema oneOf** — исправлено: XOR только в Zod superRefine.
3. **Mass reformat `course.schema.json`** — исправлено: diff +15/−11 только в `javascriptContent`.

Ревью (2026-09-25, раунд 2): повторная проверка WIP (`main..HEAD` пусто). Пункты 1–3 закрыты. Новых замечаний нет.
