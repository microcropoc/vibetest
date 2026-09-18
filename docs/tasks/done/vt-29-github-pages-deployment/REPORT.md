---
branch: feature/vt-29-github-pages-deployment
---

# Отчёт vt-29 — Развёртывание через GitHub Pages

## Что сделано

- Workflow [`.github/workflows/deploy-pages.yml`](../../../.github/workflows/deploy-pages.yml): checkout, Node 22, `npm ci`, `npm test -- --watch=false`, production `ng build --base-href /vibetest/`, копия `index.html` → `404.html` для SPA на GitHub Pages, `upload-pages-artifact` + `deploy-pages`.
- Триггеры: push в `main`, `workflow_dispatch`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`; concurrency group `pages`.

## Изменённые файлы

- `.github/workflows/deploy-pages.yml` (новый)
- `docs/tasks/in-progress/vt-29-github-pages-deployment/` — TASK, REPORT

## Тесты

- `npm test -- --watch=false`: 58 files, 158 tests — зелёный
- `npm run build -- --base-href /vibetest/`: зелёный; в `dist/vibetest-app/browser/` есть `index.html` (`<base href="/vibetest/">`), `404.html`, `ngsw.json`, `ngsw-worker.js`, `manifest.webmanifest`, `sql-wasm.js`, `sql-wasm.wasm`, practice worker chunks (`worker-*.js`)

## Развёртывание

- **URL:** https://microcropoc.github.io/vibetest/
- **Автоматически:** merge/push в `main` (workflow срабатывает на push в `main`)
- **Вручную:** GitHub → Actions → «Deploy to GitHub Pages» → Run workflow
- **Один раз в репозитории:** Settings → Pages → Build and deployment → Source: **GitHub Actions** (не «Deploy from a branch»). Без этого шага job `deploy` не опубликует сайт.

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- После merge в `main` проверить первый успешный run Actions и открытие PWA по URL выше.

## Изменения по ревью

_(после замечаний пользователя)_
