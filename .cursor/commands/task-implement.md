---
name: task-implement
description: Взять задачу в работу — in-progress, ветка, реализация по TASK.md
---

# Реализация задачи vt-*

Ввод пользователя: `$ARGUMENTS` (номер `vt-{n}`, slug, путь к backlog-файлу или описание — что указал пользователь).

Определи задачу однозначно. Если неоднозначно — уточни у пользователя.

Критерии кода и архитектуры — в `.cursor/rules/angular-cli.mdc`. Спецификация: `docs/SPECIFICATION.md`.

## Старт (если задача ещё в backlog)

1. Найди `docs/tasks/backlog/vt-{n}-{slug}.md` (или создай in-progress из указанного файла).
2. Создай папку `docs/tasks/in-progress/vt-{n}-{slug}/`.
3. Перемести содержимое backlog в `TASK.md` (удали backlog-файл после переноса).
4. Создай `REPORT.md` из `docs/tasks/_template/REPORT.md`: frontmatter `branch: feature/vt-{n}-{slug}`, заголовок и плейсхолдеры по задаче.
5. Ветка: `git switch main` (актуализируй), `git switch -c feature/vt-{n}-{slug}`.
6. Одна задача — одна feature-ветка.

## Реализация

1. Прочитай `TASK.md`, релевантные разделы SPEC, `REPORT.md`.
2. **Protected app:** правки в `vibetest-app/` только на этой ветке при существующей папке in-progress для этой задачи.
3. Реализуй по TASK; соблюдай smart/dumb, domain folders, strict TS, signals, тесты где уместно.
4. Обновляй `REPORT.md` (все секции кроме «Изменения по ревью» — по ходу работы).
5. Перед завершением: `ng test --watch=false` в `vibetest-app/`, если менялась логика с существующими тестами или добавлена нетривиальная логика.
6. WIP-коммиты на feature-ветке — по запросу пользователя; **merge не выполнять** без явной просьбы («merge vt-{n}», «merge to main»).

## Запрещено без явного запроса

- Merge, squash, push, перенос `in-progress/` → `done/`
- Правки `vibetest-app/` на `main` или без matching in-progress

## Ответ в чате

Краткий статус: ветка, что сделано, тесты, что осталось по TASK.
