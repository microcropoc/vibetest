# vt-2 — JSON Schema в проекте и генерация Zod

## Контекст

Спецификация: [`course-import.schema.json`](../../schemas/course-import.schema.json) (ввод) и [`course.schema.json`](../../schemas/course.schema.json) (канон). Импорт и домен должны валидировать через Zod; типы — из сгенерированных схем. Сейчас в приложении этого нет.

## Цель

В `vibetest-app/` воспроизводимый pipeline: обе JSON Schema из репо → bundle → **консольная команда** генерации Zod + TypeScript; `parseCourseImportDraft` / `parseCourse` и `normalizeCourseImport` (pure); тесты.

## Требования

- Bundle **обеих** схем в assets без расхождения с `docs/schemas/`.
- npm-скрипт (например `generate:zod`) — регенерация Zod/types для import + canonical.
- Generated-файлы в отдельном каталоге; **не редактировать вручную**.
- `parseCourseImportDraft(unknown): CourseImportDraft` — import Zod.
- `normalizeCourseImport(draft): unknown` — `schemaVersion` по умолчанию `1`; отсутствующие ID → `crypto.randomUUID()`; сохранять переданные ID.
- `parseCourse(unknown): Course` / `isCourse` — канонический Zod (после normalize).
- Тесты: import draft без ID; normalize → canonical parse; невалидные кейсы; smoke актуальности generated.
- **Semantic validation** (pure, на каноническом `Course`): уникальность всех ID; quiz indices; практика (JS `argsGenerator`, `reset` без seed); дубликаты **предоставленных** ID во входе — отдельная проверка на draft до normalize (если указаны).

## Технические заметки

- Домен: `courses/` (типы, parse, normalize), скрипт — `vibetest-app/tools/` или корень.
- Strict TS, без `any`; граница `unknown` только в parse.
- Зависимость: **vt-1**.

## План работ

- [ ] Tool JSON Schema → Zod (две схемы)
- [ ] Bundle + npm-скрипт
- [ ] `parseCourseImportDraft`, `normalizeCourseImport`, `parseCourse` / `isCourse`
- [ ] Colocated `*.spec.ts` без TestBed
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Команда генерации в `REPORT.md`
- [ ] Тесты зелёные
- [ ] Соответствие [`docs/SPECIFICATION.md`](../../SPECIFICATION.md)

## Вне рамок задачи

- UI импорта, Dexie, ImportService orchestration (vt-15)
- Движки шагов
- Редактирование `docs/schemas/*.json` (только потребление)
