# vt-80 — Починить SQLite-двиок и таймауты на мобильных

**Приоритет:** P0  
**Зависимости:** нет  
**Блокирует:** vt-81, vt-82, vt-83, vt-85

## Контекст

SQL-практика (`sqlite` шаг) на телефоне «падает по таймауту». Расследование показало, что проблема не в медленном устройстве, а в том, что воркер грузит `public/sql-wasm.js` через динамический `import()` и ожидает ES-модуль с `default`, тогда как файл — UMD без ESM-экспорта. Инициализация падает, воркер отвечает с `id: 'unknown'`, обёртка игнорирует ответ, шаг ждёт до `timeoutMs`. Юнит-тесты проходят, потому что in-process helper грузит sql.js через CommonJS в Node.

Дополнительно: при каждом Run создаётся новый воркер (wasm компилируется заново), загрузка движка входит в бюджет `timeoutMs`, `/sql-wasm.wasm` в lazy-группе SW, `runPractice` не ловит ошибки — ученик не видит сообщения.

## Цель

SQL-практика стабильно работает в браузере (в т.ч. на мобильном) и offline после первой установки PWA: инициализация sql.js успешна, ошибки видны пользователю, повторные прогоны быстрее за счёт «тёплого» воркера.

## Требования

- Загрузка sql.js в воркере через `import initSqlJs from 'sql.js'` (бандлер включает движок в chunk воркера); wasm — из `public/` через `locateFile`; убрать динамический `import()` `public/sql-wasm.js`.
- Общая логика прогона (setup, reset, seed, запрос, сравнение) вынесена в чистый модуль `execution/sqlite-practice-core.ts`; воркер и in-process helper для тестов используют один код.
- Любая ошибка воркера возвращается с корректным `id` запроса (best-effort из сырого сообщения при падении до parse). То же для JS-воркера в аналогичном catch.
- Отдельный лимит на загрузку движка (~30 с), не входящий в `timeoutMs` шага; `timeoutMs` — только на выполнение SQL.
- «Тёплый» воркер: не терминировать после каждого Run; terminate при таймауте. По желанию — предзагрузка при открытии sqlite-шага.
- В `PlayerOrchestratorService.runPractice` — catch и показ «Ошибка выполнения: …» (таймаут, ошибка воркера, init).
- В `ngsw-config.json` — prefetch для `/sql-wasm.wasm` (offline до первого использования).
- Тесты: helper грузит sql.js так же, как прод; спеки на error id, init error, timeout (runner/wrapper).

## Технические заметки

- Домены: `execution/` (worker, core, wrapper), `player/` (orchestrator), `courses/` (in-process helper).
- Файлы: `sqlite-practice.worker.ts`, `sqlite-practice-runner.ts`, `sqlite-practice-worker.bootstrap.ts`, `execution-worker-wrapper.service.ts`, `javascript-practice.worker.ts` (error id), `practice-reference-in-process-runners.spec-helper.ts`, `ngsw-config.json`.
- Ручная проверка: production build, GitHub Pages, телефон.

## План работ

- [ ] `import initSqlJs from 'sql.js'` в воркере + `locateFile` для wasm
- [ ] `sqlite-practice-core.ts` и рефакторинг воркера + helper
- [ ] Исправить catch в sqlite/JS workers (id в error response)
- [ ] Разделить таймаут загрузки и `timeoutMs` в runner/wrapper
- [ ] Переиспользование воркера между Run; опционально preload на шаге
- [ ] Catch в `runPractice` + feedback пользователю
- [ ] SW prefetch wasm
- [ ] Тесты и зелёный `ng test --watch=false`

## Критерии готовности (Definition of Done)

- [ ] SQL-шаг из fixture или bundled курса (после vt-81) проходит в браузере на десктопе и телефоне
- [ ] При сломанном setup/init пользователь видит текст ошибки, а не молчаливый таймаут
- [ ] Тесты на доменную логику и runner зелёные (`ng test`)
- [ ] In-process self-check использует тот же core, что воркер

## Вне рамок задачи

- Расширение схемы sqlite (checkColumnNames, checkQuery и т.д.) — vt-81
- Новые курсы — vt-82–85
- UI diff таблиц результатов — vt-81
