---
branch: feature/vt-92-theme-aware-editor-pwa-chrome
---

# Отчёт vt-92 — Подсветка редактора и PWA chrome по теме

## Что сделано

- CSS tokens `--color-cm-*` для light / dark / eink в `styles.scss`.
- `practiceCodeEditorSyntaxHighlighting()` — HighlightStyle на CSS variables; подключено в `mountPracticeCodeEditor` после `basicSetup`.
- `MutationObserver` на `data-theme` → `view.requestMeasure()` при смене темы; disconnect в `destroy`.
- `theme-chrome-colors.ts`, `applyThemeChromeMeta` в `apply-theme-to-document.ts` (вызывается из `ThemeService`).
- Inline bootstrap в `index.html` — начальный `data-theme`, `theme-color`, `color-scheme` по `prefers-color-scheme`.
- `manifest.webmanifest`: `theme_color` / `background_color` `#ffffff`.
- SPEC: CodeMirror highlighting, настройки (meta), PWA.

## Изменённые файлы

- `vibetest-app/src/styles.scss`
- `vibetest-app/src/app/player/ui/code-editor/practice-codemirror-highlight.ts` (+ spec)
- `vibetest-app/src/app/player/ui/code-editor/practice-codemirror-host.ts`
- `vibetest-app/src/app/settings/theme-chrome-colors.ts`
- `vibetest-app/src/app/settings/apply-theme-to-document.ts` (+ spec)
- `vibetest-app/src/index.html`
- `vibetest-app/public/manifest.webmanifest`
- `docs/SPECIFICATION.md`

## Тесты

- `ng test --watch=false`: **739** зелёных (highlight spec проверяет класс `function` → `var(--color-cm-keyword)`)

## Ручная проверка (DoD)

- [ ] JS / SQL / regex шаг: подсветка читаема в light, dark, eink
- [ ] Смена темы в Настройках — редактор без reload
- [ ] Mobile browser / PWA: `theme-color` совпадает с фоном (manifest после установки — по чеклисту SPEC)

## Отклонения от TASK.md

- Подсветка не пересобирается compartment'ом: `HighlightStyle` без `fallback` задаёт основные классы токенов через `var(--color-cm-*)`, поэтому смена `data-theme` меняет цвета без reconfigure. `MutationObserver` остаётся для пересчёта вью.

## Открытые вопросы к ревью

-

## Изменения по ревью

Ревью (2026-10-15), ветка `feature/vt-92-theme-aware-editor-pwa-chrome`.

- **Своя подсветка не применяется** — исправлено: `syntaxHighlighting` без `{ fallback: true }`, стиль идёт в основной `highlighterFacet` и перекрывает светлый `defaultHighlightStyle` из `basicSetup`. Спека монтирует JS-редактор и проверяет, что класс ключевого слова ссылается на `var(--color-cm-keyword)`, а не на `#708`.

Ревью (2026-10-15, раунд 2). Проверено: `practiceCodeEditorSyntaxHighlighting` больше не передаёт `fallback`, поэтому стиль попадает в основной highlighter и перекрывает `defaultHighlightStyle`. Спека смотрит CSS-правило класса `function`.

Замечаний нет.
