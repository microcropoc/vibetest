# vt-39 — Адаптивный дизайн (mobile-first)

## Контекст

MVP ориентирован на **touch** (SPEC: плеер, навигация кнопками). Стили сейчас в основном фиксированные отступы и `flex-wrap` в shell; глобальный [`styles.scss`](../../../vibetest-app/src/styles.scss) почти пуст. На узких экранах (320–375 px) возможны переносы навигации, горизонтальный overflow у длинного контента (schema `<pre>`, SVG, code blocks) и тесные touch targets.

## Цель

**Mobile-first** адаптивная вёрстка **всего приложения**: shell, вкладки (курсы, статистика, импорт, инфо, генерация промта), списки модулей и **плеер** — без горизонтального overflow страницы (кроме явно прокручиваемых зон: nav scroll, step indicators, code blocks).

## Требования

### Shell ([`app-shell`](../../../vibetest-app/src/app/shared/ui/app-shell/))

- Минимальная ширина viewport: **320 px**.
- **Навигация** на узком экране: **одна строка**, **горизонтальный скролл** (`overflow-x: auto`), без переноса вкладок на вторую строку; видимая активная вкладка, `-webkit-overflow-scrolling: touch`.
- PWA update banner, `main`, footer — без выхода за viewport; [`app-shell__version`](../../../vibetest-app/src/app/shared/ui/app-shell/app-shell.scss) — перенос длинного subject.

### Страницы и карточки

- **Курсы / статистика / модули:** одна колонка карточек на мобильном; на широком экране — ограниченная max-width контента и/или сетка (2 колонки при достаточной ширине), без «растягивания» на ultra-wide без пользы.
- **Импорт, генерация промта:** textarea и toolbar — вертикальный stack на узких экранах; кнопки full-width или min touch **44×44 px** (или padding до эквивалента).
- **Инфо:** `<pre>` schema — только внутренний scroll (`overflow-x: auto`), не ломает страницу.
- **Confirm dialog:** usable на 320 px (отступы, кнопки не обрезаются).

### Плеер

- [`step-indicator-bar`](../../../vibetest-app/src/app/player/ui/step-indicator-bar/): горизонтальная прокрутка индикаторов на узком экране.
- [`player-nav`](../../../vibetest-app/src/app/player/ui/player-nav/), theory/quiz/practice/svg shells: контент и кнопки не обрезаются; длинный Markdown/code/SVG — scroll внутри контейнера, `max-width: 100%`.

### Общее

- Breakpoints для проверки (ручная/браузерная матрица): **320, 375, 768, 1024, 1440** px.
- Критерий: `document.documentElement.scrollWidth <= clientWidth` на типовых страницах (кроме intentional horizontal scroll areas).
- Обновить [`docs/SPECIFICATION.md`](../../SPECIFICATION.md) — краткий подраздел про адаптивность / touch layout.

## Технические заметки

- SCSS, BEM-like; media queries в компонентных `*.scss`.
- Общие tokens (например `--page-padding`, `--content-max-width`) в [`styles.scss`](../../../vibetest-app/src/styles.scss) **только** если снижают дублирование между страницами.
- Без изменения маршрутов, signals-логики и player orchestration.
- Component tests **не** assert CSS/media; существующие behavior tests должны остаться зелёными.

## План работ

- [x] Shell nav horizontal scroll + padding tokens
- [x] Lists/cards/pages (courses, statistics, modules, import, info, prompt-generation)
- [x] Player (indicators, nav, step UIs)
- [x] SPEC + ручная матрица в REPORT; `ng test --watch=false`

## Критерии готовности (Definition of Done)

- [x] Матрица 320–1440 px пройдена без page-level horizontal overflow
- [x] Touch targets и scrollable regions соответствуют требованиям
- [x] `ng test --watch=false` зелёный
- [x] SPEC обновлён

## Вне рамок задачи

- Новая дизайн-система / rebrand / dark mode
- Desktop-only редизайн (sidebar вместо top nav)
- Изменение поведения плеера или горячие клавиши
- E2E/visual regression automation (можно описать в REPORT как follow-up)
