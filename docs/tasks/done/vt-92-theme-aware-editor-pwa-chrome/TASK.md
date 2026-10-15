# vt-92 — Подсветка редактора и PWA chrome по теме

## Контекст

После [`vt-53`](../../done/vt-53-practice-codemirror/) CodeMirror использует [`practice-codemirror-theme.ts`](../../../../vibetest-app/src/app/player/ui/code-editor/practice-codemirror-theme.ts) с CSS variables для фона/гуттеров, но **syntax highlighting** из `basicSetup` остаётся со стандартной светлой палитрой — при **тёмной** и **e-ink** темах (`data-theme`, [`vt-40`](../../done/vt-40-settings-themes/)) подсветка JS/SQL/regex **нечитаема**.

Отдельно: в установленном **PWA на телефоне** нижняя системная панель **белая** — в [`index.html`](../../../../vibetest-app/src/index.html) и [`manifest.webmanifest`](../../../../vibetest-app/public/manifest.webmanifest) нет `theme-color`, завязанного на активную тему.

## Цель

При переключении Светлая / Тёмная / E-ink подсветка токенов в редакторе практики остаётся контрастной; системный chrome браузера/PWA (в т.ч. нижняя панель на Android) совпадает с фоном приложения для выбранной темы.

## Требования

- **CodeMirror:** для каждой темы приложения — `HighlightStyle` / `syntaxHighlighting` (или theme-specific extensions) с цветами из design tokens (`--color-text`, `--color-accent`, при необходимости новые `--color-cm-*` в [`styles.scss`](../../../../vibetest-app/src/styles.scss)).
- Языки: **javascript**, **sql**, **regex (plain)** — одинаково читаемые во всех трёх темах; проверить ключевые, comment, string, keyword, regexp literal.
- **Переключение темы без перезагрузки:** при смене `data-theme` редактор обновляет подсветку (reconfigure compartment, `MutationObserver` на `document.documentElement`, или подписка через `ThemeService` — без утечек при destroy).
- **PWA / meta:**
  - Динамический `<meta name="theme-color">` (и при необходимости `color-scheme`) синхронный с [`apply-theme-to-document.ts`](../../../../vibetest-app/src/app/settings/apply-theme-to-document.ts).
  - Старт: inline script в `index.html` или начальный meta по `prefers-color-scheme` до bootstrap, чтобы не было белой вспышки.
  - `manifest.webmanifest`: разумный default `theme_color` / `background_color` (согласованы со light); понимать, что installed PWA может кэшировать manifest — документировать ручную проверку после деплоя.
- **SPEC:** уточнить абзац про CodeMirror (theme-aware highlighting) и PWA chrome.
- **Тесты:** unit на mapping theme → highlight extension или на reconfigure hook (без полного CM в каждом тесте); theme service / apply-theme — при изменении meta.

## Технические заметки

- Зависимости: `@codemirror/language`, `@lezer/highlight` (если ещё не в bundle).
- Папки: `player/ui/code-editor/`, `settings/`, `src/index.html`, `public/manifest.webmanifest`, `styles.scss`.
- E-ink: минимум оттенков, опора на контраст чёрный/серый (согласовано с e-ink palette).

## План работ

- [ ] CSS tokens для syntax (light/dark/eink)
- [ ] HighlightStyle + переключение при смене темы
- [ ] theme-color / color-scheme в apply-theme + bootstrap
- [ ] manifest defaults
- [ ] SPEC + тесты + ручная матрица тем (light/dark/eink) на одном JS/SQL/regex шаге

## Критерии готовности (Definition of Done)

- [ ] Подсветка читаема во всех трёх темах на js/sql/regex шагах
- [ ] Смена темы в Настройках сразу обновляет редактор без reload
- [ ] theme-color соответствует фону активной темы (desktop + mobile browser; PWA — по чеклисту)
- [ ] `ng test --watch=false` зелёный

## Вне рамок задачи

- Подсветка markdown/theory
- Перерисовка иконок PWA под тему
- Monaco / LSP
