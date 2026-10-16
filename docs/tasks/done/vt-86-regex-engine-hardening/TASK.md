# vt-86 — Укрепить regex-двиок

**Приоритет:** P1  
**Зависимости:** нет (параллельно с vt-80 допустимо)  
**Блокирует:** vt-87, vt-88, vt-89, vt-90

## Контекст

Regex-шаг сравнивает только `RegExp.test(input)` без флагов. In-process helper в [practice-reference-in-process-runners.spec-helper.ts](../../../vibetest-app/src/app/courses/practice-reference-in-process-runners.spec-helper.ts) дублирует логику вместо общего core. В [regex-practice.worker.ts](../../../vibetest-app/src/app/execution/regex-practice.worker.ts) внешний catch отвечает с `id: 'unknown'` — та же проблема, что у SQL: обёртка игнорирует ответ, шаг ждёт таймаут. При катастрофическом бэктрекинге ученик видит лишь общий timeout.

## Цель

Regex-практика надёжна: один код пути в prod и тестах, ошибки воркера с корректным `id`, понятное сообщение при ReDoS/таймауте.

## Требования

- Чистый модуль `execution/regex-practice-core.ts`: компиляция паттернов (пока без флагов — как сейчас), прогон одного кейса, сравнение boolean `.test()`.
- Воркер и `runRegexReferenceSelfCheck` вызывают core.
- Любая ошибка воркера — с `id` запроса (best-effort из сырого сообщения при падении до `parseExecutionRequest`).
- При таймауте на кейсе — сообщение «Превышено время: возможен катастрофический бэктрекинг» (или через `ExecutionTimeoutError` + маппинг в orchestrator).
- Catch в `runPractice` с показом ошибки ученику — если vt-80 ещё не смержен, сделать здесь; иначе только regex-специфичный маппинг ReDoS.
- Тесты: error id, invalid pattern, timeout на ReDoS-паттерне (например `(a+)+$` на длинной строке).

## Технические заметки

- Домены: `execution/` (worker, core, regex-pattern), `player/` (orchestrator при необходимости), `courses/` (helper).
- Файлы: `regex-practice.worker.ts`, `regex-practice-runner.ts`, `regex-pattern.ts`, `practice-reference-in-process-runners.spec-helper.ts`, `regex-practice-runner.spec.ts`.

## План работ

- [ ] `regex-practice-core.ts` + рефакторинг worker/helper
- [ ] Исправить outer catch (id в error response)
- [ ] ReDoS timeout message в runner/orchestrator
- [ ] `runPractice` catch (если не из vt-80)
- [ ] Спеки: error id, invalid regex, ReDoS timeout
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Self-check regex в import и sample-courses использует core
- [ ] Невалидный паттерн — текст ошибки, не молчаливый таймаут из-за `unknown` id
- [ ] Тесты зелёные

## Вне рамок задачи

- Расширение схемы (flags, mode, …) — vt-87
- Курсы — vt-88–90
