# vt-12 — Course repository

## Контекст

Курсы сохраняются после импорта; нужен слой доступа к `courses` без UI.

## Цель

Сервис/repository в `storage/`: list, get by `courseId`, put/replace, delete; при delete — одна транзакция с удалением всего `stepProgress` курса (координация с progress repo или inline в storage — без дублирования логики).

## Требования

- API возвращает domain `Course` (parsed), не raw unknown без parse на границе read.
- Replace = upsert по `courseId`.
- Delete course + all progress atomically.
- Тесты с in-memory/fake IndexedDB.

## Технические заметки

- Зависимость: **vt-11**.
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
