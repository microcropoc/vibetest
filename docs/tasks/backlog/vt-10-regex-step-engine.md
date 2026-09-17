# vt-10 — Движок шага `regex` (без UI)

## Контекст

Практика regex через Worker (**vt-7**): паттерны в starter/reference, `RegExp.test(input)` на кейс; **без** `setup`/`reset` (только `timeoutMs` + `tests`).

## Цель

Regex Worker runner + оркестрация; boolean compare user vs reference per input; invalid RegExp → ошибка; движок **vt-3**; тесты.

## Требования

- `$defs/regexContent` с обязательным **`timeoutMs`**.
- Кейсы по порядку; для каждого `input` — `RegExp.test(input)` у user и reference; **успех, если оба boolean совпадают**; **стоп на первом** fail/error/timeout.
- Таймаут **`timeoutMs`** через vt-7; retry через vt-3.
- Тесты: match/mismatch, invalid pattern, early stop после первого fail.

## Технические заметки

- Зависимости: **vt-7**, **vt-3**, **vt-2**.

## План работ

- [ ] Regex worker + messages
- [ ] Regex step engine + factory
- [ ] Unit tests + mock Worker
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Соответствие спецификации regex-практики

## Вне рамок задачи

- UI поля regex, javascript, sqlite
