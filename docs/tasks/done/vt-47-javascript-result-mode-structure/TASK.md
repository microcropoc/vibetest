# vt-47 — JavaScript: `resultMode` + `structure` (in-place, list, tree)

## Контекст

Алгоритмические курсы (LeetCode-подобные) упираются в контракт dual-run из vt-42…vt-44: сравнивается **только** JSON-совместимый return. Из-за этого:

- **in-place void** (`rotate(nums, k)` → `undefined`) → fail (`non-JSON result`);
- **ListNode / TreeNode** в args/return — JSON даёт массивы, а instance с прототипом не plain object → fail.

`setup`-хелперы не спасают return: ученик обязан вернуть структуру как в условии задачи. Поле `checkScript` / `checker` в эту задачу **не** вводим (см. vt-50); oracle остаётся dual-env.

## Цель

Два опциональных поля в `javascriptContent`, не ломающих `schemaVersion: 1` и курсы без них:

1. **`resultMode`**: `"return"` (default) | `"args"` | `"both"` — что сравнивать после кейса.
2. **`structure`**: декларация `list` / `tree` / `raw` для позиционных args и для result — раннер материализует JSON → узлы до вызова и сериализует обратно перед equal.

## Требования

### Схема и спека

- [`course.schema.json`](../../schemas/course.schema.json) и [`course-import.schema.json`](../../schemas/course-import.schema.json), `$defs/javascriptContent`:
  - **`resultMode`**: enum `return` | `args` | `both`; default `return` (отсутствие поля = `return`).
  - **`structure`**: object, `additionalProperties: false`:
    - `args`: array of `"list" | "tree" | "raw"` (по индексу; отсутствующий индекс = `raw`);
    - `result`: `"list" | "tree" | "raw"`, default `raw`.
- [`SPECIFICATION.md`](../../SPECIFICATION.md): семантика, порядок (materialize → invoke/calls/await → serialize → compare по `resultMode`), лимиты сериализации (cycle / max nodes), клон args на среду.
- `npm run generate:zod`; sync `public/schemas/`.
- Обновить PLAN: исключение из «только return equal» для явного `resultMode` / `structure`.

### Семантика `resultMode`

| Значение | Сравнение |
|----------|-----------|
| `return` | как сейчас: финальный return (после serialize `structure.result`) |
| `args` | мутированные args user vs ref (после serialize по `structure.args`); return **не** обязан быть JSON (в т.ч. `undefined` ок) |
| `both` | и return, и args должны совпасть |

При `args` / `both`: сравнивать **весь** массив args (включая немутируемые позиции) — как DeepSeek; документировать.

### Семантика `structure`

- **list**: JSON `number[]` ↔ `{ val, next }` (или согласованный `ListNode` в среде); serialize с cycle-detect и `maxLen`.
- **tree**: level-order `(number|null)[]` ↔ `{ val, left, right }`; serialize с cap nodes, trim trailing nulls.
- **raw**: `structuredClone` как сейчас.
- Материализация **до** первого вызова и для args в `calls` (те же правила по индексу, либо только первичные args — зафиксировать в SPEC одним правилом; предпочтение: только `tests[].args` и `calls[].args` с тем же `structure.args` по позиции).
- Сравнение всегда на сериализованной JSON-форме через существующий `jsonCompatibleEqual`.
- Args клонируются **отдельно** для user и reference **до** materialize.

### Протокол Worker / runner

- Пробросить `resultMode` / `structure` в init или в каждый `javascriptRunCase` (предпочтение: в case message, если поля step-level — передавать с каждым кейсом из runner).
- Не ломать `rejects`, `expectInvocations`, `advanceMs`, `flushMicrotasks`.

### Граничные тесты (checklist)

**resultMode:**

- [x] без поля — регрессия `add` / vt-44
- [x] `return` + void user → fail `non-JSON` (как сейчас)
- [x] `args`: rotate in-place, return `undefined` у обеих → pass при совпадении `nums`
- [x] `args`: user не мутирует → fail
- [x] `both`: return + мутация args должны совпасть
- [x] `args` + `rejects: true` — зафиксировать поведение в SPEC (либо запрет комбинации semantic validation)

**structure:**

- [x] `args: ["list"]`, `result: "list"`: reverseList `[[1,2,3]]` → pass
- [x] пустой список `[[]]` / `null`-эквивалент — по правилу SPEC
- [x] cycle в return list → fail (не зависание)
- [x] `tree`: invertTree level-order roundtrip
- [x] `raw` default — регрессия массивов/объектов
- [x] user/ref получают **разные** объекты list (мутация одного не влияет на другой)

## Технические заметки

- Зависимости: **vt-44** (полный JS runner), **vt-2**.
- Домены: `player/step-engine/javascript/`, `execution/`, схемы в `docs/schemas/` + `public/schemas/`.
- Pure helpers serialize/materialize — unit без TestBed; case runner — как vt-42+.
- UI плеера не менять.

## План работ

- [x] SPEC + JSON Schema + `generate:zod` + public sync
- [x] list/tree materialize + serialize (+ cycle guards) + unit specs
- [x] `resultMode` в compare path (`run-javascript-case`)
- [x] Worker messages + runner wiring
- [x] Checklist integration specs
- [x] `ng test --watch=false` зелёный; REPORT при merge

## Критерии готовности (Definition of Done)

- [ ] Checklist зелёный; курсы без новых полей без регрессий
- [ ] Семантика согласована со SPEC
- [ ] `schemaVersion` остаётся `1`; поля опциональны

## Вне рамок задачи

- `construct` / `new` (vt-48)
- `unordered` (vt-49)
- `checker` (vt-50)
- Демо-курс алгоритмов (vt-51)
- Проверка O(n) / кастомные типы NestedInteger
