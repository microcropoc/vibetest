---
branch: feature/vt-45-self-describing-schemas
---

# Отчёт vt-45 — Самоописывающая JSON Schema

## Что сделано

- Русские `description` на корне, модулях, шагах, всех `$defs/*Content` и полях practice/quiz/svg/theory в [`course-import.schema.json`](../../../docs/schemas/course-import.schema.json).
- Зеркально в [`course.schema.json`](../../../docs/schemas/course.schema.json) + пояснения для `courseId`, `moduleId`, `stepId`, `createdAt`, `uuid`.
- `npm run generate:zod` — обновлены `public/schemas/*` и generated Zod/TS.
- Промпт: блок «Семантика полей» — читать `description` в схеме, не выдумывать.
- SPEC: § формат курса и типы шагов.

## Изменённые файлы

- `docs/schemas/course-import.schema.json`
- `docs/schemas/course.schema.json`
- `docs/SPECIFICATION.md`
- `vibetest-app/public/schemas/*`
- `vibetest-app/src/app/courses/generated/*` (generate:zod)
- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.ts`
- `vibetest-app/src/app/prompt-generation/build-course-generation-prompt.spec.ts`

## Тесты

- `ng test --watch=false`: **зелёный** (74 files, 259 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

Ревью (2026-09-24): незакоммиченный дифф на `feature/vt-45-self-describing-schemas` (коммитов `main..HEAD` нет).

1. **`step.content`: `true` → объект только с `description`** → `docs/schemas/*.schema.json` (и зеркала) → generate дал в `course.types.ts` тип `content: { [k: string]: unknown }` вместо `unknown`. Для `theory` content — строка; ожидание: оставить `"content": true` (семантику уже несут `type` / `$defs/*Content`) либо иначе сохранить `unknown` без ручной правки generated.
2. **Sibling `description` рядом с `$ref` на uuid** → `course.schema.json` (`courseId` / `moduleId` / `stepId`) → пропал `export type Uuid`, поля стали `string`. Ожидание: description только в `$defs.uuid` (как на main с алиасом), либо явно зафиксировать приемлемость инлайна.
3. **Опечатка** → `$defs.uuid.description`: «нижний **регист** hex» → «**регистр**» (обе схемы + generate).
4. **Неточности description vs SPEC (риск для LLM)** → practice-поля:
   - `javascriptContent.setup`: «объявление functionName» — по SPEC функция появляется после load starter/reference, не обязана жить в `setup`;
   - `functionName`: «после setup» — то же;
   - `tests[].calls[].method`: «у объекта» — по SPEC вызов `current[method](...)` на **результате предыдущего** шага;
   - `rejects`: только `Error.message` — в SPEC ещё JSON-equal для non-Error reason;
   - порядок в корневом JS-description: `advanceMs`/`flushMicrotasks` — в SPEC сначала `flushMicrotasks`, затем `advanceMs`.
5. **SPEC § «Генерация промта»** не отражает новый блок «Семантика полей» / обязанность читать `description` в схеме — при том что это часть цели задачи; ожидание: одна фраза в перечне инструкций промта.
6. **Промпт** (`build-course-generation-prompt.ts`): «единственный источник смысла» слегка конфликтует с явными правилами ниже; второй буллет уже смягчает — лучше согласовать формулировку первого.

### Исправлено (2026-09-24)

1. `step.content` снова `true` в обеих схемах; после `generate:zod` — `content: unknown`, `export type Uuid`.
2. У `courseId` / `moduleId` / `stepId` только `$ref`; пояснение UUID — в `$defs.uuid.description`.
3. Опечатка «регистр» в `$defs.uuid` (canonical).
4. JS practice descriptions выровнены с SPEC (setup, functionName, method, rejects, flushMicrotasks → advanceMs).
5. SPEC § «Генерация промта» — фраза про чтение `description` в схеме.
6. Промпт: «основной источник» + приоритет явных инструкций при конфликте.

### Ревью (2026-09-24, раунд 2)

Проверка незакоммиченного диффа после правок: пункты 1–6 закрыты (`content: true` / `Uuid`, зеркала public, JS descriptions, SPEC, промпт). Description-parity import↔course по `$defs/*Content` — ок.

**Замечаний нет.**
