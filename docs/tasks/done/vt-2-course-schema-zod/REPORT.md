---
branch: feature/vt-2-course-schema-zod
---

# Отчёт vt-2 — JSON Schema в проекте и генерация Zod

## Что сделано

- Ветка `feature/vt-2-course-schema-zod` от `main`; задача перенесена в `done/` после merge в `main`.
- **`strict: true`**, `strictTemplates` в tsconfig; Node LTS: `.nvmrc` (`22`), `engines` `>=22 <23`.
- Pipeline: `npm run generate:zod` (`tsx tools/generate-course-schema.mts`) — копия схемы в `public/schemas/`, generated `content-schemas.zod.ts` + `course.types.ts`.
- **Spike:** полная схема через `json-schema-to-zod` даёт слабый корень (`z.any()` на refs, без `if/then` на шагах). **Fallback:** `json-schema-to-zod` по `$defs/*Content` + uuid; **`StepSchema` / `CourseSchema`** — ручной `z.discriminatedUnion('type', …)` в `course-zod-schema.ts`. Тип домена `Course` = `z.infer<typeof CourseSchema>`.
- TypeScript: `json-schema-to-typescript` → `generated/course.types.ts` (справочно; discriminated `content` там `unknown` из‑за `if/then`).
- Домен: `parseCourse`, `isCourse`, `regenerateCourseIds`, `validateCourseSemantics`.
- Semantic SQLite reset: токены `\bINSERT\b`, `\bINTO\b` (case-insensitive); JS `reset` не проверяется.
- Тесты: parse, regenerate, semantic, bundle sync, Ajv 2020-12 vs Zod smoke matrix.

### Команда генерации

```bash
cd vibetest-app
npm run generate:zod
```

После изменения `docs/schemas/course.schema.json` — перегенерировать и закоммитить `public/schemas/` + `src/app/courses/generated/`.

## Изменённые файлы

- `docs/tasks/done/vt-2-course-schema-zod/` — TASK, REPORT
- `vibetest-app/tsconfig.json`, `tsconfig.spec.json`, `.nvmrc`, `package.json`, `package-lock.json`
- `vibetest-app/tools/generate-course-schema.mts`
- `vibetest-app/public/schemas/course.schema.json`
- `vibetest-app/src/app/courses/**` (domain, specs, fixtures, `course-zod-schema.ts`)
- `vibetest-app/src/app/courses/generated/*`

## Тесты

- `ng test --watch=false`: зелёный (6 файлов / 16 тестов)
- `ng build`: успешно

## Отклонения от TASK.md

- Локально сборка на Node **v26.7.0** (engines/nvmrc требуют 22 LTS).
- Доменный тип `Course` — `z.infer` из Zod-комposition, а не напрямую из `course.types.ts` (там `Step.content: unknown` из‑за `if/then`).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
