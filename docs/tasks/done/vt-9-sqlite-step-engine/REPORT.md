---
branch: feature/vt-9-sqlite-step-engine
---

# Отчёт vt-9 — Движок шага sqlite

## Что сделано

- Зависимость `sql.js`; WASM в `public/sql-wasm.wasm`, `locateFile` в Worker по URL из `sqliteInit.wasmUrl`.
- Протокол: `sqliteInit`, `sqliteRunCase`, `sqliteInited`, `sqliteCaseResult`.
- Worker: две in-memory БД, `setup` при init; на кейс — `reset` (no-op если пусто), `seed`, запрос user vs reference, сравнение строк строк.
- `sqlite-practice-runner.ts` через `ExecutionWorkerWrapperService`, fail-fast, бюджет `timeoutMs`.
- `sqlite-step-engine.ts`: `setDraftCode`, `retry`, `applySqlitePracticeResult()`.
- Тесты: `compareSqliteResultRows` (order true/false), runner mock, step engine.

## Изменённые файлы

- `vibetest-app/package.json`, `package-lock.json` (`sql.js`, `@types/sql.js`)
- `vibetest-app/src/app/execution/javascript-practice.worker.ts`, `execution-stub.worker.ts` (типы Worker для `ng build`)
- `vibetest-app/public/sql-wasm.wasm` (новый)
- `vibetest-app/src/app/execution/execution-messages.ts`
- `vibetest-app/src/app/execution/sqlite-practice.worker.ts` (новый)
- `vibetest-app/src/app/execution/sqlite-result-rows.ts` (новый)
- `vibetest-app/src/app/player/step-engine/sqlite/*` (новый)
- `vibetest-app/src/app/player/step-engine/index.ts`

## Тесты

- `npx ng test --watch=false`: 57 passed.
- `npx ng build --configuration=development`: успешно (WASM в output из `public/`).

## Отклонения от TASK.md

- Нет.

## Сравнение строк результата (`orderMatters`)

- Каждая строка SELECT — `JSON.stringify` массива значений ячеек в порядке колонок sql.js.
- `orderMatters: true` — посимвольное равенство массивов строк (порядок важен).
- `orderMatters: false` — multiset: отсортированные копии массивов строк сравниваются поэлементно.

## WASM asset

- Файл: `vibetest-app/public/sql-wasm.wasm` (копия из `node_modules/sql.js/dist/`).
- Раздача: glob `public/**` в `angular.json`; URL — `sqliteWasmAssetUrl()` (`new URL('sql-wasm.wasm', document.baseURI)`).

## Открытые вопросы к ревью

- Интеграционный прогон с реальным Worker + WASM в Vitest — отложен (mock runner); smoke через `ng build`.

## Изменения по ревью

_(после замечаний пользователя)_
