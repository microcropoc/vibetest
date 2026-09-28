---
branch: feature/vt-68-bundled-courses
---

# Отчёт vt-68 — Встроенные курсы

## Что сделано

- Генерация при сборке: `tools/generate-bundled-courses.mts` → `public/bundled-courses/*.json` + `generated-bundled-courses.ts` (детерминированные UUID из хеша import-DTO).
- `BundledCoursesService` (lazy, через `import()` в `APP_INITIALIZER`) + параллельная загрузка курсов; `settings.bundledCoursesSeen` в Dexie через `BundledCoursesSeenRepository`.
- Настройки: секция «Встроенные курсы», кнопка «Добавить недостающие курсы».
- `ngsw-config.json`: кеш `/bundled-courses/**`; `prebuild` / `prestart` вызывают генерацию.

## Изменённые файлы

- `vibetest-app/src/app/courses/bundled/**`
- `vibetest-app/src/app/storage/bundled-courses-seen-repository.ts`, `bundled-courses-seen-row.ts`, `parse-bundled-courses-seen.ts`, `settings-bundled-courses-key.ts`
- `vibetest-app/src/app/courses/import-parse.ts`
- `vibetest-app/src/app/app.config.ts`, settings-page
- `vibetest-app/tools/generate-bundled-courses.mts`, `package.json`, `.gitignore`, `ngsw-config.json`
- `docs/SPECIFICATION.md`, `docs/courses/README.md`

## Тесты

- `npx ng test --watch=false`: зелёный, 444 теста (91 файл)
- `ng build`: initial total 677.14 KB (на `main` 676.92 KB); предупреждение о бюджете 500 KB было и на `main`

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- **Дубли курса при обновлении контента (п. 5 ревью):** ID строится из хеша канонического import-DTO; любая семантическая правка даёт новый курс, старый с прогрессом остаётся. Подтвердить, что текущее поведение приемлемо для MVP, или запланировать slug + явное обновление / метку «есть новая версия».

## Изменения по ревью

### Ревью (2026-09-28, раунд 1)

Скоуп: на ветке нет коммитов, весь дифф незакоммичен. `ng test --watch=false`: 439 passed (90 files). `ng build` проходит, но с предупреждением о бюджете (см. п. 7).

1. **Дублирование пайплайна импорта.**
   - **Что:** `buildBundledCourseFromImportText` построчно повторяет `parseImportCourseText`: unwrap → `JSON.parse` → `ImportCourseSchema.safeParse` → `importDtoToCourse` → `validateCourseSemantics`. Отличие одно: передаются `randomUuid` и `now`. При ошибке Zod детали теряются («Import DTO zod validation failed» без путей).
   - **Где:** `src/app/courses/bundled/build-bundled-courses.spec-helper.ts`; `src/app/courses/import-parse.ts`.
   - **Почему:** правило «Never: duplicate logic». Любое изменение импорта (новая стадия, новая проверка) придётся вносить в двух местах.
   - **Ожидание:** добавить в `parseImportCourseText` необязательный параметр `deps: ImportDtoToCourseDeps` и пробросить его в `importDtoToCourse`. Bundled-сборка вызывает `parseImportCourseText(text, { randomUuid, now })`, а при `!ok` падает с `formatParseIssues`, как `build-course-from-sources`.

2. **«Добавить недостающие курсы» сообщает об успехе при сбое загрузки.**
   - **Что:** `tryInstallBundledEntry` при сетевой ошибке, 404, ошибке parse или несовпадении ID возвращает `false`. `restoreMissing` в таком случае возвращает 0, и страница показывает «Все встроенные курсы уже установлены», хотя курсы не установлены (например, офлайн, если файлы ещё не попали в кеш SW). Кроме того, в `onRestoreBundledCourses` нет `catch`: если бросит `courses.list()`, получится unhandled rejection без сообщения.
   - **Где:** `bundled-courses-sync.ts` (`restoreMissingBundledCourses`), `settings-page.ts`.
   - **Ожидание:** возвращать `{ added, failed }` (или `failed: readonly string[]`) и показывать отдельный текст, например «Не удалось загрузить: N». В компоненте ловить ошибку и выводить статус. Добавить тесты: сбой fetch при restore и отображение ошибки на странице.

3. **`BundledCoursesService.forTest` через `Object.create` и `as unknown as`.**
   - **Что:** экземпляр создаётся без конструктора, а приватное поле записывается через `(service as unknown as { deps }).deps = …`. Поэтому `deps` пришлось сделать изменяемым, без `readonly`.
   - **Где:** `src/app/courses/bundled/bundled-courses.service.ts`.
   - **Почему:** по правилам проекта `as unknown as T` допустим только внутри `parseX`. Кроме того, это расходится с принятым шаблоном `static forDb(...)` → `new ...(...)` (`CourseRepository`, `CourseImportService`).
   - **Ожидание:** `private readonly deps`. Конструктор принимает репозитории через `inject()` по умолчанию, а `manifest` и `fetchFn` — опциональными параметрами. Для тестов — `static forDb(db, { fetchFn, manifest })` через `new`.

4. **`APP_INITIALIZER` без таймаута блокирует старт на сетевом запросе.**
   - **Что:** пока нет записей в `bundledCoursesSeen` (первый запуск или новый курс), bootstrap ждёт fetch ~200–230 KB на курс, parse и запись в Dexie. `.catch` в `app.config.ts` ловит только reject. Если запрос повиснет (плохая сеть, SW ещё не установлен, captive portal), пользователь будет видеть пустой экран неограниченно долго.
   - **Где:** `src/app/app.config.ts` (`initializeBundledCourses`), `bundled-courses-sync.ts` / `bundled-courses.service.ts` (`defaultFetch`).
   - **Ожидание:** ограничить ожидание (`AbortSignal.timeout(…)` в fetch или `Promise.race` в инициализаторе) либо запускать синхронизацию без блокировки bootstrap, обновляя список курсов после неё. Выбранный вариант описать в SPEC.
   - Nit: `APP_INITIALIZER` устарел в пользу `provideAppInitializer`. Тема использует то же API, поэтому допустимо оставить ради единообразия.

5. **Вопрос к дизайну: дубли курса при каждом обновлении контента.**
   - **Что:** ID вычисляется из хеша всего текста курса. Любая правка флагманского курса (опечатка в одном модуле) при следующем обновлении приложения поставит пользователю второй курс с тем же названием. Старый курс с прогрессом останется. SPEC это описывает, но в UX нет признака, какая копия актуальна, а после нескольких релизов список заполнится одинаковыми названиями.
   - **Где:** `docs/SPECIFICATION.md` (раздел «Встроенные курсы»), `build-bundled-courses.spec-helper.ts`.
   - **Ожидание:** подтвердить у владельца продукта и занести в «Открытые вопросы» (сейчас там «Нет»). Возможные варианты: помечать заменённую версию («есть новая версия») или сделать стабильный ID по slug с явным обновлением. Не блокирует мерж, если решение подтверждено.

6. **Хешируется текст, а не DTO** (nit).
   - **Что:** `contentHashFromImportText` берёт SHA-256 от сырого текста с нормализованными переводами строк. В SPEC и REPORT написано «SHA-256 от содержимого import-DTO». В итоге переформатирование JSON без смысловых изменений тоже даёт новый `courseId`, а с ним дубль из п. 5.
   - **Где:** `build-bundled-courses.spec-helper.ts`, `docs/SPECIFICATION.md`.
   - **Ожидание:** хешировать `JSON.stringify(zodResult.data)` (канонический DTO) или поправить формулировку в SPEC и REPORT.

7. **Начальный бандл вырос на ~22 KB** (nit).
   - **Что:** из-за eager-импорта `BundledCoursesService` в `app.config.ts` общий lazy-чанк (~21.9 KB: `CourseRepository`, `parseCourse`) переехал в `main`. Замер на `main` против ветки: `main` 516.96 → 539.28 KB raw (110.9 → 117.1 KB transfer), initial total 676.92 → 699.24 KB. Бюджет 500 KB был превышен уже на `main`.
   - **Где:** `src/app/app.config.ts`.
   - **Ожидание:** либо `await import('./courses/bundled/bundled-courses-sync')` внутри инициализатора (установленные курсы не будут тянуть парсер в `main`), либо записать прирост в «Отклонения».

8. **Мелочи в spec-helper и тестах** (nit).
   - `bundledFileNameForDocsJson` фактически ничего не делает: список уже отфильтрован по `.json`. К тому же `entry.file: ''` сначала ставится заглушкой, а затем перезаписывается. Имя файла стоит передавать сразу.
   - Тип `BundledCourseEntry` объявлен дважды: в `build-bundled-courses.spec-helper.ts` и в сгенерированном `generated-bundled-courses.ts`.
   - Тест `each docs course bundled output parses as Course` захардкожен на два имени файла. Итерировать `listDocsCourseJsonPaths`, иначе новый курс в `docs/courses/` не попадёт под проверку.
   - `npx ng build` в обход `npm run build` пропускает генерацию, и в сборке не будет `bundled-courses/` (молчаливые 404 при старте). Стоит упомянуть в README.

### Исправлено (раунд 1)

1. Общий `parseImportCourseText(text, dtoDeps?)` + `parseImportCourseDtoText` / `formatImportParseIssues` в `import-parse.ts`; bundled-сборка через них.
2. `restoreMissing` → `{ added, failed }`; UI и тесты на сбой fetch; `catch` на странице настроек.
3. `BundledCoursesService`: приватный конструктор, `createRoot()` / `static forDb(db, { fetchFn, manifest? })`, без `Object.create`.
4. Fetch с `AbortSignal.timeout(15_000)`; sync в `APP_INITIALIZER` через lazy `import()` модулей sync/manifest/fetch (не блокирует bootstrap бесконечно).
5. Открытый вопрос по дублям вынесен в «Открытые вопросы» (поведение зафиксировано в SPEC).
6. `contentHashFromImportDto` (SHA-256 от `JSON.stringify` после Zod); перегенерирован манифест (новые `courseId` для текущих курсов).
7. `BundledCoursesService` не в `main` через eager DI: factory-провайдер + lazy sync в initializer.
8. Spec-helper: имя файла сразу, тип из generated, тест итерирует `listDocsCourseJsonPaths`; README про `ng build` без prebuild.

### Ревью (2026-09-28, раунд 2)

Скоуп: на ветке по-прежнему нет коммитов, весь дифф незакоммичен. `ng test --watch=false`: 441 passed (90 files). `ng build` проходит с тем же предупреждением о бюджете.

Подтверждены пункты 1, 2, 3, 5, 6 и 8 раунда 1. Для п. 1: общий `parseImportCourseDtoText` / `parseImportCourseText(text, dtoDeps)`, ошибки через `formatImportParseIssues`. Для п. 4 таймаут есть (`AbortSignal.timeout(15_000)`), SPEC обновлена.

1. **Пункт 7 раунда 1 не исправлен: lazy `import()` ничего не выносит из начального бандла.**
   - **Что:** `app.config.ts` статически импортирует `BundledCoursesService` (ради factory-провайдера) и `CourseRepository`. Сам `bundled-courses.service.ts` статически импортирует `bundled-courses-sync` (→ `parseCourse`), `generated-bundled-courses` и `bundled-courses-fetch`. Поэтому `import()` в `initializeBundledCourses` указывает на модули, которые уже лежат в начальном графе, и отдельного lazy-чанка не появляется.
   - **Замер:** initial total 694.95 KB против 676.92 KB на `main`, то есть прирост ~18 KB сохранился. Код лишь перераспределился между `main` (205.92 KB) и новым initial-чанком `chunk-Dy50Sfkg.js` (329.08 KB).
   - **Где:** `src/app/app.config.ts`, `src/app/courses/bundled/bundled-courses.service.ts`.
   - **Ожидание:** выбрать одно из двух.
     - Либо убрать статические импорты sync-кода из eager-графа. Например, `BundledCoursesService` не регистрировать в `app.config.ts` (сделать `@Injectable({ providedIn: 'root' })` с `inject()`, чтобы его подтягивала только lazy `settings-page`), а в инициализаторе оставить только `import()`. Затем проверить `ng build`: initial total должен вернуться к ~677 KB.
     - Либо отказаться от lazy-загрузки и записать +18 KB в «Отклонения».
   - Сейчас код создаёт впечатление оптимизации, которой нет.

2. **Связывание зависимостей в двух местах** (nit, связан с п. 1).
   - **Что:** `initializeBundledCourses` вручную собирает `{ courses, settings, manifest, fetchFn }` и вызывает `syncBundledCoursesOnStartup` мимо `BundledCoursesService.syncOnStartup`. Ту же сборку делает `BundledCoursesService.createRoot()`. Если поменять источник манифеста или fetch в одном месте, второе разойдётся.
   - **Где:** `app.config.ts`, `bundled-courses.service.ts`.
   - **Ожидание:** один источник: инициализатор через `import()` получает сервис или фабрику `createBundledCoursesSyncDeps(...)`. Решается вместе с п. 1.

3. **Частичный успех восстановления скрывает добавленные курсы** (nit).
   - **Что:** если `added > 0` и `failed.length > 0`, страница показывает только «Не удалось загрузить: N», и пользователь не узнаёт, что часть курсов вернулась.
   - **Где:** `settings-page.ts` (`onRestoreBundledCourses`).
   - **Ожидание:** выводить оба числа, например «Добавлено: 1. Не удалось загрузить: 1».

4. **SPEC не описывает ошибку восстановления и суммарное ожидание** (nit).
   - **Что:** в разделе «Настройки» по-прежнему упоминается только счётчик «Добавлено: N». Сообщения «Не удалось загрузить: N» и «Не удалось проверить встроенные курсы» не описаны. Кроме того, таймаут 15 с действует на каждый запрос, а курсы грузятся последовательно, так что при двух новых курсах пустой экран может длиться до ~30 с.
   - **Где:** `docs/SPECIFICATION.md` (раздел «Встроенные курсы»); `bundled-courses-sync.ts`.
   - **Ожидание:** дополнить SPEC. Для старта стоит подумать об общем лимите (один `AbortSignal` или `Promise.race` на весь sync) или о параллельной загрузке, иначе задокументировать «до 15 с на курс».

### Исправлено (раунд 2)

1. Lazy-загрузка теперь реальная. `BundledCoursesService` — `@Injectable({ providedIn: 'root', useFactory })`, из `app.config.ts` статический импорт и провайдер убраны. Инициализатор делает `import('./courses/bundled/bundled-courses.service')` → `injector.get(...).syncOnStartup()`. Вторая причина прироста: `SettingsRepository` (eager через тему) через `parseBundledCoursesSeen` тянул `UuidSchema` из сгенерированных Zod-схем. Чтение/запись `bundledCoursesSeen` вынесены в отдельный `BundledCoursesSeenRepository`, `SettingsRepository` / `settings-row-parse.ts` возвращены к версии `main`. Замер `ng build`: initial total 677.14 KB (на `main` 676.92 KB).
2. Зависимости собираются в одном месте — `BundledCoursesService.createRoot()`; инициализатор получает сервис через DI.
3. При частичном успехе статус «Добавлено: N. Не удалось загрузить: M»; тест на странице и тест сервиса на частичное восстановление.
4. Курсы загружаются параллельно (`Promise.all`), поэтому старт ждёт не дольше одного таймаута (~15 s). В SPEC описаны все статусы восстановления и лимит ожидания.

### Ревью (2026-09-28, раунд 3)

Скоуп: на ветке по-прежнему нет коммитов, весь дифф незакоммичен. `ng test --watch=false`: 444 passed (91 files). `ng build`: initial total 677.14 KB (на `main` 676.92 KB), предупреждение о бюджете такое же, как на `main`.

Все пункты раунда 2 подтверждены:

1. `BundledCoursesService` больше не входит в начальный граф: `app.config.ts` загружает его только через `import()`, а парсер попал в lazy-чанк. `SettingsRepository` и `settings-row-parse.ts` совпадают с `main`, а `bundledCoursesSeen` вынесен в `BundledCoursesSeenRepository` (с тестом).
2. Зависимости собираются в одном месте, `createRoot()`, и инициализатор получает сервис через DI.
3. Частичный успех показывается как «Добавлено: N. Не удалось загрузить: M», на это есть тесты.
4. Загрузка параллельная, SPEC описывает все статусы и лимит ~15 с.

Остался один nit:

1. **Случайно попавший сгенерированный файл.**
   - **Что:** в рабочем дереве изменён `src/app/shared/build-info/generated-build-info.ts` (коммит `7e7a1e2` → `623848e`). Это артефакт локального `npm run build` (prebuild → `generate:build-info`), к задаче он не относится и в «Изменённых файлах» не указан.
   - **Ожидание:** откатить (`git restore`) перед коммитом, чтобы он не попал в squash vt-68.

С учётом этого nit **ок к мержу**. Открытый вопрос о дублях курса при обновлении контента по-прежнему ждёт решения владельца продукта (не блокирует мерж).
