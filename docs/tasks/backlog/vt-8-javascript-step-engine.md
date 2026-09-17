# vt-8 — Движок шага `javascript` (без UI)

## Контекст

Практика JS: Worker (через **vt-7**), `setup`/`reset`, тесты с **`argsGenerator`**. Спецификация: две среды user/reference + **отдельная изолированная** evaluate-среда на каждый кейс; `setup` без проверочных данных; на кейс — evaluate self-contained `argsGenerator` → reset user/ref → `functionName(...args)`.

## Цель

Worker runner для JS + оркестрация прогона; движок шага на контракте **vt-3** (run/submit, success/fail, retry). Тесты оркестрации и parse ответов (mock Worker / vt-7 adapter).

## Требования

- `$defs/javascriptContent` включая обязательный **`timeoutMs`** и **`argsGenerator`** (полная функция `() => …` на кейс); порядок: `setup` + load starter/reference в user/ref → на кейс: evaluate `argsGenerator` в изолированной среде → validate JSON args array → `reset` user/ref → вызов и сравнение; **стоп на первом** fail/error/timeout.
- Результат — **только JSON-совместимые** значения; структурное сравнение (зафиксировать правила для `undefined`/`NaN` в `REPORT.md` — по умолчанию только JSON types).
- `functionName` обязателен.
- Таймаут: **`timeoutMs`** через **vt-7** wrapper.
- Тесты: все кейсы OK, fail-fast, timeout, неверный код, invalid generator / non-array result, self-contained generators per test.

## Технические заметки

- Зависимости: **vt-7**, **vt-3**, **vt-2**.

## План работ

- [ ] JS Worker runner + messages (extends vt-7 protocol)
- [ ] JavaScript step engine + factory по vt-3
- [ ] Tests with mock Worker
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Семантика выполнения совпадает со [SPECIFICATION.md](../../SPECIFICATION.md)

## Вне рамок задачи

- Редактор кода UI, SQLite, regex
