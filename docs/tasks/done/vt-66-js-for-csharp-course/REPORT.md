---
branch: feature/vt-66-js-for-csharp-course
---

# Отчёт vt-66 — JavaScript для C#-разработчика

## Что сделано

- Флагманский курс: 20 модулей в `docs/courses/javascript-for-csharp/` + сборка `javascript-for-csharp.json`.
- `npm run build:courses`, `sample-courses.spec.ts` (sync, parse, reference, starter-fails, invariants).
- `runJavascriptReferenceSelfCheck` / `runRegexReferenceSelfCheck` принимают user-код для проверки starter.
- Удалены старые sample-курсы из `docs/courses/`; README обновлён.
- Убран mirror-тест algorithms-start в `validate-practice-references.spec.ts` (fixture `algorithms-start.json` в practice-check остаётся).

## Изменённые файлы

- `docs/courses/javascript-for-csharp/**`, `docs/courses/javascript-for-csharp.json`, `docs/courses/README.md`
- `vibetest-app/tools/build-sample-courses.mts`, `package.json`
- `vibetest-app/src/app/courses/sample-courses.spec.ts`, `practice-reference-in-process-runners.spec-helper.ts`, `validate-practice-references.spec.ts`

## Тесты

- `ng test --watch=false`: зелёный (420)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Ревью (2026-09-28, раунд 1). Скоуп: ветка без коммитов, весь дифф — незакоммиченный; `ng test --watch=false` — 420 passed. Удаление старых sample-курсов соответствует TASK; ссылок на них вне `done/` / `archive/` не осталось.

1. **Sync-тест пишет в рабочее дерево и зависит от концов строк** → `sample-courses.spec.ts`, «assembled javascript-for-csharp.json matches build:courses output»: `execSync('npm run build:courses')` перезаписывает `docs/courses/javascript-for-csharp.json` во время `ng test`. (а) При рассинхроне первый прогон падает, но уже исправил файл — второй зелёный, дрейф маскируется, а в дереве появляется неожиданная правка. (б) В репозитории `core.autocrlf=true` и нет `.gitattributes`: после checkout (clone, `git switch` на merge) файл будет CRLF, а сборка пишет LF → тест падает на чистом дереве. (в) Спавн `npm` + `tsx` из unit-теста — медленно и зависит от PATH/shell. Ожидание: вынести сборку в чистую функцию (`buildJavascriptForCsharpCourse(): string`), в тесте сравнивать в памяти с файлом после нормализации EOL; CLI-скрипт лишь пишет результат. Дополнительно — `.gitattributes` (`docs/courses/**/*.json text eol=lf` или шире).
2. **Сборка не валидирует входные модули** → `tools/build-sample-courses.mts`: `JSON.parse(...) as CourseHeader` / `as ModuleImport`, проверяется только `schemaVersion` модуля (у заголовка — нет); невалидный модуль молча уйдёт в собранный курс, ошибка всплывёт только в spec и без указания файла. Ожидание: прогонять каждый `NN-*.module.json` через существующий `parseImportModuleText` (`courses/import-module-parse.ts`) с именем файла в ошибке — те же правила, что у «Импорт модуля» в приложении; заголовок — тоже проверять.
3. **Инварианты конкретного курса применяются ко всем курсам в `docs/courses`** (nit) → `sample-courses.spec.ts`, `assertModuleShape` (первый шаг theory, последний quiz, обязательны svg и javascript в каждом модуле) и «starter code fails» итерируют все top-level `*.json`: любой будущий курс другого профиля (например без JS) сломает тесты. Ожидание: ограничить инварианты `javascript-for-csharp.json` (или вынести требования в явный список курсов), общими оставить parse / reference / starter-fails.
4. **Нет контекста при падении starter-fails** (nit) → тот же spec: один тест на весь курс проходит циклом по всем практикам курса; при падении `expect(result.ok).toBe(false)` не видно, какой модуль/шаг. Ожидание: `it.each` по шагам или сообщение в `expect` с названием модуля и шага.

**Исправлено (раунд 1):** п.1 — `buildJavascriptForCsharpCourse()` в памяти, сравнение после нормализации EOL, CLI только пишет файл, `.gitattributes` `docs/courses/**/*.json text eol=lf`; п.2 — каждый модуль через `parseImportModuleText` (имя файла в ошибке), заголовок `course.json` проверяется, собранный курс — через `parseImportCourseText`; п.3 — инварианты только у `javascript-for-csharp.json`; п.4 — `expect(..., module / step)`. `ng test --watch=false`: 420 passed.

Ревью (2026-09-28, раунд 2). Пункты 1–4 раунда 1 проверены в коде — исправлены: сборка — чистая функция `buildJavascriptForCsharpCourse` (тест сравнивает в памяти после нормализации EOL, в дерево не пишет), `.gitattributes` фиксирует LF для `docs/courses/**/*.json`; модули валидируются `parseImportModuleText` с именем файла, собранный курс — `parseImportCourseText`; инварианты модулей/SVG — только у `javascript-for-csharp.json`; у starter-fails есть метка «модуль / шаг». Суффикс `.spec-helper.ts` у сборщика оправдан — исключён в `tsconfig.app.json`, node-код не попадает в app. `ng test --watch=false` — 420 passed.

1. **Ручная копия правил схемы для заголовка курса** (nit) → `build-javascript-for-csharp-course.spec-helper.ts`, `assertCourseHeader`: длины `title` 1–120 и `description` 1–2000 и набор ключей захардкожены — дублируют `course-import.schema.json` и разойдутся при её изменении; при этом собранный курс всё равно проходит `parseImportCourseText` в конце функции. Ожидание: проверять заголовок через сгенерированную Zod-схему (или оставить только проверку «объект + schemaVersion» и положиться на финальный parse с понятным сообщением `course.json`).
