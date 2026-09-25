# vt-48 — JavaScript: `construct` (задачи-классы)

## Контекст

Задачи «спроектируй структуру» (LRUCache, MinStack, …) сейчас обходятся factory:

```javascript
class LRUCache { /* … */ }
function createLRU(...args) { return new LRUCache(...args); }
```

`functionName: "createLRU"` + `calls[].method`. Это работает, но не совпадает с привычным API курсов/LeetCode и засоряет starter.

## Цель

Опциональное **`construct: { className }`**: вместо вызова функции — `new className(...tests[].args)`, далее `calls` как сейчас. Dual-env без изменений.

## Требования

### Схема и спека

- В `$defs/javascriptContent`:
  - **`construct`**: object, `required: ["className"]`, `className` string 1…100, `additionalProperties: false`.
  - **`functionName`** убрать из корневого `required`; добавить `allOf` / `anyOf`: ровно одно из `functionName` | `construct` (оба сразу — ошибка схемы или semantic).
- SPEC: init/load без изменений; на кейс при `construct` — `new` в обеих средах; класс должен существовать после load starter/reference.
- `generate:zod` + public schemas; при необходимости semantic validation (взаимоисключение).

### Семантика

1. Если задан `construct` — первичный шаг: `current = new env[className](...args)` (не вызов функции).
2. `calls` / await / rejects / spies / timers / `resultMode` / `structure` (vt-47) — без изменений относительно `current`.
3. Ошибка: класс не функция/не конструктор → fail с понятным message.

### Граничные тесты (checklist)

- [x] LRU-подобный: `construct.className`, `args: [2]`, `calls` put/get → pass
- [x] user ломает get → fail
- [x] только `functionName` — регрессия vt-47/44
- [x] оба `functionName` + `construct` — reject на импорте (schema или semantic)
- [x] ни одного — reject
- [x] отсутствующий className в среде → fail message
- [x] `construct` + `resultMode: "args"` (если vt-47 merge) — один кейс или явный skip до merge

## Технические заметки

- Зависимости: **vt-47** (желательно после; можно параллелить схему, но compare path — после merge vt-47).
- UI не менять.

## План работ

- [x] SPEC + schema anyOf + zod + semantic
- [x] Worker/compile path: `new` vs function invoke
- [x] Checklist specs
- [x] `ng test --watch=false`; REPORT при merge

## Критерии готовности (Definition of Done)

- [ ] Checklist зелёный
- [ ] Старые курсы с обязательным `functionName` валидны

## Вне рамок задачи

- `unordered`, `checker`
- UI шаблонов автора
- Проверка сложности
