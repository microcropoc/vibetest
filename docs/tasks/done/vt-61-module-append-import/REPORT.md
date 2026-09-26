---
branch: feature/vt-61-module-append-import
---

# Отчёт vt-61 — Импорт модуля в конец курса

## Что сделано

- Добавлена JSON Schema `module-import.schema.json` (генерируется из `$defs` course-import при `npm run generate:zod`).
- Domain: `ImportModuleDocumentSchema`, parse/DTO, semantic append, `CourseImportService.importModule`.
- Вкладка **Импорт**: секция «Импорт модуля» (select курса, JSON, practice-check, «Добавить модуль»).
- Вкладка **Инфо**: отображение и копирование course-import и module-import.
- Обновлена `docs/SPECIFICATION.md`.

## Изменённые файлы

- `docs/schemas/module-import.schema.json`, `docs/SPECIFICATION.md`
- `vibetest-app/public/schemas/module-import.schema.json`
- `vibetest-app/tools/generate-course-schema.mts`, `build-module-import-schema.mts`
- `vibetest-app/src/app/courses/*` (import module pipeline, semantic append)
- `vibetest-app/src/app/import/pages/import-page/*`
- `vibetest-app/src/app/info/*`

## Тесты

- `ng test --watch=false`: зелёный (371 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

### Ревью (раунд 1)

- В `docs/SPECIFICATION.md` (раздел «Формат курса») после добавления третьей схемы заголовок и текст всё ещё про **две** схемы: «Две JSON Schema», «обе схемы» в bundle, «в обеих схемах» про `description`. Ожидание: формулировки про три схемы и что в `public/schemas/` лежат `course`, `course-import` и `module-import`.
  - **Исправлено:** «Три JSON Schema»; bundle — все три; `description` — во всех трёх схемах.
- Пути ошибок practice при импорте модуля переписываются в `module.steps[i]` (`course-import.service.ts`, `replace(/^modules\[0\]/, 'module')`). В JSON модуля нет ключа `module`, а semantic для того же документа уже даёт `steps[i]…` (`remapSingleModuleSemanticPath`). Ожидание: тот же префикс, что у semantic — `steps[i]`.
  - **Исправлено:** общий `remapSingleModuleIssuePath` → `steps[i]`; тест на practice stage.
- `validateAppendModuleToCourse` собирает уникальность только из существующих `moduleId` / `stepId` и не включает `course.courseId`. `validateModuleSemantics` гоняет модуль на временном курсе с другим `courseId`, полный `validateCourseSemantics` перед `put` не вызывается. По SPEC дубликаты `courseId` / `moduleId` / `stepId` в сохранённом документе отклоняются. Ожидание: `courseId` курса входит в эту проверку (или перед записью проверяется уже собранный документ).
  - **Исправлено:** `existingIds` включает `course.courseId`; тест на коллизию `moduleId` с `courseId`.

### Ревью (раунд 2, 2026-09-26)

- Пункты раунда 1 в коде/SPEC не закрыты — остаются открытыми.
  - **Исправлено** (см. выше).
- В SPEC есть нумерованный «Поток **Импортировать**», но нет симметричного потока для **Добавить модуль** (JSON/`module-import` → Zod → assign IDs → append semantic / лимит 100 / коллизии с курсом → optional practice → `put` без сброса прогресса; этап `target` при отсутствии курса). Ожидание: кратко описать этапы рядом с UI импорта модуля.
  - **Исправлено:** добавлен «Поток **Добавить модуль**» (7 шагов + ошибки по этапам).

### Ревью (раунд 3, 2026-09-26)

- Правки раундов 1–2 сверены с кодом/SPEC — закрыты.
- В SPEC «Поток **Добавить модуль**» порядок: п.4 **target**, затем п.5 semantic (в т.ч. quiz / sqlite `reset`). В коде `parseImportModuleText` уже вызывает `validateModuleSemantics` **до** проверки курса в `importModule`. При битом модуле и отсутствующем курсе пользователь увидит `semantic`, а не `target`. Ожидание: согласовать порядок — либо target сразу после assign IDs (module-semantic только в append), либо явно описать в SPEC module-semantic до target.
  - **Исправлено:** semantic убран из `parseImportModuleText`; после assign IDs идёт `target`, затем `validateAppendModuleToCourse` (включая quiz/sqlite). Тесты на порядок target → semantic.

### Ревью (раунд 4, 2026-09-26)

- Правка раунда 3 сверена: `parseImportModuleText` — только unwrap/Zod/IDs; `importModule` — target → append semantic → practice. Замечаний нет.
