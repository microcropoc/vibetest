# vt-10 — Движок шага `regex` (без UI)

## Контекст

Практика regex через Worker (**vt-7**): паттерны в starter/reference, `RegExp.test(input)` на кейс; `setup` — `""` по схеме.

## Цель

Regex Worker runner + оркестрация; boolean compare user vs reference per input; invalid RegExp → ошибка; движок **vt-3**; тесты.

## Требования

- `$defs/regexContent`.
- Каждый кейс: одинаковый boolean test у user и reference → OK.
- Таймаут через vt-7; retry через vt-3.
- Тесты: match/mismatch, invalid pattern, multiple inputs.

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
