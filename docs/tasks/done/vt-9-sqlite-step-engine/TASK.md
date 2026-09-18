# vt-9 — Движок шага `sqlite` (без UI)

## Контекст

Практика SQLite через sql.js в Worker (**vt-7**): `setup`, `reset`, `seed`, сравнение результата запроса; **`orderMatters: boolean`** в content.

## Цель

SQL Worker runner + оркестрация; движок на **vt-3**; сравнение строк с учётом `orderMatters` (true — порядок важен; false — multiset/normalized — зафиксировать в `REPORT.md`).

## Требования

- `$defs/sqliteContent` включая обязательные `orderMatters` и **`timeoutMs`**.
- Порядок: load/setup в средах → на кейс **reset** (no-op, если поле отсутствует или пустое) → seed → execute starter vs reference; **стоп на первом** fail/error/timeout.
- Таймаут и SQL-ошибки → fail; retry через vt-3.
- Только **vt-7** wrapper для Worker.
- Тесты: один/два seed, wrong query, `orderMatters` true/false.

## Технические заметки

- Зависимости: **vt-7**, **vt-3**, **vt-2**.
- **sql.js:** добавить зависимость; `.wasm` как Angular asset (`angular.json` / `public/` — зафиксировать в `REPORT.md`); в Worker — `locateFile` для загрузки WASM; smoke, что asset доступен при `ng build` / dev. Кэш SW — **vt-27**.

## План работ

- [x] sql.js + WASM asset + `locateFile` in Worker
- [x] SQL Worker + messages
- [x] Sqlite step engine + factory
- [x] Tests
- [x] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [x] `orderMatters` поведение покрыто тестами

## Вне рамок задачи

- SQL UI, javascript, regex
