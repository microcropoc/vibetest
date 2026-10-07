# vt-82 — Флагманский курс «SQL на SQLite»

**Приоритет:** P2  
**Зависимости:** vt-80, vt-81  
**Блокирует:** нет (параллельно с vt-83, vt-85)

## Контекст

В `docs/courses/` есть флагман по JavaScript и Blind 75; SQL-практики в bundled-курсах нет. После починки движка и расширения схемы нужен опорный курс, который учит SQLite и одновременно гоняет движок в `sample-courses.spec.ts` (reference pass, starter fail).

## Цель

Встроенный курс **«SQL на SQLite»** (~18–20 модулей): теория, svg, sqlite-практика, quiz — от SELECT до оконных функций и отличий от MySQL/PostgreSQL. Курс собирается `build:courses`, попадает в bundled-courses и README.

## Требования

- Каталог `docs/courses/sqlite-flagship/`: `course.json` + `NN-slug.module.json` по [module-import.schema.json](../../schemas/module-import.schema.json).
- Каждый модуль: theory (первый шаг), svg, ≥1 sqlite, quiz (последний шаг) — как у других флагманов.
- Темы модулей (ориентир):
  - SELECT, WHERE, ORDER BY, LIMIT
  - NULL и трёхзначная логика
  - Строки и даты (`strftime`)
  - Агрегация, GROUP BY, HAVING
  - JOIN (INNER, LEFT, RIGHT, FULL, self)
  - Подзапросы, EXISTS, UNION/INTERSECT/EXCEPT, CASE
  - CTE и рекурсивные CTE
  - Оконные функции
  - DML (INSERT/UPDATE/DELETE, UPSERT, RETURNING)
  - DDL, constraints, types/affinity
  - Индексы, EXPLAIN QUERY PLAN, транзакции
  - JSON-функции SQLite
  - SQLite vs MySQL/PostgreSQL (практика на переносимых паттернах)
- Практики используют возможности vt-81 где уместно (`orderMatters`, `checkColumnNames`, `checkQuery` для DML-модулей).
- `npm run build:courses` → `docs/courses/sqlite-flagship.json`; строка в [docs/courses/README.md](../../courses/README.md).
- `generate:bundled-courses` подхватывает новый slug (обновить список в `sample-courses.spec.ts` / build helpers если slug регистрируется явно).

## Технические заметки

- Только `docs/courses/` и README — без правок `vibetest-app/` на main (bundled JSON генерируется при сборке приложения в задаче merge или отдельной vt с веткой feature).
- Для merge в app: ветка `feature/vt-82-sqlite-flagship-course`, in-progress folder при старте работы.
- Эталон структуры: [javascript-for-csharp/](../../courses/javascript-for-csharp/), [algorithms-blind-75/](../../courses/algorithms-blind-75/).

## План работ

- [ ] `course.json` + intro-модуль
- [ ] Модули 01–N по темам (theory + svg + sqlite + quiz)
- [ ] `npm run build:courses`, закоммитить собранный `sqlite-flagship.json`
- [ ] README + проверка `sample-courses.spec.ts` (reference/starter для sqlite)
- [ ] При необходимости — увеличить timeout теста курса

## Критерии готовности (Definition of Done)

- [ ] Assembled JSON на диске совпадает с in-memory build
- [ ] `validatePracticeReferences` — 0 issues для курса
- [ ] Starter code падает ≥1 тест на каждом sqlite-шаге
- [ ] `ng test --watch=false` зелёный
- [ ] Курс появляется после установки/обновления PWA (bundled sync)

## Вне рамок задачи

- Задачи LeetCode/HackerRank — vt-83, vt-85
- Изменения движка — vt-80, vt-81
