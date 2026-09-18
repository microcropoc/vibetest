---
branch: feature/vt-11-dexie-schema-migrations
---

# Отчёт vt-11 — Dexie schema и migrations

## Что сделано

- Зависимости `dexie`, dev `fake-indexeddb`.
- `VibetestDb`: таблицы `courses`, `stepProgress`, версия `VIBETEST_DB_VERSION = 1`.
- Типы строк `CourseRow`, `StepProgressRow`; ключ `buildStepProgressKey` / `parseStepProgressKey`.
- `deleteCourseAndProgress` — одна транзакция (курс + прогресс по `courseId`).
- Тесты: ключ, open/put/get, query by `courseId`, delete transaction.

## Изменённые файлы

- `vibetest-app/package.json`, `package-lock.json`
- `vibetest-app/src/app/storage/*` (новый)

## Тесты

- `npx ng test --watch=false`: 72 passed.

## Отклонения от TASK.md

- Нет.

## Модель строк

- **`courses`:** `{ courseId, course }` — `course` — domain `Course` (полный JSON документа).
- **`stepProgress`:** PK `progressKey` = `${courseId}::${moduleId}::${stepId}`; поля `type`, `status`, `lastCheckFailed`, optional `draft` (`unknown` до parse в repository).

## Миграции

- `VIBETEST_DB_VERSION = 1`; схема в `vibetest-db.ts` (`version(1).stores(...)`). Следующие версии — новые `this.version(n)` в том же классе.

## Открытые вопросы к ревью

- Repositories (vt-12/14) будут маппить `draft` ↔ `StepProgressSnapshot`.

## Изменения по ревью

_(после замечаний пользователя)_
