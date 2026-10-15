# vt-95 — Тёмная тема и системная панель по умолчанию

## Контекст

Первый запуск без записи в IndexedDB следует `prefers-color-scheme` ([`resolve-initial-theme.ts`](../../../../vibetest-app/src/app/settings/resolve-initial-theme.ts), vt-40): светлая система даёт светлую тему. До bootstrap тот же выбор делает inline-скрипт в [`index.html`](../../../../vibetest-app/src/index.html).

vt-92 синхронизирует `<meta name="theme-color">` с активной темой, но [`manifest.webmanifest`](../../../../vibetest-app/public/manifest.webmanifest) оставляет `theme_color` и `background_color` равными `#ffffff`. На установленном PWA (Samsung Galaxy, панель с системными кнопками) Android красит эту полоску цветом манифеста, запечённым в WebAPK при установке. Смена meta в рантайме её не перекрашивает: при тёмной теме приложения панель остаётся белой.

## Цель

Без сохранённой темы приложение сразу тёмное. Установленное PWA получает тёмный фон окна и тёмную системную панель (`#121212`, как `--color-bg` тёмной темы). Уже выбранные Светлая / Тёмная / E-ink не сбрасываются.

## Требования

- **Тема по умолчанию:** нет ключа `theme` в `settings` → `dark`, независимо от `prefers-color-scheme`. Сохранённое значение по-прежнему побеждает. E-ink только вручную.
- **Старт до Angular:** inline-скрипт в `index.html` выставляет `data-theme="dark"`, `theme-color` `#121212`, `color-scheme` `dark`. Не читать систему, чтобы не было белой вспышки и первая meta, которую может снять WebAPK, была тёмной.
- **Манифест:** `theme_color` и `background_color` — `#121212`. Runtime `<meta name="theme-color">` / `color-scheme` по-прежнему следуют активной теме (светлая и e-ink остаются `#ffffff` в meta).
- **SPEC:** первый запуск — тёмная тема; манифест — тёмный дефолт chrome. Зафиксировать ограничение: уже установленное PWA не подхватывает новый цвет, пока иконку не удалили и не установили заново; на Samsung нижняя панель с кнопками остаётся цветом установки и не следует переключению на светлую / e-ink.
- **Тесты:** `resolveInitialTheme` — нет записи → `dark` и при `prefersDark: false`, и при `prefersDark: true`; сохранённые `light` / `eink` не меняются.

## Технические заметки

- Папки: `settings/` (`resolve-initial-theme.ts`, начальное значение сигнала в `ThemeService`, если оно читается до `initialize`), `src/index.html`, `public/manifest.webmanifest`, `docs/SPECIFICATION.md`.
- Цвет chrome тёмной темы уже в [`theme-chrome-colors.ts`](../../../../vibetest-app/src/app/settings/theme-chrome-colors.ts) (`#121212`). Не плодить второй hex.
- Смена манифеста не обновляет WebAPK сама по себе. В отчёте — шаг ручной проверки: удалить иконку, установить PWA заново, открыть с домашнего экрана (без адресной строки).

## План работ

- [x] `resolveInitialTheme` + спека: дефолт `dark`
- [x] Bootstrap в `index.html` всегда dark / `#121212`
- [x] `manifest.webmanifest`: `theme_color` и `background_color` `#121212`
- [x] SPEC: дефолт темы и ограничение chrome установленного PWA

## Критерии готовности (Definition of Done)

- [x] Новый профиль без записи `theme` открывается в тёмной теме и на светлой системе
- [x] Сохранённые Светлая и E-ink после обновления приложения те же
- [x] Манифест и первая meta — `#121212`
- [x] `ng test --watch=false` зелёный
- [ ] Ручная проверка на телефоне после переустановки PWA: системная панель тёмная при тёмной теме

## Вне рамок задачи

- Заставить системную панель Samsung следовать светлой теме и e-ink после установки
- Автоматическая переустановка PWA / смена иконок
- Палитры тем и подсветка редактора
