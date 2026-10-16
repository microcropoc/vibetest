# vt-85 — Курс «HackerRank SQL»

**Приоритет:** P2  
**Зависимости:** vt-80, vt-81  
**Блокирует:** нет (параллельно с vt-82, vt-83)

## Контекст

HackerRank SQL Domain — ~58 задач в шести разделах (Basic Select, Advanced Select, Aggregation, Basic Join, Advanced Join, Alternative Queries). Пользователь выбрал полный раздел. Задачи часто требуют `orderMatters`, форматированный вывод (The PADS, треугольники, простые числа) и REGEXP (Weather Observation).

## Цель

Bundled-курс **«HackerRank SQL»**: intro + 6 модулей по разделам HackerRank; все ~58 задач как sqlite-шаги с эталонами под SQLite (vt-81).

## Требования

- Каталог `docs/courses/hackerrank-sql/`: `course.json`, `00-intro.module.json`, модули:
  - Basic Select
  - Advanced Select
  - Aggregation
  - Basic Join
  - Advanced Join
  - Alternative Queries
- На задачу: русское условие + ссылка на HackerRank; setup/seed; `orderMatters: true` где вывод — отформатированные строки или фиксированный порядок.
- Задачи с «рисованием» (Draw The Triangle, Print Prime Numbers): решение через рекурсивные CTE / генерацию строк; проверка построчно.
- REGEXP-задачи — опираются на `regexp()` из vt-81.
- Intro: отличия HackerRank (MySQL-ориентация) от SQLite в курсе.
- `hackerrank-sql.json`, README, bundled-courses, sample-courses invariants.

## Технические заметки

- Эталон структуры модулей: [algorithms-blind-75](../../courses/algorithms-blind-75/) (theory/svg опционально для intro; практика — sqlite; quiz в конце модуля по желанию, минимум intro с quiz как у blind-75).
- ~58 шагов — один большой assembled JSON.

## План работ

- [ ] course.json + intro (dialect HackerRank → SQLite)
- [ ] 6 модулей, чеклист задач по разделам HackerRank
- [ ] Особые форматные задачи (PADS, triangles, primes)
- [ ] build:courses, README, tests

## Критерии готовности (Definition of Done)

- [ ] ~58 задач раздела SQL Domain покрыты
- [ ] Reference pass / starter fail для каждого sqlite-шага
- [ ] `ng test --watch=false` зелёный
- [ ] Assembled JSON совпадает с build

## Вне рамок задачи

- LeetCode SQL — vt-83, vt-84
- Флагман SQLite — vt-82
- Движок и схема — vt-80, vt-81
