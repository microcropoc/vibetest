---
branch: feature/vt-51-algorithms-sample-course
---

# Отчёт vt-51 — Демо-курс: алгоритмы на JS-практике

## Что сделано

- Import-курс [`docs/courses/algorithms-start.json`](../../../courses/algorithms-start.json): 1 модуль — theory, quiz, 6 JS-практик без `checker`.
- Демо полей: Two Sum (`functionName`); Rotate (`resultMode: args`); Reverse Linked List / Invert Binary Tree (`structure` list/tree); LRU Cache (`construct` + `calls`); Three Sum (`unordered`).
- Копия того же JSON в [`vibetest-app/.../practice-check/pass/algorithms-start.json`](../../../../vibetest-app/src/app/courses/__fixtures__/practice-check/pass/algorithms-start.json) для discovery-тестов (приложение/`specs` не читают `docs/`).
- Строка в [`docs/courses/README.md`](../../../courses/README.md); задача в `done/`.

## Изменённые файлы

- `docs/courses/algorithms-start.json`, `docs/courses/README.md`
- `vibetest-app/src/app/courses/__fixtures__/practice-check/pass/algorithms-start.json`
- `docs/PLAN.md`
- `docs/tasks/done/vt-51-algorithms-sample-course/`
- `vibetest-app/src/app/courses/validate-practice-references.spec.ts` (sync-assert mirrored samples)

## Тесты

- `ng test --watch=false`: зелёный (**331**, +1 pass-фикстура `algorithms-start`, +1 sync-assert)

## Отклонения от TASK.md

- В `vibetest-app/` добавлена только копия фикстуры под practice-check (по согласованию: дублировать, не читать `docs/` из app).

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-25):

1. **LRU / `calls`: не сказано про `return this`** → `algorithms-start.json`, шаг «LRU Cache» (`description`) → после `put` следующий `method` вызывается на return предыдущего шага; без `return this` цепочка падает (`null`/`undefined`). В `starterCode`/`reference` уже есть `return this`, но в условии задачи этого нет — ученик легко «починит» заглушку и сломает контракт. Ожидание: одна фраза в description (и при желании в theory), что мутирующие методы для этой задачи должны возвращать экземпляр.
2. **Two Sum: порядок индексов** → шаг «Two Sum» → dual-run equal требует тот же порядок, что у эталона (`[i, j]` с `i < j`). Ответ `[j, i]` — валидный LeetCode, но fail. Для демо baseline либо явно «меньший индекс первым», либо один тест с `unordered` на пару индексов.
3. **Дубль JSON без защиты от drift** → `docs/courses/algorithms-start.json` и `__fixtures__/practice-check/pass/algorithms-start.json` (сейчас байт-в-байт) → ожидается assert в spec (hash/equal) или генерация одной копии из другой при тесте.

**Исправлено:**

1. В description LRU и в theory — явно: следующий `method` на return предыдущего; `put` должен `return this`.
2. Two Sum: в description — вернуть `[i, j]` с `i < j`.
3. В `validate-practice-references.spec.ts` — `MIRRORED_SAMPLE_COURSES` + `it.each` на байт-равенство docs ↔ fixture (только sync-guard в тесте; runtime app по-прежнему не читает `docs/`).

Ревью (2026-09-25, раунд 2): Замечаний нет.

