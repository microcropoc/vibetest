# vt-7 — Execution: общий Worker core (без UI)

## Контекст

Практические шаги (`javascript`, `sqlite`, `regex`) выполняются в Web Worker. Компоненты не вызывают `postMessage` напрямую — только через wrapper в `execution/`. Сейчас нет общего протокола, таймаута и parse границ.

## Цель

В `execution/`: типы сообщений (request/response), `parse*` для `MessageEvent.data`, единый **Worker wrapper service** (spawn, post, terminate on timeout), тестовый adapter/mock. **Без** логики конкретного языка (JS/SQL/regex) — только транспорт и lifecycle.

## Требования

- Discriminated union сообщений; strict parse на границе (`unknown` → typed).
- Timeout: вызывающий передаёт лимит из `timeoutMs` content; по истечении → terminate worker, ошибка наверх без зависания UI-потока.
- Один публичный сервис для оркестраторов шагов (vt-8 … vt-10).
- Unit-тесты протокола и wrapper с mock Worker (без TestBed для pure parse).
- Зависимость: **vt-3** (контракт шага не обязателен для transport, но задача после core engine).

## Технические заметки

- Папка: `execution/` (workers, message types, wrapper service).
- Worker script — заглушка или echo до vt-8; vt-7 фокус на контракте и wrapper.

## План работ

- [ ] Message types + parse helpers
- [ ] WorkerWrapperService (timeout, terminate)
- [ ] Mock Worker tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Компоненты могут зависеть только от wrapper, не от raw Worker API

## Вне рамок задачи

- Реализация JS/SQL/regex runners (vt-8 … vt-10)
- Step engine UI, Dexie
