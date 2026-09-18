# vt-15 — Course import service

## Контекст

Импорт: JSON → Zod → semantic → опционально `regenerateCourseIds` → storage; замена курса удаляет прогресс. Без UI.

## Цель

Сервис в `courses/`: `importCourse(text: string, options: { regenerateIds: boolean }): Result` — parse JSON, `parseCourse`, semantic validation, при `regenerateIds: true` — `regenerateCourseIds`, иначе detect existing `courseId` для replace via **vt-12** / **vt-14**.

## Требования

- **Собрать все ошибки достигнутого этапа** (JSON parse → Zod → semantic); после сбоя этапа следующие не выполнять; в UI — один список.
- `schemaVersion` ≠ 1 — reject (на этапе Zod).
- **`regenerateIds: true`:** после успешной semantic — `regenerateCourseIds`, всегда **create** (новый `courseId`); replace-диалог не нужен.
- **`regenerateIds: false`:** ID из JSON сохраняются; **Replace** — если `courseId` уже в хранилище → в **одной** storage-транзакции: `ProgressRepository.deleteAllByCourseId` (vt-14, helper vt-12) + `CourseRepository.put` (vt-12); иначе create.
- Cancel path без записи (replace отменён).
- Сохранять JSON курса как после parse/semantic и опциональной регенерации ID.
- Тесты: `regenerateIds` create; без регенерации — new `courseId` create; existing `courseId` replace wipes progress; invalid JSON; semantic fail.
- Без clipboard и checkbox UI (vt-24).

## Технические заметки

- Зависимости: **vt-2**, **vt-12**, **vt-14** (progress wipe API).

## План работ

- [ ] ImportService + error types + `ImportOptions`
- [ ] Wire vt-2 parse/semantic/regenerateCourseIds
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Поведение импорта из спецификации без UI

## Вне рамок задачи

- Import page, IndexedDB schema changes
