# vt-81 — SQL-шаг в формате LeetCode / HackerRank

**Приоритет:** P1  
**Зависимости:** vt-80  
**Блокирует:** vt-82, vt-83, vt-85

## Контекст

JS-шаг доработан до покрытия задач LeetCode (construct, structure, checker, unordered и т.д.). SQL-шаг сравнивает все result set’ы подряд, игнорирует имена колонок, не поддерживает DML-проверки, REGEXP, float tolerance и не показывает diff при провале. Для курсов LeetCode (~150+ free) и HackerRank (~58) нужен тот же уровень выразительности схемы и UX.

## Цель

Автор курса может описать типичную SQL-задачу с LeetCode/HackerRank; ученик при провале видит свои и ожидаемые таблицы и текст SQL-ошибки. Существующие sqlite-шаги без новых полей остаются валидными.

## Требования

### Схема (`docs/schemas/course.schema.json` → `$defs.sqliteContent`)

- Сравнивать **последний** result set запроса; промежуточные statement’ы (temp tables) допустимы; пустой результат — колонки через `prepare` / `getColumnNames`.
- **`checkColumnNames`** (boolean, optional): сравнение имён колонок без учёта регистра.
- **`floatTolerance`** (number, optional): числовые ячейки с допуском; иначе точное сравнение как сейчас.
- **`checkQuery`** (string, optional): после user/reference SQL выполнить проверочный SELECT на обеих БД и сравнить его результат (DELETE/UPDATE задачи).
- В описании схемы: convention для «function» задач (LeetCode 177) — параметры в таблице `params` через `seed`.
- После правок: `npm run generate:zod`.

### Движок (sql.js)

- `create_function` на user и reference БД: `regexp(pattern, value)` для оператора `REGEXP`.
- Математические функции (`sqrt`, `power`, …) — только если отсутствуют в sql.js 1.13; зафиксировать тестом.
- BLOB в сериализации ячеек — hex.

### Диагностика UI

- Worker возвращает columns/rows user и reference (cap ~50 строк) + message SQL-ошибки.
- Расширить `PracticeRunResult` → `PracticeFeedback` в `practice-step-view.ts`.
- Dumb-компонент `player/ui/sql-result-diff`: «Ваш результат» / «Ожидается» + ошибка; встроить в `practice-step-shell` для sqlite.

### Тесты и курсы

- Fixtures pass/fail в `courses/__fixtures__/practice-check/` на каждую новую опцию.
- `sample-courses.spec.ts`: starter sqlite падает ≥1 тест; `courseRequiresPracticeSteps` и `assertModuleShape` учитывают `sqlite`.

### Документация

- Описания в JSON Schema, `docs/SPECIFICATION.md`, промпты `build-course-generation-prompt.ts`, `build-staged-generation-messages.ts`.

## Технические заметки

- Домены: `courses/` (schema, zod, fixtures, sample-courses), `execution/` (core, worker, result-rows), `player/` (feedback, sql-result-diff, shell).
- CLI: `ng g c player/ui/sql-result-diff --standalone` (или вручную по конвенции папок).

## План работ

- [ ] Расширить `sqliteContent` в course.schema.json + generate:zod
- [ ] Last result set, checkColumnNames, floatTolerance, checkQuery в core/worker
- [ ] REGEXP + math functions + BLOB hex
- [ ] Расширить execution messages и runner для diff payload
- [ ] `sql-result-diff` + wiring в practice-step-shell
- [ ] Fixtures + sample-courses starter check для sqlite
- [ ] SPEC + prompt generation

## Критерии готовности (Definition of Done)

- [ ] Fixture-курсы покрывают все новые опции; reference pass, starter fail где нужно
- [ ] `ng test --watch=false` зелёный
- [ ] Smart/dumb: diff только в UI, логика в execution/core
- [ ] Обратная совместимость: старый `sqlite.json` fixture без новых полей работает

## Вне рамок задачи

- Наполнение курсов LeetCode/HackerRank — vt-83–85
- Починка загрузки wasm — vt-80 (должна быть смержена раньше)
