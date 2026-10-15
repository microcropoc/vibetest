---
branch: feature/vt-95-default-dark-theme-chrome
---

# Отчёт vt-95 — Тёмная тема и системная панель по умолчанию

## Что сделано

- `resolveInitialTheme`: нет записи `theme` → `dark`, `prefers-color-scheme` не учитывается. Сохранённые `light` / `eink` / `dark` без изменений.
- Начальное значение сигнала `ThemeService` — `dark`.
- Inline-скрипт в `index.html` до Angular ставит `data-theme="dark"`, `theme-color` `#121212`, `color-scheme` `dark`.
- `manifest.webmanifest`: `theme_color` и `background_color` `#121212`.
- SPEC: дефолт тёмной темы и ограничение chrome установленного PWA (Samsung, переустановка иконки).

## Изменённые файлы

- `vibetest-app/src/app/settings/resolve-initial-theme.ts` (+ spec)
- `vibetest-app/src/app/settings/theme.service.ts` (+ spec)
- `vibetest-app/src/index.html`
- `vibetest-app/public/manifest.webmanifest`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: **760** зелёных
- Браузер на `127.0.0.1:4200`: нет ключа `theme` в IndexedDB, эмуляция `prefers-color-scheme: light` — `data-theme="dark"`, meta `#121212` / `dark`, фон `rgb(18, 18, 18)`. Отданный `manifest.webmanifest` — `#121212`.

## Отклонения от TASK.md

- Нет

## Открытые вопросы к ревью

- Ручная проверка на телефоне: удалить иконку PWA, установить заново, открыть с домашнего экрана — нижняя панель с системными кнопками должна быть тёмной. Обновление service worker цвет уже установленного WebAPK не меняет.

## Изменения по ревью

Ревью (2026-10-15), ветка `feature/vt-95-default-dark-theme-chrome`, коммитов относительно `main` нет — смотрелся незакоммиченный код. SPEC не проверялся.

Замечаний нет.
