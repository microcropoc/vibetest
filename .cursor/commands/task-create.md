---
name: task-create
description: Создать backlog-задачу vt-{n} в docs/tasks/backlog
---

# Создание задачи (backlog)

Ввод пользователя: `$ARGUMENTS`

Если `$ARGUMENTS` пустой или недостаточен для заполнения TASK (нет цели/требований) — задай 1–2 уточняющих вопроса и **не создавай файл**, пока не будет достаточно контекста.

## Нумерация и slug

1. Найди все `vt-*` в `docs/tasks/backlog/`, `docs/tasks/in-progress/`, `docs/tasks/done/`, `docs/tasks/archive/` (рекурсивно).
2. `{n}` = max номера + 1.
3. `{slug}` — kebab-case из краткого названия задачи (латиница, цифры, дефисы).

## Файл

- Путь: `docs/tasks/backlog/vt-{n}-{slug}.md`
- Шаблон: `docs/tasks/_template/backlog-task.md`
- Замени плейсхолдеры `{n}`, название, контекст, цель, требования, план, DoD — по смыслу из `$ARGUMENTS`.
- Не переносить задачу в `in-progress`, не создавать ветку, не трогать `vibetest-app/`.

## Ответ в чате

Кратко: номер `vt-{n}`, slug, путь к файлу и что ещё нужно уточнить (если что-то оставлено заглушкой).
