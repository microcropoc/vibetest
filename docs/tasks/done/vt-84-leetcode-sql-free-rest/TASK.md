# vt-84 — Курс «LeetCode SQL», часть 2 (остальные бесплатные задачи)

**Приоритет:** P3  
**Зависимости:** vt-83  
**Блокирует:** нет

## Контекст

После SQL 50 (vt-83) в том же курсе `leetcode-sql` нужно добавить **все оставшиеся бесплатные** SQL-задачи LeetCode (~100+), сгруппированные по темам/сложности. Объём большой — допустимы несколько WIP-коммитов на feature-ветке.

## Цель

Единый bundled-курс `leetcode-sql.json` покрывает **полный набор бесплатных** SQL-задач LeetCode; тесты reference/starter остаются зелёными.

## Требования

- Дополнительные модули в `docs/courses/leetcode-sql/` (не дублировать задачи из SQL 50).
- Группировка: по типу (JOIN, Window, Subquery, …) или по difficulty — зафиксировать в intro/README при добавлении.
- Те же конвенции, что vt-83: русское условие, ссылка, setup/seed, vt-81 flags.
- Платные (Premium-only) задачи **не** включать.
- При росте времени прогона — увеличить timeout в `sample-courses.spec.ts` для `leetcode-sql.json` или вынести тяжёлый курс в отдельный describe с большим лимитом.
- Пересборка `leetcode-sql.json`, обновление README (полное число задач).

## Технические заметки

- Инвентаризация free SQL на LeetCode — в начале задачи (список в REPORT.md).
- Возможен split: несколько merge только docs, один merge app если менялись только courses (правило protected app — feature branch vt-84).

## План работ

- [x] Список free SQL задач минус SQL 50
- [x] Модули + sqlite-шаги пакетами (например по 20 задач)
- [x] Self-check после каждого пакета
- [x] Финальный build:courses, README, тесты

## Критерии готовности (Definition of Done)

- [x] Нет пропущенных free задач из утверждённого списка
- [x] `ng test --watch=false` зелёный
- [x] README отражает полный охват

## Вне рамок задачи

- Premium LeetCode SQL
- HackerRank — vt-85
- Изменения движка/схемы — vt-80, vt-81
