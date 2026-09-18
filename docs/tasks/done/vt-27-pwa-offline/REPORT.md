---
branch: feature/vt-27-pwa-offline
---

# Отчёт vt-27 — PWA и offline

## Что сделано

- **`@angular/pwa`**: `ngsw-config.json`, `manifest.webmanifest`, icons, `provideServiceWorker` только вне dev mode; production `serviceWorker` в `angular.json`.
- **`ngsw-config`**: lazy assets + `/sql-wasm.wasm`, `/schemas/**`, PWA icons.
- **`PwaUpdateService`**: `SwUpdate.checkForUpdate`, баннер «Обновить» в `AppShell`.

## Изменённые файлы

- `vibetest-app/ngsw-config.json`, `public/manifest.webmanifest`, `public/icons/*`
- `vibetest-app/angular.json`, `package.json`, `package-lock.json`
- `vibetest-app/src/app/app.config.ts`, `src/index.html`
- `vibetest-app/src/app/shared/pwa/*`
- `vibetest-app/src/app/shared/ui/app-shell/*`

## Тесты

- `ng test --watch=false`: 58 files, 158 tests — зелёный
- `ng build`: зелёный; в `dist/.../browser/` есть `ngsw-worker.js`, `ngsw.json`

## Ручная проверка offline (MVP)

1. `cd vibetest-app && npx ng build` (production по умолчанию).
2. Раздать `dist/vibetest-app/browser` статическим сервером, например `npx serve dist/vibetest-app/browser -s`.
3. Открыть приложение, импортировать курс, пройти хотя бы один шаг (при SQLite-практике один раз подтянется `sql-wasm.wasm`).
4. DevTools → Application → Service Workers: SW зарегистрирован.
5. Offline в DevTools → перезагрузка: shell и навигация работают; список курсов и прогресс из IndexedDB; ранее посещённые lazy-страницы доступны из кэша SW.
6. Новый деплой (пересборка) → при `VERSION_READY` баннер «Обновить» в шапке.

## Отклонения от TASK.md

- `@angular/service-worker@22.1.6` — выровнен с установленным `@angular/core@22.1.6` (peer resolve после `ng add`).

## Открытые вопросы к ревью

- Нет.

## Изменения по ревью

_(после замечаний пользователя)_
