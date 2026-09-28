---
branch: feature/vt-67-blind75-algorithms-course
---

# Отчёт vt-67 — Алгоритмы на JavaScript: Blind 75

## Что сделано

- Второй флагманский курс `docs/courses/algorithms-blind-75/`: 17 модулей, theory/svg/javascript/quiz, условия на русском со ссылками на LeetCode.
- Все 75 задач Blind 75 в модулях 01–16 плюс 6 задач из NeetCode 150 как дополнительная практика (81 ссылка на LeetCode); модуль 00 — разминки (Big-O, Map/Set, sort).
- Задачи LeetCode Premium помечены в условии.
- Обобщена сборка: `build-course-from-sources.spec-helper.ts`, `listCourseSourceSlugs`, `build:courses` для всех каталогов с `course.json`.
- `sample-courses.spec.ts`: sync-проверка и инварианты для каждого slug.

## Изменённые файлы

- `docs/courses/algorithms-blind-75/**`, `docs/courses/algorithms-blind-75.json`
- `docs/courses/README.md`
- `vibetest-app/src/app/courses/build-course-from-sources.spec-helper.ts` (замена `build-javascript-for-csharp-course.spec-helper.ts`)
- `vibetest-app/src/app/courses/sample-courses.spec.ts`
- `vibetest-app/tools/build-sample-courses.mts`

## Тесты

- `npx ng test --watch=false`: зелёный, 425 тестов (88 файлов)

## Отклонения от TASK.md

- Черновик модулей был сгенерирован TS-скриптом, но источник правды — `NN-slug.module.json`, как у `javascript-for-csharp`. Генератор удалён, чтобы не было третьего несверяемого источника.
- Помимо 75 задач Blind 75 в курсе 6 задач из NeetCode 150 (`valid-sudoku`, `two-sum-ii`, `trapping-rain-water`, `min-stack`, `daily-temperatures`, `binary-search`) — как разминочные/дополнительные в своих модулях.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

### Ревью (2026-09-28, раунд 1)

Скоуп: на ветке нет коммитов, весь дифф незакоммичен. `ng test --watch=false`: 425 passed (88 files), около 5 с. Все 75 задач Blind 75 на месте; дополнительно 6 задач из NeetCode 150 (`valid-sudoku`, `two-sum-ii`, `trapping-rain-water`, `min-stack`, `daily-temperatures`, `binary-search`), итого 81 уникальная ссылка на LeetCode.

1. **Три источника правды без проверки синхронизации.**
   - **Что:** контент Blind 75 проходит цепочку TS-генератор (`tools/generate-algorithms-blind75.mts`, `blind75-modules-01-08.mts`, `blind75-modules-09-16.mts`) → `docs/courses/algorithms-blind-75/*.module.json` → собранный `algorithms-blind-75.json`. Тест сверяет только два последних звена. Генератор с module JSON не сверяет ничего.
   - **Где:** `tools/generate-algorithms-blind75.mts` (шапка: «One-off generator…»), `docs/courses/README.md` (советует `npx tsx tools/generate-algorithms-blind75.mts` + `npm run build:courses`).
   - **Почему:** шапка называет генератор одноразовым, README предлагает регулярную перегенерацию, одно противоречит другому. Ручная правка module JSON молча затрётся при следующей перегенерации. Правка в TS без перегенерации пройдёт незамеченной, тесты останутся зелёными.
   - **Ожидание:** выбрать один источник правды.
     - Либо (а) источник — TS: убрать «One-off» и добавить тест или проверку, что вывод генератора в памяти совпадает с `*.module.json` (по аналогии с sync-тестом сборки). Генератор тогда должен экспортировать функцию, а не писать файлы при импорте.
     - Либо (б) источник — JSON, как у `javascript-for-csharp`: удалить `tools/generate-algorithms-blind75.mts` и `tools/blind75-*.mts`, из README убрать шаг генерации.
   - Выбранный вариант зафиксировать в «Отклонениях».

2. **Мёртвый `@deprecated`-враппер.**
   - **Что:** `buildJavascriptForCsharpCourse` нигде не используется (grep по `src/` и `tools/`).
   - **Где:** `src/app/courses/build-course-from-sources.spec-helper.ts`.
   - **Ожидание:** удалить. Старый spec-helper удалён целиком, поэтому совместимость сохранять не нужно.

3. **Ссылки на LeetCode Premium без пометки** (nit).
   - **Что:** задачи `meeting-rooms`, `meeting-rooms-ii`, `alien-dictionary`, `graph-valid-tree`, `number-of-connected-components-in-an-undirected-graph`, `encode-and-decode-strings` на LeetCode доступны только по подписке. В тексте курса это никак не отмечено.
   - **Где:** условия этих шагов в `docs/courses/algorithms-blind-75/*.module.json` (и в генераторе, если он остаётся).
   - **Ожидание:** пометить «(LeetCode Premium)» и/или дать бесплатную альтернативу (LintCode или NeetCode). Условие на русском уже самодостаточно, так что это вопрос ожиданий студента.

4. **`assertCourseHeader` дублирует лимиты схемы** (nit, перенесено из vt-66).
   - **Что:** в хелпере вручную захардкожены лимиты title 1–120 и description 1–2000.
   - **Где:** `build-course-from-sources.spec-helper.ts`.
   - **Ожидание:** валидировать через сгенерированную Zod-схему или parse, либо оставить и записать как известный долг.

5. **Слабые типы в хелперах генератора** (nit; актуально только при варианте 1а).
   - **Что:** локальный `Step`, `JsContent = Record<string, unknown>`, `tests: unknown[]`. Ошибки формы ловятся только при `build:courses` или в тестах, а не на этапе компиляции.
   - **Где:** `tools/blind75-module-helpers.mts`.
   - **Ожидание:** типизировать через сгенерированные из JSON Schema типы (`courses/generated/…`).

6. **Таймауты тестов курсов** (nit).
   - **Что:** таймауты подняты с 120_000 до 300_000, хотя весь прогон занимает около 5 с.
   - **Где:** `src/app/courses/sample-courses.spec.ts`.
   - **Ожидание:** обосновать запас в «Отклонениях» (медленный CI и т. п.) или вернуть 120_000. Раздел «Открытые вопросы» тоже стоит заполнить явно («нет»), а не оставлять «-».

**Исправлено (раунд 1):**

1. Выбран вариант (б): источник правды — `*.module.json`. Удалены `tools/generate-algorithms-blind75.mts` и `tools/blind75-*.mts`, шаг генерации убран из README, решение записано в «Отклонениях».
2. `buildJavascriptForCsharpCourse` удалён.
3. Шесть Premium-задач помечены в условии: «*LeetCode Premium; условие выше самодостаточно*».
4. Из `assertCourseHeader` убраны лимиты длины: остались проверки набора ключей, `schemaVersion` и типа строк, а длины проверяет итоговый `parseImportCourseText` по схеме.
5. Снято вместе с генератором (вариант б).
6. Таймауты возвращены на 120_000; «Открытые вопросы» заполнены.

### Ревью (2026-09-28, раунд 2)

Скоуп: на ветке по-прежнему нет коммитов, весь дифф незакоммичен. `ng test --watch=false`: 425 passed (88 files), около 5 с.

Все пункты раунда 1 подтверждены:

1. Генератор `tools/generate-algorithms-blind75.mts` и файлы `tools/blind75-*.mts` удалены, ссылок на них нет. README называет источником правды `NN-slug.module.json`, решение записано в «Отклонениях».
2. `buildJavascriptForCsharpCourse` удалён, ссылок на него нет.
3. Шесть задач Premium помечены в модулях 01, 10 и 14, пометка попала и в собранный JSON.
4. Из `assertCourseHeader` убраны лимиты длины. Длины проверяет итоговый `parseImportCourseText`.
5. Снято вместе с генератором.
6. Таймауты `sample-courses.spec.ts` возвращены на 120_000, «Открытые вопросы» заполнены.

Новых замечаний нет. **Ок к мержу.**
