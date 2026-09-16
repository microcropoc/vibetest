# vt-9 — Движок шага `sqlite` (без UI)

## Контекст

Практика SQLite через sql.js в Worker (**vt-7**): `setup`, `reset`, `seed`, сравнение результата запроса; **`orderMatters: boolean`** в content.

## Цель

SQL Worker runner + оркестрация; движок на **vt-3**; сравнение строк с учётом `orderMatters` (true — порядок важен; false — multiset/normalized — зафиксировать в `REPORT.md`).

## Требования

- `$defs/sqliteContent` включая обязательный `orderMatters`.
- Порядок: load/setup в средах → на кейс reset → seed → execute starter vs reference.
- Таймаут и SQL-ошибки → fail; retry через vt-3.
- Только **vt-7** wrapper для Worker.
- Тесты: один/два seed, wrong query, `orderMatters` true/false.

## Технические заметки

- Зависимости: **vt-7**, **vt-3**, **vt-2**.

## План работ

- [ ] SQL Worker + messages
- [ ] Sqlite step engine + factory
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] `orderMatters` поведение покрыто тестами

## Вне рамок задачи

- SQL UI, javascript, regex
