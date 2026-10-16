---
name: task-merge
description: Завершить задачу vt-* — перенос в done, rebase, squash, fast-forward merge в main и push
---

# Завершение и merge задачи vt-*

Ввод пользователя: `$ARGUMENTS` (например `vt-87`, путь к папке задачи или пусто — тогда определить из текущей ветки `feature/vt-{n}-{slug}`).

Вызов `/task-merge` является явным разрешением пользователя на перенос задачи в `done/`, squash, merge в `main`, push и удаление feature-ветки.

Определи задачу однозначно. Если неоднозначно — уточни у пользователя.

## Подготовка и проверки

1. Определи `vt-{n}-{slug}` и убедись, что текущая ветка — `feature/vt-{n}-{slug}` (если нет — переключись на неё).
2. Проверь `git status`: если есть незакоммиченные изменения задачи (например, финальная запись ревью в `REPORT.md`), закоммить их на feature-ветку (`vt-{n}: {краткое описание}`).
3. Убедись, что папка `docs/tasks/in-progress/vt-{n}-{slug}/` существует и `REPORT.md` заполнен.

## Шаги merge (строго по порядку)

1. **Перенос в `done/`:**
   - Перемести `docs/tasks/in-progress/vt-{n}-{slug}` → `docs/tasks/done/vt-{n}-{slug}` (`git mv`) и закоммить на feature-ветке (`vt-{n}: move task folder to done`).
2. **Актуализация и rebase:**
   - Обнови `main` (`git fetch origin main`) и выполни `git rebase main` на ветке `feature/vt-{n}-{slug}` (конфликты разрешаются только на feature-ветке).
3. **Squash на feature-ветке:**
   - Сформируй итоговое сообщение коммита `vt-{n}: {short summary}` (при необходимости — краткое тело коммита), **покажи его в чате**, затем выполни:
     `git reset --soft main && git commit -m "vt-{n}: {short summary}"`
   - Запомни короткий хеш squash-коммита (`git rev-parse --short HEAD`).
4. **Fast-forward merge в `main`:**
   - `git switch main && git merge --ff-only feature/vt-{n}-{slug}`
5. **Запись хеша merge в `REPORT.md`:**
   - Добавь `merged: "{short_hash}"` во frontmatter `docs/tasks/done/vt-{n}-{slug}/REPORT.md` (хеш squash-коммита из шага 3).
   - Закоммить на `main`:
     `git add docs/tasks/done/vt-{n}-{slug}/REPORT.md && git commit -m "vt-{n}: record merge commit in REPORT"`
6. **Push и очистка ветки:**
   - `git push origin main`
   - Удали локальную ветку: `git branch -d feature/vt-{n}-{slug}` (удалённую — если существует на origin).

## Инварианты

- Код из `vibetest-app/` не должен попасть в `main`, пока папка задачи ещё в `in-progress/`.
- Прямые коммиты в `vibetest-app/` на `main` запрещены; попадание кода в `main` — только через этот merge-workflow.

## Ответ в чате

Кратко: номер задачи, хеш squash-коммита, хеш коммита с `merged` в `REPORT.md`, статус `push` и удаления ветки.
