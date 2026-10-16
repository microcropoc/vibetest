---
branch: feature/vt-86-regex-engine-hardening
---

# Отчёт vt-86 — Укрепить regex-двиок

## Что сделано

- Общий модуль `execution/regex-practice-core.ts`: `openRegexPracticeSession`, `runRegexPracticeCase`, `RegexPatternCompileError` (компиляция без флагов, сравнение `RegExp.test`).
- Воркер: `regex-practice-worker-handler.ts` + тонкий `regex-practice.worker.ts`; outer catch с `requestIdFromUnknown`.
- `runRegexReferenceSelfCheck` (import / sample-courses) использует core вместо дублирования `new RegExp`.
- `runRegexPractice`: при `ExecutionTimeoutError` на `regexRunCase` — сообщение «Превышено время: возможен катастрофический бэктрекинг» (`REGEX_CASE_TIMEOUT_MESSAGE`). `runPractice` catch уже из vt-80.

## Изменённые файлы

- `vibetest-app/src/app/execution/regex-practice-core.ts` (+ spec)
- `vibetest-app/src/app/execution/regex-practice-worker-handler.ts` (+ spec)
- `vibetest-app/src/app/execution/regex-practice.worker.ts`
- `vibetest-app/src/app/courses/practice-reference-in-process-runners.spec-helper.ts`
- `vibetest-app/src/app/player/step-engine/regex/regex-practice-runner.ts` (+ spec)
- `docs/tasks/done/vt-86-regex-engine-hardening/` — TASK.md, REPORT.md

## Тесты

- `ng test --watch=false`: **775 passed** (127 files), в т.ч. core, worker handler (error id, invalid pattern, uninitialized run), runner ReDoS timeout mapping.

## Отклонения от TASK.md

- Отдельный catch в orchestrator для ReDoS не добавлялся: vt-80 уже показывает runtime errors; таймаут кейса возвращается как `practiceRunFailure` с русским текстом (номер проверки сохраняется).

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-10-16), ветка `feature/vt-86-regex-engine-hardening` (коммит `d49107f`):

- Замечаний нет.
