---
branch: feature/vt-28-fix-practice-worker-bundling
---

# Отчёт vt-28 — Исправить сборку practice Workers

## Что сделано

- Причина `ExecutionProtocolError: Worker error`: Angular не выделял worker-чанки, т.к. `new Worker(url)` вызывался через `createModuleWorker(scriptUrl)` с URL из другого модуля.
- `WorkerFactory` — `() => Worker`; статический шаблон `new Worker(new URL('…worker.ts', import.meta.url), { type: 'module' })` в colocated helpers:
  - `createJavascriptPracticeWorker` / `createRegexPracticeWorker` — в соответствующих `*-practice-runner.ts`
  - `createSqlitePracticeWorker` — в `sqlite-practice-worker.bootstrap.ts`, подключается через `import()` в `runPractice` (sqlite), чтобы sql.js не попадал в общий граф player-чанка
- SQLite worker: загрузка sql.js runtime из `public/sql-wasm.js` (рядом с `sql-wasm.wasm`) через dynamic `import(/* @vite-ignore */ url)`, без статического `import 'sql.js'` — иначе `ng build` падает на `fs`/`path`/`crypto`
- Добавлен `public/sql-wasm.js`; типы sql.js в worker — `sqlite-worker-types.ts`

## Изменённые файлы

- `docs/tasks/in-progress/vt-28-fix-practice-worker-bundling/` — TASK, REPORT
- `vibetest-app/public/sql-wasm.js` (новый)
- `vibetest-app/src/app/execution/worker-factory.ts`, `index.ts`
- `vibetest-app/src/app/execution/sqlite-practice.worker.ts`, `sqlite-worker-types.ts` (новый)
- `vibetest-app/src/app/player/player-orchestrator.service.ts`
- `vibetest-app/src/app/player/step-engine/javascript/*`, `regex/*`, `sqlite/*` (runners, index, bootstrap)

## Тесты

- `npm test -- --watch=false`: 58 files, 158 tests — зелёный
- `npm run build` и `npm run build -- --configuration=development`: зелёный; в output — `javascript-practice-worker`, `regex-practice-worker`, `sqlite-practice-worker`
- Smoke `npm start`: порт 4200 уже занят (dev-сервер пользователя); ручная проверка практики на импортированном курсе

## Отклонения от TASK.md

- Три фабрики не сведены в один `worker-factory.ts`: для Angular bundling URL и `new Worker` должны жить рядом с точкой подключения; SQLite дополнительно вынесен в lazy bootstrap + runtime asset для sql.js.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
