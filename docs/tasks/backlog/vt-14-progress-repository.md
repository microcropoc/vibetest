# vt-14 — Progress repository

## Контекст

Плеер сохраняет статус шага, черновики и флаг неудачной проверки в `stepProgress`.

## Цель

Repository в `storage/`: get/put по ключу шага, list by course, **`deleteAllByCourseId(courseId)`** — публичный API для vt-15 replace и UI delete; внутри вызывает **тот же storage helper**, что и `CourseRepository.delete` (**vt-12**), без дублирования Dexie-запроса.

## Требования

- Ключ `${courseId}::${moduleId}::${stepId}`.
- Поля: `not-started` | `in-progress` | `completed`, draft payload по типу (discriminated), `lastCheckFailed`.
- Parse rows at boundary (`unknown` → typed).
- `deleteAllByCourseId` — обёртка над helper из vt-12; при import replace вызывается **внутри той же внешней транзакции**, что и `CourseRepository.put` (vt-15), без отдельного `transaction()` в helper.
- Тесты storage.

## Технические заметки

- Зависимости: **vt-11**, **vt-12** (helper), **vt-13** (domain types для mapping).
- **Не** создавать второй bulk-delete query.

## План работ

- [ ] ProgressRepository
- [ ] `deleteAllByCourseId` → reuse vt-12 helper
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] CRUD прогресса соответствует спецификации
- [ ] Bulk delete не дублирует vt-12

## Вне рамок задачи

- Player UI, orchestration, delete course row (vt-12)
