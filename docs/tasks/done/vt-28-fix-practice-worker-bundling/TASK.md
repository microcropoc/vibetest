# vt-28 — Исправить сборку practice Workers

## Контекст

При `npm start` все практические шаги (javascript, sqlite, regex) падают с `ExecutionProtocolError: Worker error`, потому что bundler не выделяет worker-чанки при динамическом `URL` через универсальную фабрику.

## Цель

Practice Workers корректно собираются и выполняются в dev и production.

## Требования

- Три явные фабрики с шаблоном `new Worker(new URL('./…worker.ts', import.meta.url), { type: 'module' })` в `execution/worker-factory.ts`.
- Runners принимают `createWorker: () => Worker` без `workerScriptUrl`.
- Оркестратор подключает тип-специфичные фабрики.

## Критерии готовности (Definition of Done)

- [ ] `ng test --watch=false` зелёный
- [ ] `ng build` (dev + production) успешен
- [ ] Smoke: запуск практики в `npm start` без Worker error
