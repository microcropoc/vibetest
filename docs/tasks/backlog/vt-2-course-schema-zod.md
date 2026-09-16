# vt-2 — JSON Schema в проекте и генерация Zod

## Контекст

Спецификация и [`docs/schemas/course.schema.json`](../../schemas/course.schema.json) задают формат курса. Импорт и домен должны валидировать через Zod; типы — из сгенерированных схем. Сейчас в приложении этого нет.

## Цель

В `vibetest-app/` появляется воспроизводимый pipeline: repo JSON Schema → bundle в приложении → **консольная команда** генерации Zod + TypeScript-типов; `parseCourse` / `isCourse` на Zod; тесты на валидные и невалидные документы.

## Требования

- Скопировать или синхронизировать схему из `docs/schemas/course.schema.json` в артефакт приложения (bundle/assets), без расхождения с источником в репо.
- Добавить npm-скрипт (например `npm run generate:schema` или `generate:zod`) — одна команда для регенерации из JSON Schema.
- Generated-файлы помечены/лежат в отдельном каталоге; **не редактировать вручную**.
- `parseCourse(unknown): Course` и `isCourse(v): v is Course` — тонкие обёртки над Zod (`parse` / `safeParse`), рядом с доменом `courses/`.
- Тесты: минимум один валидный фрагмент курса; невалидные кейсы (лишние поля, неверный `type`, битый UUID); smoke, что generated-схема актуальна (checksum/fixture или CI-check после `generate:*`).
- **Semantic validation** поверх Zod (отдельные pure functions): уникальность `courseId`/`moduleId`/`stepId` в документе; у quiz — каждый `correctIndices[i] < options.length` (схема уже задаёт `uniqueItems` на индексы).

## Технические заметки

- Домен: `courses/` (типы, parse), скрипт генерации — корень `vibetest-app/` или `tools/`.
- Выбор генератора (json-schema-to-zod и т.п.) — на усмотрение исполнителя; зафиксировать в `REPORT.md`.
- Strict TS, без `any`; граница `unknown` только в parse.
- Зависимость: **vt-1** (scaffold).

## План работ

- [ ] Выбрать и подключить tool JSON Schema → Zod
- [ ] Bundle схемы + npm-скрипт генерации
- [ ] `parseCourse` / `isCourse` + экспорт типа `Course`
- [ ] Colocated `*.spec.ts` без TestBed
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Команда генерации документирована в задаче/`REPORT.md`
- [ ] Тесты валид/невалид зелёные
- [ ] Generated не правятся руками после merge
- [ ] Соответствие [`docs/SPECIFICATION.md`](../../SPECIFICATION.md) (формат курса, Zod)

## Вне рамок задачи

- UI импорта, Dexie, доп. правила импорта (уникальность UUID в файле) — отдельные задачи
- Движки шагов
- Редактирование содержимого `docs/schemas/course.schema.json` (только потребление)
