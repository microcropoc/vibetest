---
branch: feature/vt-65-practice-run-stats
---

# Отчёт vt-65 — Статистика прогона практики

## Что сделано

- В ответах воркера (`javascriptCaseResult`, `sqliteCaseResult`, `regexCaseResult`) добавлены `userMs` / `referenceMs`; время измеряется только для кода под проверкой.
- Раннеры JS/SQL/regex возвращают общий `PracticeRunResult` с `totalTests` и суммарным временем при успехе.
- Плеер: `practiceFeedbackFromResult`, блок «Тесты: N из M» и сравнение времени с эталоном при успехе в `practice-step-shell`.
- SPEC: параграф «Статистика прогона».

## Изменённые файлы

- `vibetest-app/src/app/execution/execution-messages.ts`, workers (javascript/sqlite/regex)
- `vibetest-app/src/app/player/step-engine/practice-run-result.ts`, три practice-runner
- `vibetest-app/src/app/player/step-engine/javascript/run-javascript-case.ts`
- `vibetest-app/src/app/player/practice-step-view.ts`, orchestrator, practice-step-shell
- `vibetest-app/src/app/courses/practice-reference-in-process-runners.spec-helper.ts`
- `docs/SPECIFICATION.md`, specs

## Тесты

- `ng test --watch=false`: зелёный (416)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Ревью (2026-09-28, раунд 1). Скоуп: ветка без коммитов, весь дифф — незакоммиченный; `ng test --watch=false` — 413 passed.

1. **Время async JS-решений перекрывается и смещено против ученика** → `run-javascript-case.ts`, `resolveBothSideChains` / `timeJavascriptSideChain`: user-цепочка стартует, затем синхронно выполняется reference-цепочка, и только потом резолвятся промисы. Для thenable-результата окно `userMs` (от старта до `then`) включает синхронную работу эталона и interleaving микрозадач; `referenceMs` — наоборот частично. Итог: для async-функций пользователь систематически «медленнее эталона», что противоречит SPEC («только код под проверкой»). Ожидание: измерять стороны последовательно (дождаться user-цепочки, затем стартовать reference — среды изолированы) либо честно ограничить метрику (например только sync-часть / не показывать сравнение для async) и отразить в SPEC; тест на async-функцию с одинаковым кодом (сравнение не должно быть «медленнее»).
2. **Сравнение строится на шуме таймера** → `practice-step-view.ts`, `practiceTimingComparison`: при `userMs = 0` и `referenceMs = 0.5` выходит `referenceMs / Math.max(userMs, 0.0001)` → «Быстрее эталона (≈ в 5000 раза)»; при 0.1 vs 0.2 мс — «В 2 раза медленнее». В Worker без cross-origin isolation разрешение `performance.now()` ~0.1–1 мс (SPEC это признаёт), так что для regex и коротких SQL/JS коэффициенты случайны. Ожидание: порог значимости (например, если обе суммы или их разница ниже ~1 мс — «сопоставимо» / без коэффициента), кейсы в spec для `0`, очень малых значений и `referenceMs = 0`; заодно выровнять формулировки («Быстрее эталона (≈ в N раза)» vs «В N раза медленнее эталона»).
3. **Отсутствие тайминга молча превращается в 0 мс** → `execution-messages.ts` (`userMs` / `referenceMs` — `optional()` во всех трёх `*CaseResult`), `javascript-practice.worker.ts` (условный spread), `caseTimingsFromResponse` → `undefined` пропускается, и успех покажет «< 0.1 мс» без какого-либо сигнала. Все три воркера теперь всегда присылают время (JS — через `withCaseTimings` на всех путях после запуска цепочек). Ожидание: сделать поля обязательными в схемах ответов (и убрать условный spread / `caseTimingsFromResponse`), либо при отсутствии не показывать тайминг (`timing` в `PracticeFeedback` — только если все кейсы прислали время).
4. **Тайминг в тестовом хелпере — лишний и неоднородный** (nit) → `practice-reference-in-process-runners.spec-helper.ts`: для JS используется `createPracticeTimingAccumulator`, для regex/sqlite — ручные `let userMs/referenceMs` + `performance.now()`; результат нигде не проверяется (self-check эталона). Ожидание: единообразно (аккумулятор) или просто нули — хелперу нужно только удовлетворить тип `PracticeRunResult`.
5. **Неиспользуемый re-export** (nit) → `practice-step-view.ts`, `export type { PracticeRunResult }` — потребителей нет (все импортируют из `step-engine/practice-run-result`). Ожидание: удалить.
6. **Вызовы методов форматирования в шаблоне** (nit) → `practice-step-shell.html` / `.ts`: `formatDuration(...)`, `timingComparison(...)` пересчитываются на каждом CD. Ожидание: `computed()` с view-model тайминга (строки user/reference/сравнение) — по правилу «derived — `computed()`».

**Исправлено (раунд 1):** п.1 — последовательное измерение user→reference, тест async, SPEC; п.2 — порог 1 ms и spec; п.3 — обязательные поля в протоколе, без `caseTimingsFromResponse`; п.4 — нули в self-check хелпере; п.5 — re-export удалён; п.6 — `timingLabels` computed. `ng test --watch=false`: 416 passed.

Ревью (2026-09-28, раунд 2). Проверено в коде: п.1 (user → reference последовательно в `resolveBothSideChains`, SPEC обновлён), п.3 (поля обязательны в трёх `*CaseResult`, раннеры суммируют напрямую), п.4, п.5, п.6 — исправлены. П.2 — исправлен частично (см. ниже). `ng test --watch=false` — 416 passed.

1. **«≈ в Infinity раза» и коэффициент от шумового значения** → `practice-step-view.ts`, `practiceTimingComparison`: порог проверяет `max` и `diff`, но sub-threshold проверяется только у `referenceMs`. При `userMs = 0`, `referenceMs = 5` → `speedup = 5 / 0` → «Быстрее эталона (≈ в Infinity раза).»; при `0.3` vs `5` — «≈ в 16.7 раза» от шумового значения. SPEC при этом обещает коэффициент «только если обе суммы и их разница ≥ ~1 ms». Ветка `'Быстрее эталона.'` в блоке `referenceMs < threshold` недостижима (там всегда `userMs ≥ referenceMs + 1`). Ожидание: симметрично — если `min(userMs, referenceMs) < threshold`, то «Быстрее / Медленнее эталона.» без коэффициента; кейсы в spec: `(0, 5)`, `(0.3, 5)`, `(5, 0.3)`.
2. **Тест на async-тайминг не ловит регрессию** → `run-javascript-case.spec.ts`, «times identical async functions as comparable, not slower»: `Promise.resolve(1)` выполняется за микросекунды, обе суммы ниже порога 1 ms → «сопоставимо» выходит и на старом (параллельном) коде. Ожидание: детерминированная проверка порядка (reference-invoke стартует только после settle user-промиса — лог вызовов через обёртки `invokeUser` / `invokeReference`) либо async-функция с измеримой sync-работой.
3. **Плейсхолдеры `userMs: 0, referenceMs: 0` во внутренних результатах** (nit) → `run-javascript-case.ts`: `fail()`, `compareJsonValues`, `compareFulfilledWithMode`, `compareWithChecker` возвращают нули, которые потом перезаписывает `withCaseTimings`; единственный путь без перезаписи — ранний `fail` materialize (до запуска цепочек), там 0 корректен. Ожидание: внутренним функциям возвращать тип без тайминга (например `Omit<JavascriptCaseRunResult, 'userMs' | 'referenceMs'>`), время добавлять только в `runJavascriptCaseComparison`, чтобы нули не маскировали забытый `withCaseTimings`.
4. **`const` между import-ами** (nit) → `practice-reference-in-process-runners.spec-helper.ts`: `REFERENCE_SELF_CHECK_TIMINGS` объявлен до `import type { PracticeReferenceValidationDeps }`. Ожидание: перенести после всех import-ов.

**Исправлено (раунд 2):** п.1 — `minMs` в `practiceTimingComparison`, spec `(0,5)` / `(0.3,5)` / `(5,0.3)`, SPEC; п.2 — тест порядка вызовов user-settled → reference-start; п.3 — `JavascriptCaseCompareResult` + `failBeforeSideChains`; п.4 — const после imports. `ng test --watch=false`: 416 passed.

Ревью (2026-09-28, раунд 3). Пункты 1–4 раунда 2 проверены в коде — исправлены: `practiceTimingComparison` не даёт коэффициент, если любая сумма ниже порога (кейсы `(0,5)`, `(0.3,5)`, `(5,0.3)` в spec); тест порядка «user-settled → reference-start» не проходит на прежнем параллельном коде (practice-код компилируется через `new Function` в том же realm, `instanceof Promise` срабатывает); внутренние функции сравнения возвращают `JavascriptCaseCompareResult` без тайминга, нули только в `failBeforeSideChains`; `const` после import-ов. `ng test --watch=false` — 416 passed. Замечаний нет.
