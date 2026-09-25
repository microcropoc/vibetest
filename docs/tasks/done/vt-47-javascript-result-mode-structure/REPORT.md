---
branch: feature/vt-47-javascript-result-mode-structure
---

# Отчёт vt-47 — JavaScript: resultMode + structure

## Что сделано

- Опциональные поля `resultMode` (`return` | `args` | `both`) и `structure` (`list` | `tree` | `raw`) в `javascriptContent` (schemaVersion 1, без `default` в JSON Schema — чтобы Zod не делал поля обязательными).
- SPEC: materialize args отдельно для user/ref; serialize перед equal; при `rejects: true` — только reasons.
- Pure codec `structure-codec.ts` (list/tree roundtrip, cycle/cap guards).
- Compare path в `run-javascript-case.ts`; проброс через Worker messages и `javascript-practice-runner`.
- Checklist-тесты resultMode + structure; полный `ng test` зелёный.
- Backlog vt-48…vt-51 и очередь в PLAN (JS practice v3).

## Изменённые файлы

- `docs/schemas/course.schema.json`, `docs/schemas/course-import.schema.json`
- `docs/SPECIFICATION.md`, `docs/PLAN.md`
- `docs/tasks/in-progress/vt-47-javascript-result-mode-structure/`
- `docs/tasks/backlog/vt-48-…` … `vt-51-…`
- `vibetest-app/public/schemas/*` (sync)
- `vibetest-app/src/app/courses/generated/*`
- `vibetest-app/src/app/execution/execution-messages.ts`, `javascript-practice.worker.ts`
- `vibetest-app/src/app/player/step-engine/javascript/structure-codec.ts` (+ spec)
- `vibetest-app/src/app/player/step-engine/javascript/run-javascript-case.ts` (+ spec)
- `vibetest-app/src/app/player/step-engine/javascript/javascript-practice-runner.ts` (+ spec)

## Тесты

- `ng test --watch=false`: зелёный (282)

## Отклонения от TASK.md

- В JSON Schema **нет** keyword `default` у `resultMode` / `structure.result`: `json-schema-to-zod` превращает `default` в обязательное поле в `z.infer`, ломая фикстуры. Поведение «отсутствие = return / raw» зафиксировано в description и в раннере (`?? 'return'`).

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-25):

1. **Domain `as T` вместо согласованных типов** → `run-javascript-case.ts` (`prepareCalls(...) as JavascriptCallStep[]`) → вернуть из `prepareCalls` тип `JavascriptCallStep[] | undefined` (или иначе убрать cast); по стилю проекта domain `as T` не использовать.
2. **Нет покрытия `structure` на `calls[].args`** → `run-javascript-case.spec.ts` / checklist TASK → SPEC и код materialize’ят `calls[].args` тем же `structure.args` по позиции, но теста нет; добавить хотя бы один кейс (list/tree в call args).
3. **`resultMode: "both"` только happy-path** → `run-javascript-case.spec.ts` → checklist требует совпадение return **и** args; сейчас есть только pass при одинаковом коде. Нужен fail, где return совпал, а мутация args — нет (и наоборот по желанию).
4. **Битая ссылка в PLAN** → `docs/PLAN.md` активная очередь, vt-47 → файл уже в `tasks/in-progress/…`, ссылка всё ещё на `tasks/backlog/vt-47-…`. Поправить путь (или убрать vt-47 из backlog-колонки до merge — как принято в проекте).
5. **Лёгкий стиль:** `serializeList` / `serializeTree` — `current as ListNode` / `root as TreeNode` после `typeof === 'object'` → читать `val` / `next` / `left` / `right` через проверку полей без domain-cast (или тонкий `parseListNode`-guard).

Исправлено (2026-09-25):

1. `prepareCalls` возвращает `JavascriptCallStep[] | undefined`; cast убран.
2. Тест `materializes list structure on calls[].args` (method `reverse` + list arg).
3. Тест `both mode fails when return matches but args do not`.
4. PLAN: ссылка vt-47 → `tasks/in-progress/…`.
5. `parseListNode` / `parseTreeNode` без domain `as ListNode`/`as TreeNode`.

Ревью (2026-09-25, раунд 2): Замечаний нет.
