---
branch: feature/vt-44-javascript-spy-fake-timers
---

# Отчёт vt-44 — JavaScript: spy + fake timers

## Что сделано

- Схема/SPEC: `expectInvocations`, `advanceMs` (0…60000), `flushMicrotasks`; порядок invoke/calls/await → flush/advance → spy → compare values.
- Изолированные среды: `__vibetestGlobal` bag на user/ref, инжект `registerSpy`, fake `setTimeout`/`setInterval`/`clear*`.
- Post-case: `compareSpyInvocations`; fake timer advance с лимитами pending/callbacks.
- Worker/runner/messages: новые поля кейса; checklist-тесты в `run-javascript-case.spec.ts`.
- Правки по ревью (2026-09-24): await без fake clock; порядок thrown → timer → spy; clearTimeout в due-batch; SPEC flush.

## Изменённые файлы

- `docs/SPECIFICATION.md`, `docs/schemas/course*.json`, `vibetest-app/public/schemas/*`
- `vibetest-app/src/app/execution/javascript-practice-global.ts`, `javascript-fake-timers.ts`, `javascript-practice-compile.ts`, `javascript-practice.worker.ts`, `execution-messages.ts`
- `vibetest-app/src/app/player/step-engine/javascript/run-javascript-case.ts`, `compare-spy-invocations.ts`, `apply-javascript-calls-async.ts`, `await-thenable.ts`, `javascript-practice-runner.ts`, `run-javascript-case.spec.ts`
- `vibetest-app/src/app/courses/generated/content-schemas.zod.ts` (generate:zod)

## Тесты

- `ng test --watch=false`: **259** passed (после правок по ревью, раунд 4)

## Отклонения от TASK.md

- `Date` не подменяется (как в TASK «unless required»).

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-24):

1. **Fake clock крутится внутри await** → …
2. **`Promise.reject(undefined)` считается fulfill** → …
3. **`clearTimeout` не отменяет таймер в due-списке** → …
4. **Spy раньше исхода кейса** → …
5. **SPEC и код расходятся по flush** → …

**Исправлено:**

1. Удалён `awaitThenableWithFakeTimers`; side chain без `timers`; fake clock только в `advanceMs`/`flushMicrotasks`; SPEC обновлён; тест Promise+fake `setTimeout` без `advanceMs` → Timeout.
2. Host `Promise.resolve` для await; `compareRejected`: оба reason `undefined` → pass (null в результате).
3. `fireDueTimers`: `timers.has(id)` перед callback; тест same-tick `clearTimeout`.
4. `failOnThrownSideOutcomes` до timer/spy; flush только при `flushMicrotasks`; тест throw vs `expectInvocations`.
5. SPEC: один host microtask checkpoint для user/ref.

Ревью (2026-09-24, раунд 2):

1. **`flushMicrotasks` не управляет очередью** → `runJavascriptCaseComparison` / `applyTimerPhase` → `await Promise.all` сторон уже дренирует microtasks вызова до `advanceMs`, поэтому Promise.then из sync-кода выполняется и без флага (тест `flushMicrotasks runs Promise before setTimeout(0)` прошёл бы и с `flushMicrotasks: false`). `await applyTimerPhase` после sync-`advanceMs` снова отдаёт очередь: microtask из колбэка таймера меняет spy до чтения даже без флага. Ожидание: флаг — единственный checkpoint до advance; чтение spy сразу после `advanceMs`, в том же синхронном повороте, без дренирования микротасков колбэка.

2. **`Promise.reject(undefined)` при `rejects: true` — pass, reason подменён на `null`** → `compareRejected` в `run-javascript-case.ts` → SPEC: `undefined` не JSON → fail (`non-JSON result`); так же ведёт себя fulfill. Pump убран, отдельный флаг больше не нужен. Ожидание: убрать ветку; оба `undefined` → `non-JSON result`, не pass.

3. **Checklist «timer + async Promise» не закрыт и не записан в отклонения** → тест `times out when Promise waits on fake setTimeout without advanceMs` только фиксирует Timeout → Нужен кейс, где promise уже settled и в том же кейсе `advanceMs` / spy (значение и вызовы). Либо явная строка в «Отклонения»: promise, который резолвится только fake-таймером, до `advanceMs` не доходит.

**Исправлено (раунд 2):**

1. `flushMicrotasks` — один `await Promise.resolve()` до sync `advanceMs`; spy сразу после advance без await; тест microtask внутри колбэка таймера без флага → count 1.
2. Убрана ветка pass для `reject(undefined)`; тест → `non-JSON result`.
3. Кейс `Promise.resolve(1)` + `setTimeout` + `advanceMs` + spy; timeout-тест без advance оставлен.

Ревью (2026-09-24, раунд 3):

1. **`flushMicrotasks` по-прежнему не отличает порядок Promise.then и `setTimeout(0)`** → …

**Исправлено (раунд 3):**

1. `settleValue` sync для non-thenable; `runJavascriptSideChain` без лишнего async; `resolveBothSideChains` без `Promise.all` на sync-пути; SPEC: non-thenable без await; эталонные тесты log 1 (без flush) vs log 2 (с flush + advanceMs 0).

Ревью (2026-09-24, раунд 4):

1. **Microtasks sync-шага всё равно исполняются до `flushMicrotasks`, если в кейсе есть любой await** → `resolveBothSideChains` / `runJavascriptSideChain`: await thenable другой стороны или следующего `calls` дренирует общую host-очередь до флага. SPEC обещает, что microtasks из non-thenable ждут `flushMicrotasks` / `advanceMs`. Ожидание: сузить SPEC до случая «обе стороны и все шаги sync» (это единственный путь без await) либо не отдавать очередь до явного flush.

2. **Throw после thenable не становится `kind: 'thrown'`** → `try/catch` только вокруг синхронного старта `runJavascriptSideChain`; `continueSideChainFromFulfilled` и колбэки `.then` снаружи. `await` в `runJavascriptCaseComparison` режектит, `failOnThrownSideOutcomes` не вызывается. Worker ловит это отдельно, прямой вызов — нет. Ожидание: тот же `{ kind: 'thrown', message }` на продолжении цепочки.

**Исправлено (раунд 4):**

1. SPEC: microtasks из sync-тела до flush/advance только на полностью sync-пути обеих сред; любой await thenable дренирует host-очередь.
2. `continueSideChainFromFulfilled` + `.then` rejection/handlers → `{ kind: 'thrown' }`; тест throw после settle Promise в `calls`.

Ревью (2026-09-24, раунд 5):

Замечаний нет.

Ревью (2026-09-24, раунд 6):

Замечаний нет. Diff относительно раунда 5 не менялся.
