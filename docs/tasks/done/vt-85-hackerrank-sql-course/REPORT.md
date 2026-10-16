---
branch: feature/vt-85-hackerrank-sql-course
merged: "0177197"
---

# Отчёт vt-85 — Курс «HackerRank SQL»

## Что сделано

- Bundled-курс **HackerRank SQL**: `docs/courses/hackerrank-sql/` (intro + 6 модулей), собранный `hackerrank-sql.json` (7 модулей, 59 sqlite-шагов = разминка intro + 58 задач HackerRank).
- Генератор `generate-hackerrank-sql-course.mts` и данные `hackerrank-sql-modules-data.mts` (русские условия, DDL/setup, 3–4 seed-теста на задачу, эталоны и starter-код под SQLite 3).
- Скрипт `npm run generate:hackerrank-sql-course`, обновлён `generated-bundled-courses.ts` и `public/bundled-courses/hackerrank-sql.json` (генерируется локально, в git — manifest).
- `docs/courses/README.md` — курс в таблице, каталог исходников и команды генерации.
- Правки по ревью (2026-10-16): эталоны/условия PADS, primes, Report, Ollivander, column names, intro CEIL.

## Изменённые файлы

- `docs/courses/hackerrank-sql/` — `course.json`, `00-intro.module.json`, `01`–`06` module JSON
- `docs/courses/hackerrank-sql.json`
- `docs/courses/README.md`
- `vibetest-app/tools/hackerrank-sql-modules-data.mts`
- `vibetest-app/tools/generate-hackerrank-sql-course.mts`
- `vibetest-app/package.json` — `generate:hackerrank-sql-course`
- `vibetest-app/src/app/courses/bundled/generated-bundled-courses.ts`
- `.cursor/commands/task-implement.md`, `.cursor/commands/task-review.md` — см. отклонения
- `docs/tasks/in-progress/vt-85-hackerrank-sql-course/` — TASK.md, REPORT.md (из backlog)

## Тесты

- `ng test --watch=false`: **765 passed** (125 files), в т.ч. `sample-courses.spec.ts` и `build-bundled-courses.spec.ts` для `hackerrank-sql.json` (после правок по ревью).

## Отклонения от TASK.md

- В коммите `e027e17` и на ветке также изменены `.cursor/commands/task-implement.md` и `task-review.md` — **намеренно** по отдельной просьбе пользователя в рамках той же сессии (обязательный локальный коммит после `/task-implement`, уточнение диффа для `/task-review`); в TASK vt-85 не входят, зафиксировано здесь.

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-10-16), ветка `feature/vt-85-hackerrank-sql-course` (коммит `e027e17`) — замечания и статус:

| # | Замечание | Статус |
|---|-----------|--------|
| 1 | `the-pads` — неверное левое дополнение в `referenceSolution` | **Исправлено:** `SUBSTR('----------', 1, LENGTH(Name) - 1) \|\| Name \|\| …` |
| 2 | `print-prime-numbers` — базовый шаг CTE при `N = 2` | **Исправлено:** `SELECT 2 WHERE 2 < (SELECT n FROM params)` |
| 3 | `the-report` — шкала `Grade` не в условии | **Исправлено:** пороги 90→1 … `<10→10` в `description` |
| 4 | `ollivanders-inventory` — описание и порядок строк | **Исправлено:** схема/группировка в `description`, `ORDER BY …, coins` |
| 5 | `checkColumnNames` / имена колонок (Station 12, new-companies, binary-tree) | **Исправлено:** снят `checkColumnNames` у Station 12; имена колонок в `description` (+ starter для new-companies) |
| 6 | Intro — подсказка `CEIL(x)` | **Исправлено:** `CEIL` / `CEILING` в таблице intro |
| 7 | `.cursor/commands/*` вне TASK | **Закрыто:** отражено в «Отклонения от TASK.md», файлы не откатывались |

Перегенерация: `generate:hackerrank-sql-course`, `build:courses`, `generate:bundled-courses`.

Ревью (2026-10-16, раунд 2), коммит `425f961`:

- Замечаний нет. Все пункты раунда 1 исправлены, курс и манифест перегенерированы, тесты (`sample-courses.spec.ts`, `build-bundled-courses.spec.ts`) проходят.
