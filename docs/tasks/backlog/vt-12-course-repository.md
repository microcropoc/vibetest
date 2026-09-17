# vt-12 — Course repository

## Контекст

Курсы сохраняются после импорта; нужен слой доступа к `courses` без UI.

## Цель

Сервис/repository в `storage/`: list, get by `courseId`, put/replace, delete; при delete — одна транзакция с удалением всего `stepProgress` курса (координация с progress repo или inline в storage — без дублирования логики).

## Требования

- API возвращает domain `Course` (parsed), не raw unknown без parse на границе read.
- Replace = upsert по `courseId`.
- Delete course + all progress atomically (вызов **vt-14** `deleteAllByCourseId` внутри транзакции Dexie, без дублирования SQL).
- Replace import (vt-15): upsert course only; progress wipe — ответственность ImportService через vt-14.
- Тесты с in-memory/fake IndexedDB.

## Технические заметки

- Зависимости: **vt-11**, **vt-14** (для delete cascade; можно stub до vt-14, но DoD delete — после vt-14).
- `providedIn: 'root'` или storage module pattern по convention проекта.

## План работ

- [ ] CourseRepository queries
- [ ] Delete + progress cascade (transaction)
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Транзакционное удаление как в спецификации

## Вне рамок задачи

- Import UI, progress domain aggregates (vt-13)
