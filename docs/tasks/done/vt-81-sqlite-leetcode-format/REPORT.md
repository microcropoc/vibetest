---
branch: feature/vt-81-sqlite-leetcode-format
---

# Отчёт vt-81 — SQL-шаг в формате LeetCode / HackerRank

## Что сделано

- **Схема `sqliteContent`** (course + import, синхронно; module-import, public-копии и Zod перегенерированы): новые необязательные `checkColumnNames` (boolean), `floatTolerance` (0..1), `checkQuery` (1..5000 символов). В описании: диалект SQLite, порядок кейса (новая БД → setup → reset → seed → SQL → сравнение), сравнение последнего result set, типы ячеек (NULL / число / строка, BLOB как `X'HEX'`), целочисленное деление, список доступных функций, convention для «function»-задач (LeetCode 177): параметры в таблице `params` через `seed`, запрос читает `(SELECT n FROM params)`. Обновлены описания `reset`, `orderMatters`, `timeoutMs`, `tests`. Старые шаги без новых полей валидны.
- **Таблицы результата** — `execution/sqlite-result-table.ts` (бывший `sqlite-result-rows.ts`): `SqliteCell`, `SqliteResultTable`, `SqliteResultPreview` (окно до `SQLITE_RESULT_PREVIEW_ROWS` = 50 строк с `firstRow` + `rowCount`), `SqliteCaseDiff` (+ `mismatchRow`). `compareSqliteResultTables` проверяет по порядку: имена колонок без учёта регистра (только с `checkColumnNames`), число строк, число колонок, строки. Без `orderMatters` строки сравниваются как мультимножество (сортировка; с `floatTolerance` — паросочетание строк в пределах допуска). Числа сравниваются с `floatTolerance`, иначе точно. Тексты: «Column names differ: expected (…), got (…)», «Row count differs: expected N, got M», «Query results do not match (row i)».
- **Функции движка** — `execution/sqlite-functions.ts`, регистрируются на каждой БД кейса. `regexp` для оператора `REGEXP`: JS RegExp, кеш скомпилированных шаблонов, NULL → NULL, битый шаблон → SQL-ошибка «REGEXP: …». Из математических функций в сборке sql.js 1.13 нет `ln`, `log2`, `pow`, `mod`, `trunc`, `ceiling` — добавлены (ошибка домена → NULL, как во встроенных). Остальные (`sqrt`, `power`, `log`, `log10`, `exp`, `floor`, `ceil`, `pi`, …) встроены; всё закреплено тестами.
- **Core** — `execution/sqlite-practice-core.ts`: на каждый кейс две **новые** in-memory БД (user и reference) с `setup`; БД закрываются в `finally`. `runSqliteForLastResult` идёт по statement'ам через `iterateStatements` и берёт последний с колонками; колонки пустого результата — из `getColumnNames`. `checkQuery` выполняется на обеих БД после SQL кейса; сравнивается его результат, собственный результат запроса ученика игнорируется. Ошибки: «Test data SQL failed: …» (reset/seed), «Check query failed: …», «Reference SQL failed: …» (без diff), ошибка SQL ученика → сообщение + diff с ожидаемой таблицей. Время `userMs` / `referenceMs` — только сам запрос.
- **Протокол** — `sqliteInit` несёт новые опции; `sqliteCaseResult` вместо `userRows` / `referenceRows` возвращает `diff?` (`user`, `expected`, `userError`), всё валидируется Zod-схемами в `execution-messages.ts`.
- **Фидбек** — `PracticeRunResult` (failure) получил `details?: { kind: 'sqlite'; diff }`; runner прокидывает его; `practiceFeedbackFromResult` кладёт diff в `PracticeFeedback.sqlDiff`.
- **UI** — dumb-компонент `player/ui/sql-result-diff` (`ng g c`): `input.required<SqliteCaseDiff>()`, блоки «Ваш результат» (таблица или «Ошибка SQL: …») и «Ожидается»; колонка «№», подсветка первой различающейся строки, NULL выделен, sticky-заголовок, горизонтальный скролл, «Показаны строки A–B из N.», «Нет строк», «Запрос не вернул таблицу.». На ширине ≥48rem — две колонки. Встроен в `practice-step-shell` под текстом результата (вне `role="status"`), когда есть `sqlDiff`.
- **Fixtures**: `pass/sqlite-leetcode-format.json` — 7 задач в стиле LeetCode (Second Highest Salary с temp table и NULL, Combine Two Tables, Average Selling Price с `floatTolerance`, Delete Duplicate Emails с `checkQuery`, Patients with a Condition с `REGEXP`, Nth Highest Salary через `params`, Shortest Distance с `SQRT`/`POW`). Для каждой reference проходит, а starter падает. `fail/sqlite-broken-check-query.json`, `fail/sqlite-broken-regexp-reference.json`.
- **sample-courses.spec**: `courseRequiresPracticeSteps` и `assertModuleShape` считают sqlite практикой; проверка «starter падает ≥1 тест» распространяется на sqlite.
- **Документация**: SPECIFICATION.md (подготовка SQLite, порядок кейса, `checkQuery`, ячейки, сравнение, тексты ошибок, функции, `params`, строка в таблице сравнения, раздел «Провал SQL-кейса»). Промпты: `INSTRUCTION_SQLITE_PRACTICE` в `buildCourseGenerationPrompt`, `buildFirstModuleCourseMessages`, `buildModuleMessages` (в план курса не попадает).

## Изменённые файлы

- `docs/schemas/course.schema.json`, `course-import.schema.json`, `module-import.schema.json`; `vibetest-app/public/schemas/*` (копии)
- `vibetest-app/src/app/courses/generated/content-schemas.zod.ts` (сгенерирован)
- `vibetest-app/src/app/execution/sqlite-result-table.ts` (+ spec) — переименован из `sqlite-result-rows.ts`
- `vibetest-app/src/app/execution/sqlite-functions.ts` — новый
- `vibetest-app/src/app/execution/sqlite-practice-core.ts` (+ spec), `sqlite-practice.worker.ts`, `execution-messages.ts` (+ spec)
- `vibetest-app/src/app/player/step-engine/practice-run-result.ts`, `step-engine/index.ts`, `step-engine/sqlite/index.ts`, `sqlite-practice-runner.ts` (+ spec)
- `vibetest-app/src/app/player/practice-step-view.ts` (+ spec)
- `vibetest-app/src/app/player/ui/sql-result-diff/*` — новый
- `vibetest-app/src/app/player/ui/practice-step-shell/practice-step-shell.{ts,html,spec.ts}`
- `vibetest-app/src/app/courses/__fixtures__/practice-check/pass/sqlite-leetcode-format.json`, `fail/sqlite-broken-check-query.json`, `fail/sqlite-broken-regexp-reference.json` — новые
- `vibetest-app/src/app/courses/practice-reference-in-process-runners.spec-helper.ts`, `validate-practice-references.spec.ts`, `sample-courses.spec.ts`
- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts`, `build-staged-generation-messages.ts` (+ spec)
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: зелёный (116 файлов, 715 тестов после правок по ревью). Новые/переписанные:
  - core на реальном sql.js: совпадение, изоляция кейсов (temp/обычные таблицы ученика не утекают в следующий кейс), diff при разном числе строк, ошибка SQL ученика с ожидаемой таблицей, ошибка reference без diff, последний result set, колонки пустого результата, `checkColumnNames`, `floatTolerance`, `checkQuery` (DELETE и сбой проверки), REGEXP и битый шаблон, недостающие и встроенные математические функции, BLOB hex, битые test data, 30 провальных кейсов подряд, битый setup;
  - сравнение и превью таблиц (`sqlite-result-table.spec.ts`);
  - схемы сообщений (новые опции init, diff в результате кейса);
  - runner: опции в init, `details` при провале;
  - `practiceFeedbackFromResult` → `sqlDiff`;
  - `SqlResultDiffComponent` (таблицы, NULL, ошибка SQL, усечение) и видимость diff в `practice-step-shell`;
  - fixtures: все reference в pass проходят, fail-fixtures отклоняются, каждый starter в `sqlite-leetcode-format` падает; старый `sqlite.json` проходит без изменений;
  - промпты: SQL-правила в генерации курса и модуля, не в плане.
- `ng build` (production): успешно; предупреждение о бюджете initial bundle было и раньше (на `main` тот же размер 679.88 kB).

## Отклонения от TASK.md

- **Новая БД на каждый кейс** вместо двух БД на сессию + `reset`. Иначе temp-/обычные таблицы, созданные SQL ученика (типично для LeetCode-решений через `CREATE TEMP TABLE`), ломали следующий кейс («table already exists»). `setup` по-прежнему проверяется один раз при init; `closeSqlitePracticeSession` удалён — сессия не держит БД.
- **`checkQuery` заменяет сравнение результата**, а не дополняет его: для DELETE/UPDATE собственный вывод запроса ученика не сравнивается (у DML его нет, а лишний SELECT в конце не должен валить решение).
- **`REGEXP` регистрозависимый** (семантика JS RegExp), в отличие от MySQL по умолчанию. Задокументировано в схеме и SPEC; для регистронезависимого поиска — `LOWER(x) REGEXP '…'` или классы вида `[Aa]`.
- `seed` maxLength поднят до 20000: LeetCode-тесты с большими таблицами не помещались.
- Ручная проверка UI в браузере не выполнялась (dev-сервер недоступен из песочницы агента); поведение компонента покрыто TestBed-спеками.

## Открытые вопросы к ревью

- `log(x)` в сборке sql.js — натуральный логарифм (как в MySQL), а не log10 (как в PostgreSQL / новом SQLite с одним аргументом). Оставлено как есть и описано в схеме.
- При `orderMatters: false` окно всегда начинается с первой строки: «первой отличающейся строки» у мультимножества нет.

## Изменения по ревью

Ревью (2026-10-07):

- **Утечка WASM-буфера SQL при ошибке на `step()`** → `execution/sqlite-practice-core.ts` (`runSqliteForLastResult`) → `db.iterateStatements` выделяет строку запроса через `malloc`. `StatementIterator` освобождает её только в `next()` (нормальный конец или ошибка prepare); метода `return()` нет, поэтому исключение из тела цикла итератор не закрывает. `statement.step()` бросает на constraint, `RAISE` и на битом `REGEXP` (функция кидает строку внутри step). Буфер остаётся в куче модуля, а модуль sql.js живёт всё время воркера. Ручной `statement.free()` в `finally` повторно финализирует уже закрытый statement (`sqlite3_finalize(NULL)` — no-op) и этот буфер не освобождает; `db.close()` тоже его не видит. Ожидание: в `finally` финализировать итератор на любом выходе. Серия runtime-ошибок в одном модуле (кейс в core-спеке на 30 битых `REGEXP`) не должна растить wasm-heap.

- **`orderMatters: false` вместе с `floatTolerance` — не мультимножество** → `execution/sqlite-result-table.ts` (`compareSqliteResultTables`) → строки сортируются точным сравнением, затем пары сравниваются с допуском. Совпадение «каждая строка ученика имеет пару в эталоне в пределах допуска» при этом может не найтись. Пример: user `(1.0, 'bob'), (2.0, 'ann')`, эталон `(1.5, 'ann'), (1.6, 'bob')`, допуск `0.6` — верная биекция проходит, сортировка по числу сравнивает `bob` с `ann` и даёт fail. Схема и SPEC обещают мультимножество; при `orderMatters: true` попарное сравнение корректно. Ожидание: сопоставление с допуском, а не сортировка по тем же числовым колонкам, к которым допуск применяется.

- **Номер строки в тексте ошибки может быть за пределами превью** → то же сравнение пишет `Query results do not match (row N)` по полной таблице, в diff уходит `previewSqliteResultTable` (первые 50). При N > 50 ученик видит номер строки, которой в таблицах нет. Cap 50 задаче соответствует; окно «первые 50» как продукт тоже нормально. Ожидание: не ссылаться на строку вне превью либо показывать окно вокруг первой различающейся строки.

- **Таблицы внутри live region** → `player/ui/practice-step-shell/practice-step-shell.html` → `app-sql-result-diff` стоит в блоке с `role="status"`. Раньше регион содержал короткое сообщение и счётчик, теперь скринридер зачитывает обе таблицы. Ожидание: `role="status"` только у сообщения и статистики, diff снаружи.

Открытый вопрос про `log(x)`: натуральный логарифм оставляем, в схеме это уже зафиксировано.

### Что исправлено

- **Итератор statement'ов освобождается на любом выходе.** `runSqliteForLastResult` идёт по `iterateStatements` вручную через `next()`; при исключении (`step()`, `RAISE`, битый `REGEXP`) `drainStatementIterator` дочитывает итератор до `done`. Оставшиеся statement'ы только подготавливаются (не выполняются), каждый `next()` освобождает предыдущий, а конец или ошибка prepare освобождает SQL-буфер. Публичного `finalize` у sql.js нет: в production-сборке метод минифицирован. Ручной `statement.free()` убран. Спека: при ошибке в первом из трёх statement'ов итератор доходит до `done: true` (без правки последний вызов `next()` был бы `done: false`).
- **Мультимножество с `floatTolerance`.** При `orderMatters: false` сначала, как и раньше, сравниваются отсортированные строки. Если пары не сошлись и задан допуск, строки группируются по «форме» (NULL и текст должны совпасть точно), и внутри группы ищется полное паросочетание (Кун) по `rowsEqual` с допуском. Без допуска остаётся сортировка: для точного равенства она полна. Спеки: пример из ревью (`(1.0,'bob'),(2.0,'ann')` против `(1.5,'ann'),(1.6,'bob')`, допуск 0.6 проходит, 0.4 нет), две числовые колонки, где сортировка ошибается, и строка без пары.
- **Номер строки всегда в превью.** При упорядоченном сравнении `compareSqliteResultTables` возвращает `mismatchRow`. Если он ≥ 50, окно обеих таблиц начинается за 5 строк до него (`sqlitePreviewFirstRow`). `SqliteResultPreview` получил `firstRow`, `SqliteCaseDiff` — `mismatchRow`; оба поля есть и в Zod-схеме сообщения воркера. В `sql-result-diff` добавлены колонка «№» с настоящими номерами строк и подсветка различающейся строки в обеих таблицах. Подпись: «Показаны строки A–B из K.». Спеки: core (отличие в 70-й строке из 80 → окно с 65-й, `mismatchRow` 69), превью, компонент (нумерация и подсветка в окне).
- **Таблицы вне live region.** В `practice-step-shell` `role="status"` перенесён на внутренний блок с сообщением, счётчиком и временем; `app-sql-result-diff` стоит рядом, внутри той же цветной плашки. Спека проверяет, что diff не входит в `[role="status"]`.
- SPECIFICATION.md: окно превью и подсветка, live region, сопоставление строк при допуске.
- `ng test --watch=false`: 116 файлов, 715 тестов — зелёный; `ng build` — успешно.

Ревью (2026-10-07, раунд 2): замечаний нет. Все четыре пункта закрыты, повторный `ng test --watch=false` — 116 файлов, 715 тестов, зелёный.
