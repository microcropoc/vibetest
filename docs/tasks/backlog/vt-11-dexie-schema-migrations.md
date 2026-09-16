# vt-11 — Dexie schema и migrations

## Контекст

Спецификация требует IndexedDB: `courses`, `stepProgress`. Нужна инфраструктура Dexie с версиями и миграциями до repositories.

## Цель

В `storage/`: класс БД, схема таблиц по [SPECIFICATION.md](../../SPECIFICATION.md), начальная версия и задел под migrations; тесты на открытие БД и базовые операции (fake-indexeddb или аналог).

## Требования

- Таблица `courses`: key `courseId`, тело — JSON курса (как stored document или typed row — зафиксировать в `REPORT.md`).
- Таблица `stepProgress`: composite key `${courseId}::${moduleId}::${stepId}`; поля status, draft, lastCheckFailed (или эквивалент).
- Версионирование Dexie; миграции только в `storage/`.
- Domain types не импортируют Dexie.
- Тесты storage layer.

## Технические заметки

- Зависимость: **vt-2** (тип `Course` для понимания ключей; можно stub до merge vt-2).
- Папка: `storage/`.

## План работ

- [ ] Dexie app database class
- [ ] Schema v1 + types для rows
- [ ] Storage tests
- [ ] `ng test --watch=false` зелёный

## Критерии готовности (Definition of Done)

- [ ] Схема соответствует спецификации хранилища
- [ ] Нет UI и repositories (vt-12)

## Вне рамок задачи

- Course/progress repositories, import, экраны
