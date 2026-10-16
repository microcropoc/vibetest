---
name: task-merge
description: Завершить задачу vt-* — перенос в done, rebase, squash, fast-forward merge в main и push
---

# Merge задачи vt-*

Ввод пользователя: `$ARGUMENTS`

Явное разрешение на `done/`, squash, merge в `main`, push. Инварианты — `.cursor/rules/angular-cli.mdc`.

## Проверки

1. Ветка `feature/vt-{n}-{slug}`; незакоммиченное — закоммить (`vt-{n}: …`).
2. `docs/tasks/in-progress/vt-{n}-{slug}/` и заполненный `REPORT.md`.
3. Последний раунд в `## Изменения по ревью` — **`Замечаний нет.`** (или все раунды с `### Исправлено N`). Иначе — стоп, нужны `/task-review` + `/task-implement` (режим Б).

## Шаги

1. `git mv docs/tasks/in-progress/vt-{n}-{slug}` → `docs/tasks/done/vt-{n}-{slug}`; коммит `vt-{n}: move task folder to done`
2. `git switch main && git pull --ff-only`
3. `git switch feature/vt-{n}-{slug} && git rebase main` (конфликты только на feature-ветке)
4. Если rebase подтянул новые коммиты с `main` — `ng test --watch=false` в `vibetest-app/`
5. Показать в чате сообщение squash, затем: `git reset --soft main && git commit -m "vt-{n}: {short summary}"`; запомнить `git rev-parse --short HEAD`
6. `git switch main && git merge --ff-only feature/vt-{n}-{slug}`
7. Frontmatter `docs/tasks/done/vt-{n}-{slug}/REPORT.md`: `merged: "{short_hash}"`; коммит на `main`: `vt-{n}: record merge commit in REPORT`
8. `git push origin main`
9. `git branch -d feature/vt-{n}-{slug}`

## Ответ в чате

Задача, хеш squash, хеш коммита с `merged`, push, удаление локальной ветки.
