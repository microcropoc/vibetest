---
name: task-create
description: Создать backlog-задачу vt-{n} в docs/tasks/backlog
---

# Создание задачи (backlog)

Ввод пользователя: `$ARGUMENTS`

Если `$ARGUMENTS` пустой или недостаточен — задай 1–2 уточняющих вопроса и **не создавай файл**.

## Нумерация и slug

1. Все `vt-*` в `docs/tasks/{backlog,in-progress,done,archive}/` (рекурсивно).
2. `{n}` = max номера + 1; `{slug}` — kebab-case.

## Сверка (до записи файла)

1. Реальные пути в `vibetest-app/src/app/<domain>/` и `docs/SPECIFICATION.md` — без выдуманных сущностей и дублирования.
2. Пересечения в `docs/tasks/backlog/` и `in-progress/`; зависимости — только существующие `vt-*`.
3. Архитектура — `.cursor/rules/angular-cli.mdc`; DoD — проверяемый (`ng test --watch=false`, фикстуры, поведение).
4. Противоречие или развилка — спроси **до** записи.

## Файл и коммит

- Путь: `docs/tasks/backlog/vt-{n}-{slug}.md` по шаблону `docs/tasks/_template/backlog-task.md`.
- На ветке `main`: не переносить в `in-progress`, не создавать feature-ветку, не трогать `vibetest-app/`.
- После создания файла на `main` — закоммить: `vt-{n}: add backlog task` (чтобы backlog не уехал в чужую feature-ветку).

## Ответ в чате

`vt-{n}`, slug, путь, ключевые домены/файлы, допущения, что уточнить.
