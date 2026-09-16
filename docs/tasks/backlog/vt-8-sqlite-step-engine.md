# vt-8 — Движок шага `sqlite` (без UI)

## Контекст

Практика SQLite через sql.js в Worker: `setup` (DDL), `reset`, `seed` на кейс, сравнение набора строк результата запроса; порядок строк — по заданию (по умолчанию можно сравнивать как multiset или normalized — зафиксировать в `REPORT.md`).

## Цель

Worker + оркестрация как vt-7, но для SQL: цикл тестов, сравнение результатов starter vs reference; движок шага на vt-3; тесты с mock Worker / fixture sql.js при необходимости.

## Требования

- Соответствие `$defs/sqliteContent` и порядку setup → reset → seed → execute из спецификации.
- Сравнение результатов запроса (строки/колонки); документировать правило порядка строк.
- Таймаут и ошибки SQL → fail шага, retry через контракт vt-3.
- Граница `execution/` — единственная точка Worker.
- Тесты без UI.

## Технические заметки

- Зависимости: **vt-3**, **vt-2**; sql.js WASM — подключение в Worker (кэш PWA позже).
- Может опираться на паттерны сообщений vt-7.

## План работ

- [ ] Worker SQL runner + message types
- [ ] Sqlite step engine + registry
- [ ] Тесты: один seed, два seed, wrong query
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Спецификация практики sqlite соблюдена

## Вне рамок задачи

- UI SQL-редактора
- javascript, regex engines (отдельные задачи)
