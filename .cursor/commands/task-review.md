---
name: task-review
description: Код-ревью vt-* — diff + замечания в REPORT «Изменения по ревью»
---

# Код-ревью vt-*

Ввод пользователя: `$ARGUMENTS`

Критерии — `.cursor/rules/angular-cli.mdc`. Задача только в `docs/tasks/in-progress/vt-{n}-{slug}/` (не `done/` — ветка после merge удалена).

## Скоуп

`vt-{n}-{slug}` из `$ARGUMENTS` или ветки `feature/vt-{n}-{slug}`. Прочитать `TASK.md`, `REPORT.md`, релевантные разделы SPEC.

## Дифф

```bash
git status --short
git log --oneline main..HEAD
git diff $(git merge-base main HEAD)
```

(`git diff $(git merge-base main HEAD)` — закоммиченное на ветке, staged и unstaged относительно точки ответвления от `main`. Untracked из `git status --short` — прочитать отдельно.)

## Чеклист

- Соответствие `TASK.md`, SPEC и правилам проекта; отклонения — в REPORT (`## Отклонения от TASK.md`)
- Без лишнего scope; `vibetest-app/` только на feature-ветке задачи
- При изменении логики — ожидается зелёный `ng test --watch=false` (ревьюер **не** запускает тесты, только фиксирует ожидание в замечаниях при необходимости)

## Выход: только `## Изменения по ревью`

Дописать новый раунд (не затирать прошлые `### Исправлено N`):

```markdown
### Ревью N (YYYY-MM-DD)

- **что** → **где** → **ожидание**
```

или

```markdown
### Ревью N (YYYY-MM-DD)

Замечаний нет.
```

`N` — следующий номер раунда (1, 2, 3…).

**Запрещено без явной просьбы:** править код, тесты, TASK, SPEC, другие секции REPORT; коммит, merge.

## Ответ в чате

**ok** / **есть замечания** + номер раунда `N`. Не дублировать длинный список из REPORT.
