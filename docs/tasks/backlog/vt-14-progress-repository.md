# vt-14 — Progress repository

## Контекст

Плеер сохраняет статус шага, черновики и флаг неудачной проверки в `stepProgress`.

## Цель

Repository в `storage/`: get/put по ключу шага, list by course, **`deleteAllByCourseId(courseId)`** (единый API для vt-12 delete/replace и vt-15 replace); маппинг row ↔ domain progress types из **vt-3** / **vt-13**.

## Требования

- Ключ `${courseId}::${moduleId}::${stepId}`.
- Поля: `not-started` | `in-progress` | `completed`, draft payload по типу (discriminated), `lastCheckFailed`.
- Parse rows at boundary (`unknown` → typed).
- Тесты storage.

## Технические заметки

- Зависимости: **vt-11**, **vt-13**.

## План работ

- [ ] ProgressRepository
- [ ] Integration with Dexie schema
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] CRUD прогресса соответствует спецификации

## Вне рамок задачи

- Player UI, orchestration
