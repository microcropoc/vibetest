# vt-9 — Движок шага `regex` (без UI)

## Контекст

Практика regex: `starterCode` и `referenceSolution` как паттерны, `RegExp.test(input)` на каждый кейс; `setup` — пустая строка по схеме.

## Цель

Worker + оркестрация сравнения boolean результатов test для user vs reference regex; обработка невалидного RegExp; движок на vt-3; тесты.

## Требования

- Соответствие `$defs/regexContent`.
- Для каждого `tests[i].input`: одинаковый результат test у пользователя и эталона → кейс OK.
- Невалидное выражение → ошибка шага (не silent pass).
- `setup`/`reset` — как в спецификации (часто `""`).
- Таймаут Worker; retry через vt-3.
- Тесты: match/mismatch, invalid pattern, multiple inputs.

## Технические заметки

- Зависимости: **vt-3**, **vt-2**; переиспользование execution-паттерна vt-7/vt-8.
- Worker может быть легче JS/SQL (только RegExp).

## План работ

- [ ] Regex worker + messages
- [ ] Regex step engine + registry
- [ ] Unit tests + mock Worker
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Поведение совпадает со спецификацией regex-практики

## Вне рамок задачи

- UI поля ввода regex
- javascript/sqlite (другие задачи)
