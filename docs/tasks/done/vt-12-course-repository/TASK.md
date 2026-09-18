# vt-12 — Course repository

## Контекст

Курсы сохраняются после импорта; нужен слой доступа к `courses` без UI.

## Цель

Сервис/repository в `storage/`: list, get by `courseId`, put/replace, delete; при delete — одна транзакция с удалением всего `stepProgress` курса.

## Требования

- API возвращает domain `Course` (parsed), не raw unknown без parse на границе read.
- Replace = upsert по `courseId` (только документ курса; прогресс не трогать).
- **Storage helper** (pure query в `storage/`, создаётся в этой задаче): удаление всех строк `stepProgress` по `courseId`. **Транзакционно-композабелен:** helper **не** открывает свою транзакцию; вызывается внутри переданного Dexie transaction context / `Table` (напр. `db.transaction('rw', [courses, stepProgress], …)`).
- `CourseRepository.delete(courseId)`: одна внешняя транзакция — helper (progress) + delete course row.
- Тест: replace/import-сценарий — helper внутри **внешней** транзакции вместе с `courses.put` (как vt-15).
- Replace import (vt-15): upsert course only; progress wipe — через **vt-14** (который вызывает тот же helper).
- Тесты с in-memory/fake IndexedDB (delete cascade включая helper).

## Технические заметки

- Зависимость: **vt-11** только.
- Helper экспортировать из `storage/` (не из domain); **vt-14** не является зависимостью vt-12.
- `providedIn: 'root'` или storage module pattern по convention проекта.

## План работ

- [x] `deleteStepProgressByCourseId` (или аналог) в `storage/`
- [x] CourseRepository queries + delete transaction
- [x] Tests
- [x] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [x] Транзакционное удаление как в спецификации
- [x] Helper задокументирован в `REPORT.md` для vt-14

## Вне рамок задачи

- Import UI, progress domain aggregates (vt-13), ProgressRepository CRUD (vt-14)
