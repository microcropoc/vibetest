---
branch: feature/vt-52-import-practice-self-check
---

# Отчёт vt-52 — Проверка practice-шагов при импорте

## Что сделано

- `validatePracticeReferences(course, deps)` — обход JS/SQL/regex шагов, dual-run `referenceSolution`, все ошибки этапа.
- `createWorkerPracticeReferenceValidationDeps` — production (Workers); in-process runners в `practice-reference-in-process-runners.spec-helper.ts` для тестов.
- `CourseImportService`: опция `validatePracticeSteps` после parse, до save; этап `practice`.
- Import UI: галочка «Проверка js/sql/regex шагов», default **выкл**.
- SPEC § Импорт; PLAN vt-52.
- Фикстуры `vibetest-app/src/app/courses/__fixtures__/practice-check/{pass,fail}/*.json` (discovery в spec).

## Изменённые файлы

- `validate-practice-references.ts`, `practice-reference-in-process-runners.spec-helper.ts` (+ specs); `tsconfig.app.json` / `tsconfig.spec.json`
- `course-import.service.ts` (+ spec), `import-types.ts`, `import-issue-view.ts` (+ spec)
- `import-page` (+ spec)
- `vibetest-app/src/app/courses/__fixtures__/practice-check/{pass,fail}/*.json`, `docs/courses/README.md` (убраны строки фикстур)
- `docs/SPECIFICATION.md`, `docs/PLAN.md`
- `docs/tasks/done/vt-52-import-practice-self-check/`

## Тесты

- `ng test --watch=false`: зелёный (329)

## Отклонения от TASK.md

- In-process sqlite/js/regex runners — только для vitest; импорт в браузере использует Worker deps.

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-09-25):

1. **Node-модуль в production `tsconfig.app`** → `practice-reference-in-process-runners.ts` (`node:path` / `node:url` / `process`) → файл не `*.spec.ts`, попадает в `tsconfig.app.json` (`include: src/**/*.ts`). `tsc -p tsconfig.app.json` падает (TS2591). Ожидание: вынести test-only runners из app graph (например `*.spec-helper.ts` + exclude, или держать логику только в `*.spec.ts` / отдельном test entry), без `node:` в коде приложения.
2. **In-process JS без `deadlineMs`** → `runJavascriptReferenceSelfCheck` → Worker-путь задаёт deadline из `timeoutMs`; in-process нет → never-settling thenable висит до timeout vitest. Ожидание: `deadlineMs: Date.now() + step.content.timeoutMs` (и прочие опции кейса по паритету с runner).
3. **PLAN: vt-50 в активной очереди** → `docs/PLAN.md` таблица → ссылка уже на `tasks/done/…`, но строка всё ещё в «Активная очередь». Ожидание: убрать vt-50 из очереди (оставить vt-51 / vt-52).

**Исправлено:**

1. Файл переименован в `practice-reference-in-process-runners.spec-helper.ts`; исключён из `tsconfig.app.json`, добавлен в `tsconfig.spec.json`.
2. В `runJavascriptReferenceSelfCheck` передаётся `deadlineMs: Date.now() + step.content.timeoutMs` в `runJavascriptCaseComparison`.
3. Строка vt-50 удалена из таблицы «Активная очередь» в `docs/PLAN.md`.

Ревью (2026-09-25, раунд 2):

1. **Мусорный emit `.js` рядом с исходниками** → `vibetest-app/src/**/*.js` (~140 untracked, в т.ч. `app.js`, `main.js`, workers, domains) → похоже на `tsc` без `--noEmit` / без `outDir`. Не коммитить; удалить артефакты. `tsc -p tsconfig.app.json --noEmit` сейчас зелёный — правки п.1 раунда 1 ок.

**Исправлено (раунд 2):** удалены все `vibetest-app/src/**/*.js` (141 файл) — в репозитории исходники только `.ts`, emit не коммитится.

Ревью (2026-09-25, раунд 3): Замечаний нет.

