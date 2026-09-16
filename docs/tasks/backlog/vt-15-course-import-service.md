# vt-15 — Course import service

## Контекст

Импорт: JSON → Zod → semantic rules → сохранение; замена курса удаляет прогресс. Без UI.

## Цель

Сервис в `courses/`: `importCourse(text: string): Result` — parse JSON, `parseCourse`, semantic validation (UUID uniqueness, quiz indices, practice rules из спецификации), detect existing `courseId`, replace via **vt-12** (progress wipe on replace).

## Требования

- Structured errors (validation vs parse vs duplicate policy).
- Replace flow: delete progress + upsert course (reuse vt-12 transaction semantics).
- Cancel path без записи.
- Тесты: valid import, invalid JSON, semantic fail, replace removes progress.
- Без clipboard и textarea (vt-24).

## Технические заметки

- Зависимости: **vt-2**, **vt-12** (и косвенно vt-14 для wipe).

## План работ

- [ ] ImportService + error types
- [ ] Wire semantic validators from vt-2
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Поведение импорта из спецификации без UI

## Вне рамок задачи

- Import page, IndexedDB schema changes
