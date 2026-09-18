# Ревью проекта — готовность очереди vt-2 … vt-27

Дата: 2026-09-17 (обновлено 2026-09-18: единая схема, замена ID при импорте, статические `args` в JS-тестах; закрыты замечания высокого/среднего приоритета). Scope: `docs/SPECIFICATION.md`, `docs/PLAN.md`, `docs/schemas/course.schema.json`, все карточки `docs/tasks/`, состояние `vibetest-app/` (vt-1 done).

## Вердикт

**Да, задачи можно выполнять строго по порядку vt-2 → vt-27.** Проверены все зависимости из `PLAN.md` и карточек: у каждой задачи vt-n все зависимости имеют меньший номер, т.е. нумерация совпадает с валидным топологическим порядком. Блокеров для старта vt-2 нет.

Критический путь: `vt-2 → vt-3 → vt-7 → vt-8/9/10 → vt-19 → vt-23 → vt-27` (плюс `vt-13 → vt-14` перед vt-19). Параллельные треки из `PLAN.md` — опция для ускорения, не обязательство.

Ближайшие стартовые точки: **vt-2** (deps: vt-1 ✓) и **vt-16** (deps: vt-1 ✓) — обе готовы.

## Замечания

### Высокий приоритет (технические риски)

1. ~~**vt-2 — конвертер JSON Schema → Zod может не покрыть схему.**~~ **Закрыто:** [vt-2](tasks/backlog/vt-2-course-schema-zod.md) — spike + fallback (`z.discriminatedUnion('type', …)`, json-schema-to-typescript, Ajv smoke vs Zod).
2. ~~**vt-12: helper удаления прогресса транзакционно-композабелен.**~~ **Закрыто:** [vt-12](tasks/backlog/vt-12-course-repository.md), [vt-14](tasks/backlog/vt-14-progress-repository.md), [vt-15](tasks/backlog/vt-15-course-import-service.md) — helper без собственной транзакции; внешняя `db.transaction` для replace.

### Средний приоритет (уточнить в карточках)

3. ~~**Strict TS в scaffold отсутствует.**~~ **Закрыто:** первое изменение в **vt-2** (`strict: true` в tsconfig).
4. ~~**Semantic rule reset / INSERT — эвристика.**~~ **Закрыто:** [SPECIFICATION.md](SPECIFICATION.md) (импорт), [vt-2](tasks/backlog/vt-2-course-schema-zod.md) — только **SQLite** `reset`, токены `\bINSERT\b`/`\bINTO\b`; JS `reset` не проверяется.
5. ~~**vt-9: sql.js WASM asset.**~~ **Закрыто:** [vt-9](tasks/backlog/vt-9-sqlite-step-engine.md) — sql.js, wasm asset, `locateFile`, Worker.
6. ~~**vt-16: дефолтный app.spec.ts.**~~ **Закрыто:** [vt-16](tasks/backlog/vt-16-app-shell-routes.md) — обновить spec при замене shell.
7. ~~**Дублирование confirm-диалога.**~~ **Закрыто:** [vt-17](tasks/backlog/vt-17-course-list-page.md) — `ConfirmDialogComponent` в `shared/ui/`; [vt-24](tasks/backlog/vt-24-import-page.md) переиспользует; PLAN deps vt-24 + vt-17.

### Низкий приоритет / опционально

8. **vt-23 ↔ vt-20:** текст vt-23 ссылается на кнопку «Повторить» из vt-20, но в `PLAN.md` deps vt-23 — только vt-8–vt-10, vt-19. При последовательном порядке некритично (vt-20 раньше); для параллельного сценария добавить vt-20 в deps vt-23.
9. **vt-14 deps:** типы draft/state — из vt-3 (`player/step-engine/`), в deps указаны vt-11/12/13 (vt-3 приходит транзитивно через vt-13). Работает; для ясности можно указать vt-3 явно.
10. **vt-7:** зафиксировать в REPORT способ бандлинга worker'ов в Angular/esbuild (`new Worker(new URL('./x.worker.ts', import.meta.url), { type: 'module' })`); моки для Vitest уже предусмотрены карточкой.
11. **Открытый вопрос vt-1 без ответа:** локально Node v26 (Current), не LTS. Решить в рамках vt-2: `.nvmrc` или `engines` в `package.json`.
12. **Prettier** есть в devDependencies, но нет конфига и format-скрипта — добавить `.prettierrc` + npm-скрипт или убрать зависимость.
13. **Дизайн-токены:** цвета индикаторов плеера (текущий/ошибка/пройден/не тронут) и общие стили понадобятся в vt-17…vt-26. Опционально: минимальные SCSS-токены в vt-16 или vt-20, чтобы страницы не разъехались визуально.

## Что проверено — замечаний нет

- Все задачи vt-2…vt-27 существуют, нумерация без дыр, карточки по шаблону `_template/`, статус через папки соблюдён; `in-progress/` пуст — конфликта с правилом «одна задача на ветку» нет.
- Зависимости в карточках совпадают с таблицей `PLAN.md` (сверена каждая).
- Единая схема `course.schema.json` консистентна со спецификацией: обязательные ID и `schemaVersion: 1`; `timeoutMs` (100–30000) у всей практики; `reset` опционален у javascript/sqlite и отсутствует у regex; `orderMatters` обязателен у sqlite; JS tests — обязательный `args` с `maxItems: 20`; quiz — `uniqueItems` + min/max; `additionalProperties: false` не конфликтует с `if/then`.
- Модель хранилища (`courses`, `stepProgress`, ключ `${courseId}::${moduleId}::${stepId}`) в спеке, vt-11 и vt-14 совпадает.
- Поток импорта (этапы ошибок, `regenerateIds`, create/replace, wipe прогресса) согласован между спекой, PLAN, vt-2, vt-12, vt-14, vt-15, vt-24.
- Правила плеера (first-incomplete, приоритет индикаторов, «Повторить» не снимает `completed`) согласованы между спекой, vt-3, vt-13, vt-19, vt-20.
