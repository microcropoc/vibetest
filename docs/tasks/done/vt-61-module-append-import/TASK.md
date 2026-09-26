# vt-61 — Импорт модуля в конец курса

## Контекст

Сейчас импорт только целого курса. Нужно дописывать один модуль в конец существующего курса без смены схемы Dexie (документ курса целиком).

## Цель

- JSON Schema **module-import** для авторов (без UUID)
- Импорт: выбор курса + JSON модуля → append в `modules[]`
- Инфо: показ и копирование схемы модуля
- Прогресс существующих шагов не сбрасывается

## Требования

- Standalone `module-import.schema.json` в docs/public
- Zod `ImportModuleDocumentSchema`, parse, assign IDs, semantic + optional practice check
- `CourseImportService.importModule(text, { courseId, validatePracticeSteps })`
- Лимит 100 модулей на курс; курс должен существовать
- UI Импорт: секция «Импорт модуля» с select курсов
- UI Инфо: course-import + module-import

## Технические заметки

- `courses/` domain, `import/` page, `info/` page, `storage/` без миграций

## План работ

- [x] Схема + bundle + Zod
- [x] Append pipeline + tests
- [x] Import / Info UI
- [x] SPEC + REPORT, `ng test --watch=false`

## Критерии готовности (Definition of Done)

- [x] Append end-to-end; тесты зелёные

## Вне рамок задачи

- Нормализация Dexie 1:N
- Prompt generation для module-import
