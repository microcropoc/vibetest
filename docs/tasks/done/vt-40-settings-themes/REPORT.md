---
branch: feature/vt-40-settings-themes
---

# Отчёт vt-40 — Вкладка «Настройки» и темы

## Что сделано

- Dexie **v2**: таблица `settings` (key `theme` → `light` | `dark` | `eink`); `SettingsRepository`.
- Domain: `Theme`, `resolveInitialTheme`, `parseTheme`, `applyThemeToDocument`.
- `ThemeService` + `APP_INITIALIZER`: загрузка из IndexedDB или `prefers-color-scheme`; `setTheme` сохраняет и выставляет `data-theme` на `documentElement`.
- Вкладка **Настройки** (`/settings`), lazy route, пункт nav; dumb `app-theme-picker`.
- Глобальные CSS variables для light/dark/eink; ключевые SCSS (shell, cards, player, страницы) переведены на variables.
- SPEC: навигация, таблица `settings`, экран «Настройки».

## Изменённые файлы

- `vibetest-app/src/styles.scss`
- `vibetest-app/src/app/app.config.ts`, `app.routes.ts`
- `vibetest-app/src/app/storage/*` (db v2, settings repository)
- `vibetest-app/src/app/settings/**`
- `vibetest-app/src/app/shared/ui/app-shell/*`
- SCSS: confirm-dialog, courses, statistics, import, info, prompt-generation, player UI
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: **зелёный** (70 files, 195 tests)

## Отклонения от TASK.md

- Нет.

## Открытые вопросы к ревью

- E-ink: индикаторы шагов опираются на border для контраста; при необходимости можно усилить паттерн заливки.

## Изменения по ревью

_(после замечаний пользователя)_
