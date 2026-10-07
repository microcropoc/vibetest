---
branch: feature/vt-82-sqlite-flagship-course
---

# Отчёт vt-82 — Флагманский курс «SQL на SQLite»

## Что сделано

- Новый встроенный курс **«SQL на SQLite»** в `docs/courses/sqlite-flagship/`: `course.json` + 20 модулей `NN-slug.module.json`.
- Модули: знакомство и SELECT; WHERE/ORDER BY/LIMIT; NULL и трёхзначная логика; строки; даты и время (`strftime`, `date` с модификаторами); агрегатные функции; GROUP BY/HAVING; JOIN INNER/LEFT; JOIN RIGHT/FULL/self/anti-join; подзапросы и EXISTS; множества (UNION/INTERSECT/EXCEPT) и CASE; CTE; рекурсивные CTE; оконные функции — ранжирование; оконные функции — смещения и рамки; DML (INSERT/UPDATE/DELETE, UPSERT, RETURNING, UPDATE FROM); DDL, ограничения, типы/affinity, STRICT; индексы, EXPLAIN QUERY PLAN, транзакции; JSON (`->`/`->>`, `json_each`, `json_group_array`); SQLite vs MySQL/PostgreSQL.
- Состав: 26 theory, 20 svg, 61 sqlite, 40 quiz. Каждый модуль: theory первым шагом, svg, 2–4 sqlite-задачи, два quiz, quiz последним шагом.
- Задачи в формате LeetCode (vt-81): 17 с `orderMatters: true`, 34 с `checkColumnNames: true`, 11 с `floatTolerance`, 9 DML/DDL-задач проверяются через `checkQuery` (результат — состояние таблиц после запроса ученика). 58 из 61 задачи имеют несколько тест-кейсов с разными seed (граничные случаи: пустые таблицы, NULL, дубликаты).
- SVG-схемы с `viewBox`, `role="img"`, `aria-label`; id элементов с префиксом `sqNN-`, поэтому они уникальны в пределах курса.
- Собран `docs/courses/sqlite-flagship.json` (`npm run build:courses`), обновлён манифест встроенных курсов (`npm run generate:bundled-courses`, 6 курсов), добавлены строка и ссылка на каталог в `docs/courses/README.md`.

## Изменённые файлы

- `docs/courses/sqlite-flagship/course.json`, `docs/courses/sqlite-flagship/01…20-*.module.json` — исходники курса
- `docs/courses/sqlite-flagship.json` — собранный курс
- `docs/courses/README.md` — строка в таблице и ссылка на исходники
- `vibetest-app/src/app/courses/bundled/generated-bundled-courses.ts` — манифест встроенных курсов (сгенерирован)
- `docs/tasks/in-progress/vt-82-sqlite-flagship-course/` — TASK.md (перенос из backlog), REPORT.md

## Тесты

- `ng test --watch=false`: зелёный — 116 файлов, 720 тестов. Новый курс автоматически проходит проверки `sample-courses.spec.ts` (slug находит `listCourseSourceSlugs`): собранный JSON совпадает со сборкой в памяти, курс парсится схемой, `validatePracticeReferences` — 0 issues, каждый sqlite-стартер падает хотя бы на одном тесте, форма модулей, SVG-инварианты, уникальные id; `build-bundled-courses.spec.ts` — закоммиченный манифест совпадает со сборкой.

## Отклонения от TASK.md

- Отдельного intro-модуля нет: знакомство с SQLite (что такое SQLite, как устроены задачи и проверка) — первая theory модуля 01 вместе с SELECT.
- Регистрировать slug явно не понадобилось: `build:courses`, `generate:bundled-courses` и `sample-courses.spec.ts` находят курсы по каталогам. Таймаут теста reference-проверки (120 с) не меняли — запас достаточный.
- Задача требовала правок только в `docs/`, но манифест `generated-bundled-courses.ts` закоммичен в репозитории и проверяется тестом, поэтому он обновлён на feature-ветке.
- Пункт DoD «курс появляется после установки/обновления PWA» подтверждён только автоматически: `generate:bundled-courses` кладёт `sqlite-flagship.json` в `public/bundled-courses/`, манифест (6 курсов) совпадает со сборкой (`build-bundled-courses.spec.ts`). Ручная проверка синхронизации в браузере не делалась: dev-сервер запускался, но окружение агента запрещает подключение к нему. Проверить вручную: `npm start` → список курсов → «SQL на SQLite» (или «Настройки» → «Добавить недостающие курсы»).

## Открытые вопросы к ревью

- Проверка задач опирается на поведение sql.js (SQLite 3.49.1): RIGHT/FULL JOIN, STRICT, `->`/`->>`, `concat`, `string_agg`. В теории у таких возможностей указана минимальная версия (3.35+, 3.39+, 3.44+ и т. п.).
- Внешние ключи в SQLite по умолчанию выключены. В задаче модуля 17 на `ON DELETE CASCADE` ученик должен сам выполнить `PRAGMA foreign_keys = ON` (стартер без него падает) — это осознанная ловушка, о ней предупреждают теория и quiz.

## Изменения по ревью

Ревью (2026-10-07):

Прочитаны все 20 модулей: теория, quiz, условия, эталоны, стартеры и seed. Ошибок в фактах по SQLite, MySQL и PostgreSQL и в ответах quiz не найдено. `ng test --watch=false` — 116 файлов, 720 тестов, зелёный. Замечания — только к двум задачам модуля 18, где проверка расходится с условием (проверено на sql.js из проекта).

- **«Индекс по выражению» засчитывает любой индекс по выражению** → `docs/courses/sqlite-flagship/18-indexes-transactions.module.json`, задача «Практика: индекс по выражению» → `checkQuery` сравнивает только `unique`, `cid`, `name` из `pragma_index_info`. У любого индекса по выражению это `[0, -2, NULL]`, поэтому `ON users(upper(email))` и `ON users(length(email))` проходят. При этом `EXPLAIN QUERY PLAN` для запроса из условия (`WHERE lower(email) = lower(?)`) с такими индексами показывает `SCAN users`, то есть индекс не используется. Задача учит именно тому, что индекс должен совпадать с выражением в `WHERE`, а проверка этого не различает. Ожидание: проверять само выражение. Например, `sqlite_master.sql` без имени индекса, нормализованный по регистру и пробелам. Или зафиксировать имя индекса в условии и сравнивать план запроса.

- **«Составной индекс» отклоняет покрывающий индекс, хотя теория прямо выше его хвалит** → тот же файл, «Практика: составной индекс» → условие просит индекс, который «лучше всего обслуживает» `SELECT * … WHERE customer_id = ? AND ordered_at >= ? ORDER BY ordered_at`. Эталон — `(customer_id, ordered_at)`, `checkQuery` требует ровно этот список столбцов. Индекс `(customer_id, ordered_at, amount)` для этого запроса покрывающий: план — `SEARCH orders USING COVERING INDEX … (customer_id=? AND ordered_at>?)`, таблица не читается. По теории модуля («Покрывающий индекс … таблицу можно не читать») это не хуже эталона, но проверка его отклоняет. Ученик, применивший теорию, получит провал без объяснения. Ожидание: сузить условие (например, «индекс только по столбцам из `WHERE`, без лишних») либо принимать в проверке и вариант с покрывающим индексом.

Не блокирует: пункт DoD «курс появляется после установки/обновления PWA» в отчёте не подтверждён. Манифест бандла обновлён, и тест сверяет его со сборкой, но ручной проверки синхронизации в браузере нет. Если она не делалась, это стоит указать в «Отклонениях».

Исправлено:

- **Индекс по выражению** — `checkQuery` теперь сравнивает флаг `unique` и определение индекса из `sqlite_master` без имени: текст после `ON`, без учёта регистра, пробелов, переводов строк и двойных кавычек (эталон — `users(lower(email))`). В условии сказано, что проверяется определение и почему выражение должно совпадать с `WHERE`. Проверено на sql.js: `ON users(lower(email))`, `on Users ( LOWER( email ) )`, `ON "users"(lower("email"))` с переносом строки проходят; `email`, `upper(email)`, `length(email)`, `UNIQUE … lower(email)` и два индекса — падают.
- **Составной индекс** — `checkQuery` сравнивает только ведущие столбцы (`seqno < 2`), поэтому покрывающий `(customer_id, ordered_at, amount)` и вариант с `id` в хвосте принимаются. В условии сказано, что лишние столбцы в конце допустимы. Проверено: `(ordered_at)`, `(customer_id)`, `(ordered_at, customer_id)`, `(customer_id, amount, ordered_at)` и второй индекс рядом — падают.
- Ручная проверка PWA не выполнена (окружение блокирует подключение к dev-серверу) — указано в «Отклонениях от TASK.md».
- Пересобраны `18-indexes-transactions.module.json`, `sqlite-flagship.json` и манифест встроенных курсов (сменился хеш курса). `ng test --watch=false` — 116 файлов, 720 тестов, зелёный.

Ревью (2026-10-07, раунд 2): замечаний нет. Обе проверки модуля 18 соответствуют условиям; отсутствие ручной проверки PWA указано в «Отклонениях». Повторный `ng test --watch=false` — 116 файлов, 720 тестов, зелёный.
