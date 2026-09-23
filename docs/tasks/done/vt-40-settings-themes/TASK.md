# vt-40 — Вкладка «Настройки» и темы

## Контекст

Приложение использует светлые SCSS-стили без глобальной темы. Настройки пользователя (тема оформления) не сохраняются; Dexie v1 содержит только `courses` и `stepProgress` ([`vibetest-db.ts`](../../../vibetest-app/src/app/storage/vibetest-db.ts)).

Пользователям нужны **светлая**, **тёмная** и **e-ink** (высокий контраст, без лишних эффектов) темы с сохранением выбора между сессиями.

## Цель

Новая вкладка **«Настройки»** (lazy, после «Генерация промта»): выбор темы применяется **мгновенно** ко всему приложению и **сохраняется в IndexedDB**.

## Требования

### UI и навигация

- Route `settings` в [`app.routes.ts`](../../../vibetest-app/src/app/app.routes.ts); пункт **«Настройки»** в [`app-shell`](../../../vibetest-app/src/app/shared/ui/app-shell/app-shell.ts) после «Генерация промта».
- Vertical slice `vibetest-app/src/app/settings/`: smart page + dumb controls (radio group или select) для трёх тем.
- Подписи для пользователя: **Светлая**, **Тёмная**, **E-ink** (или согласованные русские названия).

### Модель темы

- Domain type: `Theme = 'light' | 'dark' | 'eink'` (в `settings/` или `shared/theme/`, без Dexie в domain).
- **Первый запуск** (нет записи в DB): тема по **`prefers-color-scheme`** — `dark` → dark, иначе light; **e-ink** только при ручном выборе.
- После явного выбора пользователя — **всегда** сохранённая тема (не следовать системе автоматически).

### IndexedDB

- Migration **v2**: bump [`VIBETEST_DB_VERSION`](../../../vibetest-app/src/app/storage/db-version.ts); таблица `settings` с key `theme` (или generic `key`/`value` — зафиксировать в TASK при реализации).
- Parser/repository в **`storage/`** only; [`settings-repository`](../../../vibetest-app/src/app/storage/) или аналог: `getTheme()`, `setTheme(theme)`.
- Тесты migration + repository (fake-indexeddb), по образцу vt-11/vt-12.

### Применение темы

- `ThemeService` (`providedIn: 'root'`, `signal`): load on app/shell init, `setTheme()` → update signal + persist + apply to DOM.
- Root: `document.documentElement` attribute `data-theme="light|dark|eink"` (или class на `html`).
- [`styles.scss`](../../../vibetest-app/src/styles.scss): CSS variables для фона, текста, границ, акцентных кнопок:
  - **light** — текущая палитра (baseline);
  - **dark** — тёмный фон, светлый текст, контрастные ссылки/кнопки;
  - **eink** — ч/б, высокий контраст, **без** box-shadow/градиентов где возможно, `prefers-reduced-motion` / отключение transition на декоративных элементах.
- Постепенно перевести ключевые компоненты на variables (shell, cards, player) — минимум для читаемости всех вкладок; не обязательно переписать каждый hex в одном PR, но критерий — все primary routes usable во всех трёх темах.

### Документация и тесты

- SPEC: раздел «Экраны» — **Настройки**; навигация; хранение темы.
- Unit: `resolveInitialTheme(matchMedia, stored)`, ThemeService apply `data-theme`, settings page persistence mock.
- `ng test --watch=false` зелёный.

## Технические заметки

- CLI: `ng g component settings/pages/settings-page --standalone`.
- Не хранить тему в `localStorage` (только IndexedDB per user request).
- Smart page orchestrates; dumb theme picker emits selection.

## План работ

- [x] Dexie v2 + settings repository + tests
- [x] Theme types, ThemeService, global CSS variables
- [x] Settings page, routes, shell nav
- [x] Refactor critical SCSS to variables (shell, lists, player minimum)
- [x] SPEC, REPORT, `ng test --watch=false`

## Критерии готовности (Definition of Done)

- [x] Три темы переключаются мгновенно и сохраняются после перезагрузки
- [x] Первый запуск следует system light/dark до ручного выбора
- [x] Тесты storage/theme зелёные; SPEC обновлён

## Вне рамок задачи

- Произвольный color picker, размер шрифта, язык UI
- Sync настроек между устройствами / backend
- Авто-переключение по system после того, как пользователь уже выбрал тему
- Отдельная тема только для плеера
