---
branch: feature/vt-84-leetcode-sql-free-rest
---

# Отчёт vt-84 — Курс «LeetCode SQL», часть 2 (остальные бесплатные задачи)

## Что сделано

- Курс `leetcode-sql` расширен с 50 до **105 задач**: SQL 50 (модули `01`–`07`, vt-83) + **55 остальных бесплатных SQL/Database-задач LeetCode**, сгруппированных по темам в новые модули `08`–`12`.
- Новые модули (файлы в `docs/courses/leetcode-sql/`):
  - `08-joins-and-dml.module.json` — Additional Joins and DML, 8 задач: 175, 181, 183, 607, 627, 1407, 1158, 3570
  - `09-aggregation-and-pivoting.module.json` — Aggregation and Pivoting, 12 задач: 182, 511, 586, 1050, 1084, 1179, 1587, 1693, 1741, 1890, 1393, 3220
  - `10-subqueries-set-and-trees.module.json` — Subqueries, Sets and Trees, 9 задач: 1873, 1795, 1965, 184, 608, 3497, 3521, 3554, 3764
  - `11-window-functions-and-cte.module.json` — Window Functions and CTE, 9 задач: 177, 178, 262, 601, 3421, 3482, 3564, 3580, 3601
  - `12-strings-regex-analytics.module.json` — Strings, Regex and Behavioral Analytics, 17 задач: 3436, 3465, 3475, 3374, 3451, 3586, 3611, 3617, 3626, 3642, 3657, 3673, 3705, 3716, 3793, 3808, 3832
- Новый источник данных генератора: `vibetest-app/tools/leetcode-sql-free-rest-modules-data.mts` (описания, setup, starter/reference, флаги проверки и seed-тесты модулей `08`–`12`, экспорт `FREE_REST_MODULE_DEFS`).
- `generate-leetcode-sql-course.mts`: подписи slug'ов для всех новых задач + сборка модулей `08`–`12`; генератор строго проверяет **3–5 seed-тестов** на задачу (`mergeProblemTests`).
- Обновлены `docs/courses/leetcode-sql/course.json` (описание: 105 задач, 12 тематических блоков), `00-intro.module.json` (диалект SQLite, модули `08`–`12`) и `docs/courses/README.md`.
- Каждая задача: русское условие, номер и ссылка на LeetCode, `setup`/seed, `starterCode` (обязан падать хотя бы на одном тесте) и `referenceSolution` (обязан проходить все), флаги `orderMatters` / `checkColumnNames` / `floatTolerance` / `checkQuery` по смыслу задачи, всё адаптировано под **SQLite 3 / sql.js**.
- Исправлены два номера LeetCode внутри SQL 50 (модули `05`/`06`): Triangle Judgement `177` → **`610`**, Employees Whose Manager Left the Company `1773` → **`1978`** (в `leetcode-sql-50-modules-data.mts` и `leetcode-sql-50-extra-seeds.mts`).
- Пересобраны `docs/courses/leetcode-sql.json` (13 модулей: intro + 12), `public/bundled-courses/` и `generated-bundled-courses.ts`.

## Инвентаризация бесплатных SQL-задач LeetCode (вне SQL 50)

Инвентаризация — по официальному списку [Free SQL questions](https://leetcode.com/problem-list/m8baczxh/) (сверено с [doocs/leetcode DATABASE_README](https://github.com/doocs/leetcode/blob/main/solution/DATABASE_README_EN.md)); Premium-only (🔒) исключены.

| # | LeetCode | Модуль |
|---|----------|--------|
| 1 | 175. Combine Two Tables | 08 |
| 2 | 181. Employees Earning More Than Their Managers | 08 |
| 3 | 183. Customers Who Never Order | 08 |
| 4 | 607. Sales Person | 08 |
| 5 | 627. Swap Salary | 08 |
| 6 | 1407. Top Travellers | 08 |
| 7 | 1158. Market Analysis I | 08 |
| 8 | 3570. Find Books with No Available Copies | 08 |
| 9 | 182. Duplicate Emails | 09 |
| 10 | 511. Game Play Analysis I | 09 |
| 11 | 586. Customer Placing the Largest Number of Orders | 09 |
| 12 | 1050. Actors and Directors Who Cooperated At Least Three Times | 09 |
| 13 | 1084. Sales Analysis III | 09 |
| 14 | 1179. Reformat Department Table | 09 |
| 15 | 1587. Bank Account Summary II | 09 |
| 16 | 1693. Daily Leads and Partners | 09 |
| 17 | 1741. Find Total Time Spent by Each Employee | 09 |
| 18 | 1890. The Latest Login in 2020 | 09 |
| 19 | 1393. Capital Gain/Loss | 09 |
| 20 | 3220. Odd and Even Transactions | 09 |
| 21 | 1873. Calculate Special Bonus | 10 |
| 22 | 1795. Rearrange Products Table | 10 |
| 23 | 1965. Employees With Missing Information | 10 |
| 24 | 184. Department Highest Salary | 10 |
| 25 | 608. Tree Node | 10 |
| 26 | 3497. Analyze Subscription Conversion | 10 |
| 27 | 3521. Find Product Recommendation Pairs | 10 |
| 28 | 3554. Find Category Recommendation Pairs | 10 |
| 29 | 3764. Most Common Course Pairs | 10 |
| 30 | 177. Nth Highest Salary | 11 |
| 31 | 178. Rank Scores | 11 |
| 32 | 262. Trips and Users | 11 |
| 33 | 601. Human Traffic of Stadium | 11 |
| 34 | 3421. Find Students Who Improved | 11 |
| 35 | 3482. Analyze Organization Hierarchy | 11 |
| 36 | 3564. Seasonal Sales Analysis | 11 |
| 37 | 3580. Find Consistently Improving Employees | 11 |
| 38 | 3601. Find Drivers with Improved Fuel Efficiency | 11 |
| 39 | 3436. Find Valid Emails | 12 |
| 40 | 3465. Find Products with Valid Serial Numbers | 12 |
| 41 | 3475. DNA Pattern Recognition | 12 |
| 42 | 3374. First Letter Capitalization II | 12 |
| 43 | 3451. Find Invalid IP Addresses | 12 |
| 44 | 3586. Find COVID Recovery Patients | 12 |
| 45 | 3611. Find Overbooked Employees | 12 |
| 46 | 3617. Find Students with Study Spiral Pattern | 12 |
| 47 | 3626. Find Stores with Inventory Imbalance | 12 |
| 48 | 3642. Find Books with Polarized Opinions | 12 |
| 49 | 3657. Find Loyal Customers | 12 |
| 50 | 3673. Find Zombie Sessions | 12 |
| 51 | 3705. Find Golden Hour Customers | 12 |
| 52 | 3716. Find Churn Risk Customers | 12 |
| 53 | 3793. Find Users with High Token Usage | 12 |
| 54 | 3808. Find Emotionally Consistent Users | 12 |
| 55 | 3832. Find Users with Persistent Behavior Patterns | 12 |

Итого: **55 новых задач** (50 из SQL 50 не дублируются); 105 задач в курсе, включая разминочный `SELECT 1` в intro — 106 sqlite-шагов.

## Изменённые файлы

Новые:
- `vibetest-app/tools/leetcode-sql-free-rest-modules-data.mts`
- `docs/courses/leetcode-sql/08-joins-and-dml.module.json`
- `docs/courses/leetcode-sql/09-aggregation-and-pivoting.module.json`
- `docs/courses/leetcode-sql/10-subqueries-set-and-trees.module.json`
- `docs/courses/leetcode-sql/11-window-functions-and-cte.module.json`
- `docs/courses/leetcode-sql/12-strings-regex-analytics.module.json`

Изменённые:
- `vibetest-app/tools/generate-leetcode-sql-course.mts` — slug-таблица и подключение модулей `08`–`12`
- `vibetest-app/tools/leetcode-sql-50-modules-data.mts` — номера 610 / 1978
- `vibetest-app/tools/leetcode-sql-50-extra-seeds.mts` — ключи seed'ов и `FORCE_CHECK_COLUMN_NAMES` для 610 / 1978
- `docs/courses/leetcode-sql.json`, `docs/courses/leetcode-sql/course.json`, `docs/courses/leetcode-sql/00-intro.module.json`, `docs/courses/leetcode-sql/05-advanced-select-joins.module.json`, `docs/courses/leetcode-sql/06-subqueries.module.json`
- `docs/courses/README.md`
- `vibetest-app/src/app/courses/bundled/generated-bundled-courses.ts`

## Тесты

- `ng test --watch=false`: **760 passed** (125 файлов), 0 падений.
- Дополнительно прогонялся временный аудит-спек, который для всех 106 sqlite-шагов курса проверял: reference проходит все seed-тесты, starter падает хотя бы на одном. Итог — 0 проблем (спек удалён после проверки).
- `sample-courses.spec.ts` (`reference solutions pass` / `starter code fails at least one test`) проходит без увеличения таймаута: 120 000 мс хватает с большим запасом (полный прогон sample-courses ≈ 9 с).
- Сборка: `npm run generate:leetcode-sql-course` → `npm run build:courses` → `npm run generate:bundled-courses` — зелёные.

Распределение числа seed-тестов на задачу (требование генератора: 3–5): 3 теста — 86 задач, 4 теста — 19 задач (включая 3705 после доработки), 2 теста — только intro-разминка.

## Отклонения от TASK.md

- Дополнительно исправлены два неверных номера LeetCode в существующих модулях SQL 50 (610, 1978) — иначе ссылки «на оригинал» в модулях `05`/`06` вели не на ту задачу.
- Таймаут в `sample-courses.spec.ts` увеличивать не потребовалось (пункт требований был «при росте времени прогона»).
- Группировка выбрана по темам (JOIN/DML, агрегации и pivot, подзапросы/множества/деревья, окна и CTE, строки+regex+аналитика) и зафиксирована в intro-модуле и README.

## Открытые вопросы к ревью

- Модуль `12` получился крупным (17 задач) из-за большого числа заданий LeetCode с regex/аналитикой; при желании его можно разбить на два модуля (`strings/regex` и `behavioral analytics`).
- Часть задач (3497, 3521, 3554, 3764, 3421, 3564, 3580, 3601, 3611 …) — редакционные задачи LeetCode без публичных решений в свободном доступе; формулировка условий и ожидаемые результаты восстановлены по описаниям. Условия переведены и адаптированы под SQLite, формулировки могут отличаться от оригинала в деталях.

## Изменения по ревью

Ревью (2026-10-16), ветка `feature/vt-84-leetcode-sql-free-rest` (коммит `8fd4ad2` + незакоммиченный дифф):

- **Эталон 3482 (`Analyze Organization Hierarchy`) считает только прямых подчинённых вместо всего поддерева** → `vibetest-app/tools/leetcode-sql-free-rest-modules-data.mts` (и сгенерированные `docs/courses/leetcode-sql/11-window-functions-and-cte.module.json`, `docs/courses/leetcode-sql.json`, `generated-bundled-courses.ts`) → в условии и на LeetCode 3482 `team_size` включает всех прямых и косвенных подчинённых, а `budget` — свой оклад + оклады всех подчинённых. В `referenceSolution` CTE `team` группирует `lvl` по непосредственному `manager_id` (`SELECT manager_id AS employee_id, COUNT(*) AS team_size, SUM(salary) AS budget FROM lvl WHERE manager_id IS NOT NULL GROUP BY manager_id`). На первом же seed-тесте (дерево глубины 3: `1 → 2 → 4 → 8`, `1 → 3 → 6 → 9, 10`) для Alice (`1`) эталон возвращает `team_size = 2, budget = 32000` вместо `team_size = 9, budget = 84500`, из-за чего корректное решение ученика упадёт. Ожидание: считать размер команды и сумму окладов по всему поддереву (например, рекурсивным CTE пар `(ancestor_id, descendant_id, salary)`) и перегенерировать курс.
- **Незакоммиченная правка вне скоупа задачи** → `vibetest-app/src/app/player/pages/player-page/player-page.html` → перестановка `(back)` / `(next)` в шаблоне плеера не относится к `vt-84`; откатить файл.

### Исправлено (2026-10-16)

- **3482** → эталон переписан на рекурсивный CTE пар `(ancestor_id, descendant_id, salary)`:
  `pairs` строится от каждого сотрудника вниз по `manager_id`, `up` даёт `level = COUNT(*)` (число предков, включая себя), `down` — `team_size = COUNT(*) - 1` и `budget = SUM(salary)` по всему поддереву. На seed-тесте 1 значения совпали с ожиданиями ревью: Alice — `level 1, team_size 9, budget 84500`; Bob — `3 / 31000`; Charlie — `4 / 41500`.
  Проверено временным спеком (удалён после прогона): прежнее решение «только прямые подчинённые» теперь **падает** на seed-тестах, а независимое корректное решение (отдельные рекурсивные CTE `descendants` + `levels` с тем же ответом) **проходит** все 3 seed-теста. Условие задачи и starter-код не менялись — starter по-прежнему различается.
  Перегенерированы `docs/courses/leetcode-sql/11-window-functions-and-cte.module.json`, `docs/courses/leetcode-sql.json`, `generated-bundled-courses.ts` (`npm run generate:leetcode-sql-course`, `build:courses`, `generate:bundled-courses`).
- **player-page.html** → `git checkout --` вернул файл к состоянию `main`; посторонних правок вне скоупа в рабочем дереве не осталось.

`ng test --watch=false` после правок: **760 passed** / 125 файлов, 0 падений.

### Ревью (2026-10-16, раунд 2)

В коммите `569c782` оба замечания раунда 1 (`3482` и `player-page.html`) были исправлены корректно, однако следующий коммит `a2573c3` (`vt-84: Finalize round 2 audit and course generation`) сломал генератор и удалил отчёт:

- **Повреждены файлы генератора и удалён `REPORT.md` в коммите `a2573c3`** → `vibetest-app/tools/leetcode-sql-free-rest-modules-data.mts`, `vibetest-app/tools/generate-leetcode-sql-course.mts`, `docs/tasks/in-progress/vt-84-leetcode-sql-free-rest/REPORT.md` → в `leetcode-sql-free-rest-modules-data.mts` осталось 11 строк оборванного литерала (без объявлений и экспорта `FREE_REST_MODULE_DEFS`), в `generate-leetcode-sql-course.mts` попали префиксы номеров строк (`10|`, `20|`, …) и склеились строки 220–272 (`npm run generate:leetcode-sql-course` не запустится), а `REPORT.md` был удалён в `a2573c3` (восстановлен при ревью для записи замечаний). Ожидание: откатить изменения `a2573c3` до состояния `569c782` (с сохранением обновлённого `REPORT.md`).

### Исправлено (2026-10-16, раунд 2)

- **Генератор** → `git checkout 569c782 -- vibetest-app/tools/leetcode-sql-free-rest-modules-data.mts vibetest-app/tools/generate-leetcode-sql-course.mts` восстановил полные исходники (включая исправленный эталон **3482** из раунда 1).
- **Цепочка сборки** → `npm run generate:leetcode-sql-course`, `build:courses`, `generate:bundled-courses` выполняются без ошибок; сгенерированные `docs/courses/leetcode-sql.json`, модуль `11-window-functions-and-cte.module.json` и `generated-bundled-courses.ts` совпадают с коммитом `569c782` (дифф пустой).
- **`REPORT.md`** → файл сохранён в `docs/tasks/in-progress/vt-84-leetcode-sql-free-rest/` с секциями ревью и этой записью об исправлении (не удаляется при следующем коммите).

`ng test --watch=false` после правок раунда 2: **760 passed** / 125 файлов, 0 падений.

### Ревью (2026-10-16, раунд 3)

Проверено: `vibetest-app/tools/leetcode-sql-free-rest-modules-data.mts` и `vibetest-app/tools/generate-leetcode-sql-course.mts` восстановлены до состояния `569c782` (в индексе), сгенерированные `docs/courses/` и `generated-bundled-courses.ts` совпадают с `569c782`, `REPORT.md` на месте.

Замечаний нет.
