# vt-83 — Курс «LeetCode SQL», часть 1 (SQL 50)

**Приоритет:** P2  
**Зависимости:** vt-80, vt-81  
**Блокирует:** vt-84

## Контекст

Пользователь выбрал полное покрытие бесплатных SQL-задач LeetCode; первая итерация — учебный план **SQL 50** (50 задач, 7 тематических блоков), как у NeetCode/LeetCode Study Plan. Структура курса — по аналогии с [algorithms-blind-75](../../courses/algorithms-blind-75/).

## Цель

Bundled-курс **«LeetCode SQL»** (первая часть): intro + 7 модулей по SQL 50; каждая задача — sqlite-шаг с русским условием, ссылкой на LeetCode, эталоном и несколькими seed-тестами.

## Требования

- Каталог `docs/courses/leetcode-sql/`: `course.json`, `00-intro.module.json`, модули по блокам SQL 50 (Select/Data Manipulation/… — как на LeetCode).
- На задачу:
  - `description`: формулировка на русском + ссылка на задачу LeetCode
  - `setup`: DDL (адаптация схемы под SQLite)
  - `tests[].seed`: пример из условия + edge cases (пустая таблица, NULL, ничьи, дубликаты) — 3–5 кейсов
  - `checkColumnNames: true` где LeetCode сравнивает имена колонок
  - `checkQuery` для DML-задач (196, 627, …)
  - `orderMatters` по правилам задачи
- Intro-модуль: dialect notes — `strftime` vs `DATE_FORMAT`, `julianday` vs `DATEDIFF`, отсутствие некоторых MySQL-функций.
- Сборка: `leetcode-sql.json`, README, bundled-courses.
- Все reference solutions проходят self-check; starter — падает.

## Технические заметки

- ~50 sqlite-шагов в первой части; большой JSON — коммитить собранный файл после `build:courses`.
- Таймаут `sample-courses.spec.ts` при необходимости >120s для этого slug.

## План работ

- [ ] course.json + 00-intro
- [ ] 7 модулей SQL 50 (список задач зафиксировать в REPORT при in-progress)
- [ ] Адаптация эталонов под SQLite + vt-81 опции
- [ ] build:courses, README, green tests

## Критерии готовности (Definition of Done)

- [ ] 50 задач SQL 50 покрыты sqlite-шагами
- [ ] `ng test --watch=false` зелёный, reference/starter invariant
- [ ] Assembled JSON совпадает с build
- [ ] Документирован список slug/номеров LeetCode в REPORT

## Вне рамок задачи

- Оставшиеся free SQL задачи LeetCode — vt-84
- Флагман SQLite — vt-82
- HackerRank — vt-85
