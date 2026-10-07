---
branch: feature/vt-80-sqlite-engine-fix
---

# Отчёт vt-80 — Починить SQLite-движок и таймауты на мобильных

## Что сделано

- **Причина таймаута:** воркер грузил `public/sql-wasm.js` через `import()` и брал `module.default`, но это UMD-файл без ES-экспорта — загрузка падала, воркер отвечал с `id: 'unknown'`, обёртка ответ игнорировала, шаг ждал `timeoutMs`. Ломалось на любом устройстве, не только на телефоне.
- **Загрузка sql.js:** `execution/sqlite-engine.ts` (`loadSqlJs`) — статический `import initSqlJs from 'sql.js'`, бандлится в чанк SQL-воркера. В `angular.json`: `externalDependencies: fs/path/crypto` (эти `require` есть только в Node-ветке sql.js и в браузере не выполняются — из-за них vt-28 когда-то ушёл на runtime-`import()`), `allowedCommonJsDependencies: sql.js`, wasm копируется в сборку из `node_modules/sql.js/dist` — версия всегда совпадает с JS. `public/sql-wasm.js`, `public/sql-wasm.wasm` и ручные типы `sqlite-worker-types.ts` удалены (типы — из `@types/sql.js`).
- **Общий core:** `execution/sqlite-practice-core.ts` — `openSqlitePracticeSession` (две БД + `setup`, при ошибке `SqliteSetupError` «Setup SQL failed: …»), `runSqlitePracticeCase`, `closeSqlitePracticeSession`. Его используют воркер и in-process helper тестов (`loadSqlJsForSpecs` — тот же `loadSqlJs`, wasm с диска).
- **Протокол:** новое сообщение `sqliteLoad` → `sqliteLoaded` (только загрузка движка). Ошибки загрузки и `setup` приходят как `error` с id запроса. `requestIdFromUnknown` — id из невалидного запроса во внешнем `catch` всех воркеров (sqlite, javascript, regex, stub).
- **Таймауты:** runner сначала шлёт `sqliteLoad` с лимитом `SQLITE_ENGINE_LOAD_TIMEOUT_MS` = 30 с, deadline шага (`timeoutMs`) отсчитывается после загрузки. Ошибка init теперь возвращает текст ошибки, а не «Unexpected init response».
- **Тёплый воркер:** `execution/practice-worker-source.ts` — `PracticeWorkerSource` (`acquire` / `release` / `discard`), `singleUseWorkerSource`, `ReusableWorkerSource`. SQL-runner берёт воркер из источника: после обычного прогона воркер остаётся, при исключении (таймаут, протокол) — `discard` и пересоздание. В плеере `PlayerOrchestratorService` держит `ReusableWorkerSource` (dispose в `ngOnDestroy`) и при открытии sqlite-шага запускает `warmUpSqlitePractice` в фоне. Проверка шагов при импорте использует один тёплый воркер на курс (`PracticeReferenceValidationDeps.dispose`, вызывается в `finally` у `validatePracticeReferences`).
- **Ошибка для ученика:** `runPractice` ловит исключения раннера → `practiceRuntimeErrorFeedback`: «Ошибка выполнения: превышен лимит времени (N мс)» / текст ошибки.
- **Offline:** `/sql-wasm.wasm` перенесён в prefetch-группу `app` в `ngsw-config.json`.
- SPECIFICATION.md: SQLite-загрузка и переиспользование воркера, «Ошибка выполнения», раздел Offline/PWA.

## Изменённые файлы

- `vibetest-app/angular.json`, `vibetest-app/ngsw-config.json`
- `vibetest-app/public/sql-wasm.js`, `public/sql-wasm.wasm` — удалены
- `vibetest-app/src/app/execution/sqlite-engine.ts` — новый
- `vibetest-app/src/app/execution/sqlite-practice-core.ts` (+ spec) — новый
- `vibetest-app/src/app/execution/practice-worker-source.ts` (+ spec) — новый
- `vibetest-app/src/app/execution/sqlite-worker-types.ts` — удалён
- `vibetest-app/src/app/execution/sqlite-practice.worker.ts`, `execution-messages.ts` (+ spec), `execution-errors.ts` (`PracticeStartError`), `index.ts`
- `vibetest-app/src/app/execution/javascript-practice.worker.ts`, `regex-practice.worker.ts`, `execution-stub.worker.ts` — id в catch
- `vibetest-app/src/app/player/step-engine/sqlite/sqlite-practice-runner.ts` (+ spec), `index.ts`
- `vibetest-app/src/app/player/player-orchestrator.service.ts` (+ spec), `practice-step-view.ts` (+ spec)
- `vibetest-app/src/app/player/ui/player-shell/player-shell.ts` (+ spec — новый)
- `vibetest-app/src/app/courses/validate-practice-references.ts`, `practice-reference-in-process-runners.spec-helper.ts`
- `vibetest-app/src/app/shared/pwa/ngsw-config.spec.ts`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: зелёный (115 файлов, 672 теста после правок по ревью). Новые: core на реальном sql.js (совпадение, reset между кейсами, несовпадение, синтаксическая ошибка, битый setup), worker sources, `requestIdFromUnknown` и `sqliteLoad`, runner (тёплый воркер, ошибка загрузки, ошибка setup, загрузка вне `timeoutMs`, discard при таймауте, warm-up), `practiceRuntimeErrorFeedback`, orchestrator показывает «Ошибка выполнения» вместо тихого падения, ngsw — wasm в prefetch.
- `ng build` (production): успешно; предупреждение о бюджете initial bundle было и раньше (без изменений: 679.88 kB).
- **Собранный чанк SQL-воркера** прогнан в Node в окружении браузерного воркера (без `process`, `self` + `fetch` для wasm по URL из `locateFile`): `sqliteLoaded` → `sqliteInited` → кейс `pass: true`; битый setup → `error` с id и текстом «Setup SQL failed: incomplete input»; невалидный запрос → `error` с id запроса. Скрипт в `vibetest-app/tmp/` (gitignored), в репозиторий не входит.

## Отклонения от TASK.md

- Ручная проверка в браузере и на телефоне не выполнена: из песочницы агента dev-сервер недоступен (браузер и PowerShell получают отказ подключения). Вместо неё — прогон собранного чанка воркера в окружении браузерного воркера (см. «Тесты»). **Нужна проверка на телефоне после деплоя на GitHub Pages.**
- Внешний `catch` с id запроса исправлен также в regex- и stub-воркерах (одна общая функция); в vt-86 этот пункт уже не нужен.
- Правки `angular.json` (externalDependencies, allowedCommonJsDependencies, asset wasm из `node_modules`) — необходимы для бандлинга sql.js и синхронизации версии wasm.
- JS- и regex-раннеры по-прежнему создают воркер на каждый запуск — тёплый воркер только для SQL (там дорогая компиляция wasm).

## Открытые вопросы к ревью

- wasm (~660 kB) теперь в prefetch: Service Worker скачивает его при установке у всех пользователей, даже если SQL-шаги не открываются. Альтернатива — оставить lazy, но тогда SQL offline только после первого запуска.
- Warm-up отправляет `sqliteLoad` при переходе на sqlite-шаг (если предыдущий уже завершился); после первой загрузки это мгновенный ответ из кеша промиса в воркере.
## Изменения по ревью

- Прогрев и прогон одновременно владеют одним воркером, а таймаут его убивает. `ReusableWorkerSource.acquire` не смотрит, занят ли воркер; `ExecutionWorkerWrapperService.runRequest` по таймауту вызывает `worker.terminate()`. `warmUpSqlitePractice` (открытие sqlite-шага и `selectStep`) и `runSqlitePractice` шлют `sqliteLoad` в один и тот же экземпляр. Таймер прогрева — 30 с с момента открытия шага: если Run нажали, пока wasm ещё компилируется, срабатывание прогрева обрывает воркер, хотя у прогона свой лимит ещё не вышел. На медленном телефоне первый запуск снова заканчивается «превышен лимит времени», затем движок грузится с нуля. То же при переключении sqlite-шагов, пока первая загрузка не завершилась (`selectStep` не смотрит на `practiceRunning`). Ожидание: один владелец (очередь или счётчик); Run дожидается текущего `sqliteLoad` либо берёт воркер только после `release`/`discard` и получает свои 30 с; таймаут прогрева не делает `terminate` воркеру, которого уже ждёт прогон. Нужна спека на пересечение прогрева и Run.
- Ошибка загрузки движка и `setup` показывается как провал первой проверки. `loadEngine` и `sqliteInit` с `type: 'error'` возвращают `practiceRunFailure(0, …)`, UI собирает «Проверка 1 не пройдена: …» (`practiceFailureMessage`). Это не кейс: проверки ещё не было. В TASK для init задано «Ошибка выполнения: …». Ожидание: сбой `sqliteLoad` и setup идут в `practiceRuntimeErrorFeedback`, без номера проверки.
- `runPractice` ловит не только раннер. В том же `try`, что и прогон, — `persistStepSnapshot`. Сбой записи прогресса после успешного SQL показывается как «Ошибка выполнения» с 0 пройденных проверок, текст результата прогона на экран не попадает. Ожидание: catch только вокруг вызова раннера; ошибка IndexedDB не маскируется под ошибку SQL.

### Что исправлено

- **Один владелец воркера.** `PracticeWorkerSource.acquire()` теперь асинхронный. `ReusableWorkerSource` отдаёт воркер одному держателю; следующий `acquire` ждёт в очереди `release` / `discard`. Run, нажатый во время прогрева, дожидается его: после успешной загрузки движок уже готов (второй `sqliteLoad` мгновенный); при таймауте прогрева его воркер уничтожается, а Run получает новый воркер и свои 30 с. Чужой таймаут прогон больше не обрывает. `dispose` отклоняет ожидающих. В оркестраторе фоновая загрузка не стартует повторно, пока предыдущая в полёте (переключение sqlite-шагов). Спеки: `practice-worker-source.spec.ts` (передача после release, свежий воркер после discard, dispose с ожидающими), `sqlite-practice-runner.spec.ts` (Run во время медленного прогрева; таймаут прогрева на fake timers — Run на втором воркере проходит). SPEC (раздел про `timeoutMs`) описывает пересечение прогрева и Run.
- **Сбой до первой проверки — не «Проверка 1».** Новая ошибка `PracticeStartError` (`execution/execution-errors.ts`): раннер выбрасывает её при ошибке `sqliteLoad` и `sqliteInit` (и неожиданном ответе на них) вместо `practiceRunFailure(0, …)`. При ней воркер возвращается в источник (`release`), а не уничтожается — он исправен. Оркестратор показывает «Ошибка выполнения: Setup SQL failed: …» через `practiceRuntimeErrorFeedback`. Проверка импорта показывает текст ошибки без «test 0:».
- **`catch` только вокруг раннера.** Прогон вынесен в `runStepPractice`; `try/catch` охватывает только его. Результат прогона показывается до записи прогресса; ошибка `persistStepSnapshot` пробрасывается из `runPractice` (в глобальный обработчик), фидбек прогона остаётся. Спека: успешный regex-прогон + отказ `progress.put` → фидбек «Все проверки пройдены.», `runPractice` отклоняется ошибкой записи.
- `ng test --watch=false`: 114 файлов, 669 тестов — зелёный; `ng build` — успешно.

### Ревью (2026-10-07, раунд 2)

Пункты раунда 1 закрыты: очередь владельца, `PracticeStartError` без «Проверка 1», `catch` только вокруг раннера.

- `ReusableWorkerSource` застревает, если `factory()` бросает. В `acquire` флаг `held` ставится до `currentWorker()`; в `handOver` ожидающий снимается с очереди до `next.resolve(this.currentWorker())`. Синхронный throw из `new Worker(...)` оставляет `held === true`, ожидающий промис никто не отклоняет. Прогрев это глотает (`catch (() => undefined)`), следующий Run висит в `acquire` без таймаута — кнопка «Запустить» остаётся в `practiceRunning`. Ожидание: создавать воркер в `try`, при ошибке не держать аренду и отклонять снятого с очереди ожидающего.
- Ошибка записи прогресса — необработанный reject. `onPracticeRun` вызывает `void orchestrator.runPractice()`, отказ `persistStepSnapshot` после уже показанного фидбека уходит в глобальный обработчик. Отдельный экран для этого не нужен. Ожидание: поймать отказ в `onPracticeRun`, не сбрасывая `practiceFeedback`.

### Что исправлено (раунд 2)

- **Сбой `factory()` не держит аренду.** В `acquire` воркер создаётся до установки `held`; throw → отклонённый промис, аренда свободна. `handOver` при ошибке создания воркера отклоняет снятого с очереди ожидающего и передаёт аренду следующему; если никого не осталось — `held = false`. Спеки: отказ `acquire` и успешный следующий `acquire`; `discard` + сбой замены → ожидающий отклонён, следующий `acquire` получает новый воркер.
- **Отказ записи прогресса пойман в `onPracticeRun`.** `player-shell` вызывает `runPractice().catch(…)` и пишет `console.error('Practice progress save failed', error)`; `practiceFeedback` не трогается. Новая спека `player-shell.spec.ts`: клик «Запустить», `runPractice` выставляет фидбек и отклоняется → ошибка залогирована, фидбек остался.
- `ng test --watch=false`: 115 файлов, 672 теста — зелёный.

### Ревью (2026-10-07, раунд 3)

Пункты раунда 2 закрыты: сбой `factory()` не оставляет аренду, отказ записи прогресса ловится в `onPracticeRun` и не сбрасывает фидбек.

Замечаний нет.
