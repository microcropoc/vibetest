# vt-29 — Развёртывание через GitHub Pages

## Контекст

PWA собирается production build с Service Worker; нужен автоматический деплой на `https://microcropoc.github.io/vibetest/`.

## Цель

При push в `main` (и вручную) GitHub Actions публикует SPA/PWA на GitHub Pages с корректным base path и SPA fallback.

## Требования

- Workflow: Node 22, `npm ci`, тесты, `ng build --base-href /vibetest/`, `404.html` для client routing.
- Artifact: `vibetest-app/dist/vibetest-app/browser`.
- Permissions: `contents: read`, `pages: write`, `id-token: write`.

## Критерии готовности (Definition of Done)

- [ ] Workflow в `.github/workflows/deploy-pages.yml`
- [ ] Локально проверен build с `/vibetest/` base href
- [ ] REPORT с URL и шагом Settings → Pages → GitHub Actions
