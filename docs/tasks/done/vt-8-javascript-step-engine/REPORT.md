---
branch: feature/vt-8-javascript-step-engine
---

# Отчёт vt-8 — Движок шага javascript

## Что сделано

- Расширен протокол `execution/`: `javascriptInit`, `javascriptRunCase`, ответы `javascriptInited`, `javascriptCaseResult`.
- Web Worker `javascript-practice.worker.ts`: двойное окружение (user / reference), `setup` + код шага, сброс между кейсами, сравнение return через JSON.
- `javascript-practice-runner.ts`: оркестрация через `ExecutionWorkerWrapperService`, fail-fast по кейсам, общий бюджет `timeoutMs`, `terminate()` worker в `finally`.
- `javascript-step-engine.ts`: `setDraftCode`, `retry` → starter, `applyJavascriptPracticeResult()` вне `reduce`; экспорт фабрики и `javascriptPracticeWorkerUrl()`.
- Юнит-тесты runner (mock worker) и step engine.

## Изменённые файлы

- `vibetest-app/src/app/execution/execution-messages.ts`
- `vibetest-app/src/app/execution/javascript-practice.worker.ts` (новый)
- `vibetest-app/src/app/player/step-engine/javascript/*` (новый)
- `vibetest-app/src/app/player/step-engine/index.ts`

## Тесты

- `npx ng test --watch=false`: зелёный (после правки типов в `applyJavascriptPracticeResult`).

## Отклонения от TASK.md

- Нет.

## Сравнение результатов (JSON)

- Только JSON-совместимые значения в `args` и return; сравнение через `JSON.stringify` (`jsonCompatibleEqual`); `undefined` / `NaN` вне модели курса.

## Открытые вопросы к ревью

- Интеграционный тест с реальным Worker в Karma — отложен до vt-19/UI; сейчас покрытие через mock `WorkerFactory`.

## Изменения по ревью

_(после замечаний пользователя)_
