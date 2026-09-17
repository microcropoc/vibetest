# vt-15 — Course import service

## Контекст

Импорт: JSON → import Zod → normalize → canonical Zod → semantic → storage; замена курса удаляет прогресс. Без UI.

## Цель

Сервис в `courses/`: `importCourse(text: string): Result` — parse JSON, `parseCourseImportDraft`, `normalizeCourseImport`, `parseCourse`, semantic validation, detect existing **provided** `courseId`, replace via **vt-12**.

## Требования

- **Собрать все ошибки достигнутого этапа** (JSON parse → import Zod → normalize → canonical Zod → semantic); после сбоя этапа следующие не выполнять; в UI — один список.
- `schemaVersion` во входе: если указан и ≠ 1 — reject.
- **Create:** вход без `courseId` → normalize с новым UUID → всегда новый курс.
- **Replace:** только если во **входе** был `courseId` и он уже в хранилище → в **одной** storage-транзакции: `ProgressRepository.deleteAllByCourseId` (vt-14, helper vt-12) + `CourseRepository.put` (vt-12); не дублировать bulk-delete в ImportService.
- Cancel path без записи.
- Сохранять только **канонический** JSON.
- Тесты: import без ID, с ID create/replace, invalid JSON, semantic fail, replace wipes progress.
- Без clipboard (vt-24).

## Технические заметки

- Зависимости: **vt-2**, **vt-12**, **vt-14** (progress wipe API).

## План работ

- [ ] ImportService + error types
- [ ] Wire vt-2 parse/normalize/semantic
- [ ] Tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Поведение импорта из спецификации без UI

## Вне рамок задачи

- Import page, IndexedDB schema changes
