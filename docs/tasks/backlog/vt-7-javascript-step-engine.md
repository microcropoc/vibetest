# vt-7 — Движок шага `javascript` (без UI)

## Контекст

Практика JS: Worker, `setup`/`reset`, тесты с `args`, сравнение возврата `functionName(...args)` с эталоном. Спецификация — порядок выполнения и изоляция.

## Цель

Домен + `execution/`: протокол сообщений Worker, оркестрация прогона тестов, таймаут, сравнение результатов; движок шага на контракте vt-3 (submit/run, success/fail, retry). Тесты логики оркестрации и парсинга ответов Worker (mock Worker допустим).

## Требования

- Соответствие `$defs/javascriptContent` и порядку из спецификации (setup once → reset → run starter vs reference per test case).
- `functionName` обязателен; сравнение deep equality возвратов (уточнить для примитивов/объектов в тестах).
- Таймаут Worker → ошибка шага, без зависания.
- Компоненты **не** вызывают `postMessage` напрямую — только через wrapper-сервис `execution/` (реализация сервиса может быть минимальной, но граница соблюдена).
- Тесты: успех всех кейсов, падение одного кейса, timeout, неверный код пользователя.

## Технические заметки

- Зависимости: **vt-3**, **vt-2**; Worker file в `execution/`.
- sql.js не нужен.
- Доверенный код курса (спецификация).

## План работ

- [ ] Типы message in/out + parse на границе
- [ ] Worker runner (минимальный sandbox по MVP)
- [ ] JavaScript step engine + интеграция registry
- [ ] Unit/integration tests с mock Worker
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Порядок setup/reset/tests соблюдён
- [ ] Нет UI редактора кода

## Вне рамок задачи

- Monaco/CodeMirror, подсветка синтаксиса
- SQLite, regex
- Недоверенная песочница (вне MVP)
